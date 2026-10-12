<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';

exigir_metodo('POST');
exigir_csrf();
iniciar_sessao();

$pre = $_SESSION['pre2fa'] ?? null;
if (!is_array($pre) || time() - (int)$pre['inicio'] > 600) {
    unset($_SESSION['pre2fa']);
    json_resposta(['erro' => 'Sua verificação expirou. Faça login novamente.', 'reiniciar' => true], 401);
}
if ((int)$pre['reenvios'] >= 5) {
    json_resposta(['erro' => 'Limite de reenvios atingido. Faça login novamente.', 'reiniciar' => true], 429);
}

$pdo = db();
$st = $pdo->prepare('SELECT ID_Usuario, Nome, Email, Metodo_2FA FROM USUARIO WHERE ID_Usuario = ?');
$st->execute([(int)$pre['uid']]);
$usuario = $st->fetch();
if (!$usuario || $usuario['Metodo_2FA'] !== 'email') {
    json_resposta(['erro' => 'Reenvio disponível apenas para verificação por e-mail.'], 400);
}

$st = $pdo->prepare('SELECT 1 FROM CODIGO_2FA WHERE ID_Usuario = ? AND Criado_Em > (NOW() - INTERVAL 30 SECOND)');
$st->execute([(int)$usuario['ID_Usuario']]);
if ($st->fetch()) {
    json_resposta(['erro' => 'Aguarde alguns segundos antes de pedir um novo código.'], 429);
}

$codigo = gerar_codigo_email((int)$usuario['ID_Usuario']);
if (!enviar_codigo_2fa($usuario['Email'], $usuario['Nome'], $codigo)) {
    json_resposta(['erro' => 'Não foi possível enviar o código. Tente novamente.'], 502);
}
$_SESSION['pre2fa']['reenvios'] = (int)$pre['reenvios'] + 1;

json_resposta(['ok' => true]);
