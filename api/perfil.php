<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';

// Atualiza nome, e-mail e CPF do usuário logado (tela "Minha conta").
exigir_metodo('POST');
exigir_csrf();
$usuario = exigir_login();
$d = corpo_json();

$nome  = texto_limpo(campo($d, 'nome'), 120);
$email = strtolower(trim(campo($d, 'email')));
$cpf   = limpar_cpf(campo($d, 'cpf') !== '' ? campo($d, 'cpf') : (string)$usuario['CPF']); // sem CPF no corpo: mantém o atual

$erros = [];
if (mb_strlen($nome) < 3)  $erros['nome']  = 'Informe seu nome completo.';
if (!email_valido($email)) $erros['email'] = 'Informe um e-mail válido.';
if (!cpf_valido($cpf))     $erros['cpf']   = 'Informe um CPF válido.';
if ($erros) {
    json_resposta(['erro' => 'Confira os dados informados.', 'campos' => $erros], 422);
}

$pdo = db();
$idUsuario = (int)$usuario['ID_Usuario'];

// Descobre QUAL campo já está em uso por outra conta (para a tela marcar o campo certo).
$st = $pdo->prepare('SELECT Email, CPF FROM USUARIO WHERE ID_Usuario <> ? AND (Email = ? OR CPF = ?)');
$st->execute([$idUsuario, $email, $cpf]);
foreach ($st->fetchAll() as $outro) {
    if ($outro['Email'] === $email) {
        json_resposta(['erro' => 'Este e-mail já possui cadastro.', 'campo' => 'email'], 409);
    }
    if ($outro['CPF'] === $cpf) {
        json_resposta(['erro' => 'Este CPF já possui cadastro.', 'campo' => 'cpf'], 409);
    }
}

try {
    $pdo->beginTransaction();
    $pdo->prepare('UPDATE USUARIO SET Nome = ?, Email = ?, CPF = ? WHERE ID_Usuario = ?')
        ->execute([$nome, $email, $cpf, $idUsuario]);
    $pdo->prepare(
        'UPDATE CLIENTE c JOIN USUARIO u ON u.ID_Cliente = c.ID_Cliente
         SET c.Nome = ?, c.Email = ?, c.CPF = ? WHERE u.ID_Usuario = ?'
    )->execute([$nome, $email, $cpf, $idUsuario]);
    $pdo->commit();
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    if ($e->getCode() === '23000') {
        json_resposta(['erro' => 'E-mail ou CPF já utilizado por outro cadastro.'], 409);
    }
    error_log('perfil.php: ' . $e->getMessage());
    json_resposta(['erro' => 'Não foi possível atualizar os dados.'], 500);
}

json_resposta(['ok' => true, 'usuario' => ['nome' => $nome, 'email' => $email, 'cpf' => $cpf, 'perfil' => $usuario['Perfil']]]);
