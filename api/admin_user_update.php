<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';

exigir_metodo('POST');
exigir_csrf();
exigir_master();
$d = corpo_json();

$idBruto = $d['id'] ?? 0;
$id = (is_int($idBruto) || (is_string($idBruto) && ctype_digit($idBruto))) ? (int)$idBruto : 0;
$nome = texto_limpo(campo($d, 'nome'), 120);
$email = strtolower(trim(campo($d, 'email')));
$cpf = limpar_cpf(campo($d, 'cpf'));
$nascimento = trim(campo($d, 'nascimento'));
$telefone = texto_limpo(campo($d, 'telefone'), 20);
$endereco = texto_limpo(campo($d, 'endereco'), 255);
$senha = campo($d, 'senha');

$erros = [];
if ($id <= 0) $erros['id'] = 'Usuário inválido.';
if (mb_strlen($nome) < 3) $erros['nome'] = 'Informe o nome completo.';
if (!email_valido($email)) $erros['email'] = 'Informe um e-mail válido.';
if (!cpf_valido($cpf)) $erros['cpf'] = 'CPF inválido.';
if (!idade_minima($nascimento, 18)) $erros['nascimento'] = 'Informe uma data válida; a conta precisa ser de uma pessoa maior de 18 anos.';
if ($senha !== '' && !senha_forte($senha)) $erros['senha'] = 'Use 8 ou mais caracteres com maiúscula, minúscula, número e símbolo.';

$telefoneDigitos = limpar_cpf($telefone);
$telefoneValido = (strlen($telefoneDigitos) === 10 && ($telefoneDigitos[2] ?? '') !== '9')
    || (strlen($telefoneDigitos) === 11 && ($telefoneDigitos[2] ?? '') === '9');
if ($telefone !== '' && (!preg_match('/^[\d\s()+-]+$/', $telefone) || !$telefoneValido)) {
    $erros['telefone'] = 'Informe um telefone com DDD e 8 ou 9 dígitos.';
}
if ($erros) {
    json_resposta(['erro' => 'Confira os dados informados.', 'campos' => $erros], 422);
}

$pdo = db();
$st = $pdo->prepare("SELECT ID_Cliente FROM USUARIO WHERE ID_Usuario = ? AND Perfil = 'comum'");
$st->execute([$id]);
$idCliente = $st->fetchColumn();
if ($idCliente === false) {
    json_resposta(['erro' => 'Usuário não encontrado (ou não é um usuário comum).'], 404);
}

try {
    $pdo->beginTransaction();
    $sqlUsuario = 'UPDATE USUARIO SET Nome = ?, Email = ?, CPF = ?';
    $parametrosUsuario = [$nome, $email, $cpf];
    if ($senha !== '') {
        $sqlUsuario .= ', Senha_Hash = ?';
        $parametrosUsuario[] = password_hash($senha, PASSWORD_DEFAULT);
    }
    $sqlUsuario .= ' WHERE ID_Usuario = ? AND Perfil = \'comum\'';
    $parametrosUsuario[] = $id;
    $pdo->prepare($sqlUsuario)->execute($parametrosUsuario);
    $pdo->prepare('DELETE FROM CODIGO_2FA WHERE ID_Usuario = ?')->execute([$id]);

    if ($idCliente !== null) {
        $pdo->prepare(
            'UPDATE CLIENTE SET Nome = ?, Email = ?, CPF = ?, Numero = ?, Dt_Nasc = ?, Endereco = ?
             WHERE ID_Cliente = ?'
        )->execute([$nome, $email, $cpf, $telefone ?: null, $nascimento, $endereco ?: null, (int)$idCliente]);
    } else {
        $pdo->prepare(
            'INSERT INTO CLIENTE (Nome, Email, Numero, Dt_Nasc, CPF, Endereco) VALUES (?, ?, ?, ?, ?, ?)'
        )->execute([$nome, $email, $telefone ?: null, $nascimento, $cpf, $endereco ?: null]);
        $pdo->prepare('UPDATE USUARIO SET ID_Cliente = ? WHERE ID_Usuario = ?')->execute([(int)$pdo->lastInsertId(), $id]);
    }
    $pdo->commit();
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    if ($e->getCode() === '23000') {
        json_resposta(['erro' => 'E-mail ou CPF já utilizado por outra conta.'], 409);
    }
    error_log('admin_user_update.php: ' . $e->getMessage());
    json_resposta(['erro' => 'Não foi possível atualizar a conta.'], 500);
}

json_resposta(['ok' => true, 'usuario' => ['id' => $id, 'nome' => $nome, 'email' => $email]]);
