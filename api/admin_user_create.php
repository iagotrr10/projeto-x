<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';

exigir_metodo('POST');
exigir_csrf();
exigir_master();
$d = corpo_json();

$nome = texto_limpo(campo($d, 'nome'), 120);
$email = strtolower(trim(campo($d, 'email')));
$cpf = limpar_cpf(campo($d, 'cpf'));
$nascimento = trim(campo($d, 'nascimento'));
$telefone = texto_limpo(campo($d, 'telefone'), 20);
$endereco = texto_limpo(campo($d, 'endereco'), 255);
$senha = campo($d, 'senha');
$metodo = campo($d, 'metodo_2fa');

$erros = [];
if (mb_strlen($nome) < 3) $erros['nome'] = 'Informe o nome completo.';
if (!email_valido($email)) $erros['email'] = 'Informe um e-mail válido.';
if (!cpf_valido($cpf)) $erros['cpf'] = 'CPF inválido.';
if (!idade_minima($nascimento, 18)) $erros['nascimento'] = 'Informe uma data válida; a conta precisa ser de uma pessoa maior de 18 anos.';
if (!senha_forte($senha)) $erros['senha'] = 'Use 8 ou mais caracteres com maiúscula, minúscula, número e símbolo.';
if (!in_array($metodo, ['email', 'totp'], true)) $erros['metodo_2fa'] = 'Escolha um método de verificação válido.';

$telefoneDigitos = limpar_cpf($telefone);
$telefoneValido = (strlen($telefoneDigitos) === 10 && ($telefoneDigitos[2] ?? '') !== '9')
    || (strlen($telefoneDigitos) === 11 && ($telefoneDigitos[2] ?? '') === '9');
if ($telefone !== '' && (!preg_match('/^[\d\s()+-]+$/', $telefone) || !$telefoneValido)) {
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
    )->execute([$nome, $email, $telefone ?: null, $nascimento, $cpf, $endereco ?: null]);
    $idCliente = (int)$pdo->lastInsertId();

    $pdo->prepare(
        "INSERT INTO USUARIO (Nome, Email, CPF, Senha_Hash, Perfil, Metodo_2FA, Totp_Secret, ID_Cliente)
         VALUES (?, ?, ?, ?, 'comum', ?, ?, ?)"
    )->execute([
        $nome,
        $email,
        $cpf,
        password_hash($senha, PASSWORD_DEFAULT),
        $metodo,
        $secret,
        $idCliente,
    ]);
    $pdo->commit();
} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    if ($e->getCode() === '23000') {
        json_resposta(['erro' => 'Já existe uma conta com este e-mail ou CPF.'], 409);
    }
    error_log('admin_user_create.php: ' . $e->getMessage());
    json_resposta(['erro' => 'Não foi possível criar a conta de teste.'], 500);
}

$resposta = ['ok' => true, 'usuario' => ['nome' => $nome, 'email' => $email], 'metodo_2fa' => $metodo];
if ($secret !== null) {
    $resposta['totp_secret'] = $secret;
    $resposta['totp_uri'] = totp_uri($secret, $email);
}
json_resposta($resposta, 201);
