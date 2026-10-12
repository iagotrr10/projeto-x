<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';

exigir_metodo('POST');
exigir_csrf();
$d = corpo_json();

$nome   = texto_limpo(campo($d, 'nome'), 120);
$email  = strtolower(trim(campo($d, 'email')));
$cpf    = limpar_cpf(campo($d, 'cpf'));
$nasc   = trim(campo($d, 'nascimento'));
$fone   = texto_limpo(campo($d, 'telefone'), 20);
$ender  = texto_limpo(campo($d, 'endereco'), 255);
$senha  = campo($d, 'senha');
$metodo = campo($d, 'metodo_2fa') ?: 'email';

$erros = [];
if (mb_strlen($nome) < 3)                        $erros['nome']       = 'Informe seu nome completo.';
if (!email_valido($email))                       $erros['email']      = 'Informe um e-mail válido.';
if (!cpf_valido($cpf))                           $erros['cpf']        = 'CPF inválido.';
if (!idade_minima($nasc, 18))                    $erros['nascimento'] = 'É preciso ter 18 anos ou mais.';
if (!senha_forte($senha))                        $erros['senha']      = 'Senha fraca: use 8+ caracteres com maiúscula, minúscula, número e símbolo.';
if (!in_array($metodo, ['email', 'totp'], true)) $erros['metodo_2fa'] = 'Escolha um método de verificação válido.';
$foneDigitos = limpar_cpf($fone);
$tamanhoTelefoneValido = (strlen($foneDigitos) === 10 && ($foneDigitos[2] ?? '') !== '9')
    || (strlen($foneDigitos) === 11 && ($foneDigitos[2] ?? '') === '9');
if ($fone !== '' && (!preg_match('/^[\d\s()+-]+$/', $fone) || !$tamanhoTelefoneValido)) {
    $erros['telefone'] = 'Informe um telefone com DDD e 8 ou 9 dígitos.';
}

if ($erros) {
    json_resposta(['erro' => 'Confira os dados informados.', 'campos' => $erros], 422);
}

$secret = $metodo === 'totp' ? totp_gerar_secret() : null;
$pdo = db();

try {
    $pdo->beginTransaction();

    $pdo->prepare(
        'INSERT INTO CLIENTE (Nome, Email, Numero, Dt_Nasc, CPF, Endereco) VALUES (?, ?, ?, ?, ?, ?)'
    )->execute([$nome, $email, $fone ?: null, $nasc, $cpf, $ender ?: null]);
    $idCliente = (int)$pdo->lastInsertId();

    $pdo->prepare(
        "INSERT INTO USUARIO (Nome, Email, CPF, Senha_Hash, Perfil, Metodo_2FA, Totp_Secret, ID_Cliente)
         VALUES (?, ?, ?, ?, 'comum', ?, ?, ?)"
    )->execute([$nome, $email, $cpf, password_hash($senha, PASSWORD_DEFAULT), $metodo, $secret, $idCliente]);

    $pdo->commit();
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    if ($e->getCode() === '23000') {
        json_resposta(['erro' => 'Já existe um cadastro com este e-mail ou CPF.'], 409);
    }
    error_log('register.php: ' . $e->getMessage());
    json_resposta(['erro' => 'Não foi possível concluir o cadastro. Tente novamente.'], 500);
}

$resposta = ['ok' => true, 'metodo_2fa' => $metodo];
if ($secret !== null) {
    // Mostrado uma única vez para o usuário cadastrar no app autenticador.
    $resposta['totp_secret'] = $secret;
    $resposta['totp_uri']    = totp_uri($secret, $email);
}
json_resposta($resposta, 201);
