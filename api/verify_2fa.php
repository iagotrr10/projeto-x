<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';

exigir_metodo('POST');
exigir_csrf();
$d = corpo_json();
iniciar_sessao();

$pre = $_SESSION['pre2fa'] ?? null;
if (!is_array($pre) || time() - (int)$pre['inicio'] > 600) {
    unset($_SESSION['pre2fa']);
    json_resposta(['erro' => 'Sua verificação expirou. Faça login novamente.', 'reiniciar' => true], 401);
}

$codigo = preg_replace('/\D/', '', campo($d, 'codigo')) ?? '';
if (strlen($codigo) !== 6) {
    json_resposta(['erro' => 'Digite os 6 dígitos do código.'], 422);
}

$pdo = db();
$st = $pdo->prepare('SELECT ID_Usuario, Nome, Email, CPF, Perfil, Metodo_2FA, Totp_Secret, Senha_Hash FROM USUARIO WHERE ID_Usuario = ?');
$st->execute([(int)$pre['uid']]);
$usuario = $st->fetch();
if (!$usuario) {
    unset($_SESSION['pre2fa']);
    json_resposta(['erro' => 'Usuário não encontrado. Faça login novamente.', 'reiniciar' => true], 401);
}
if (!isset($pre['senha_hash']) || !hash_equals((string)$pre['senha_hash'], (string)$usuario['Senha_Hash'])) {
    unset($_SESSION['pre2fa']);
    json_resposta(['erro' => 'A senha da conta foi alterada. Faça login novamente.', 'reiniciar' => true], 401);
}

$ip = ip_cliente();
if (login_bloqueado($usuario['Email'], $ip)) {
    unset($_SESSION['pre2fa']);
    json_resposta(['erro' => 'Muitas tentativas. Aguarde 15 minutos e tente novamente.', 'reiniciar' => true], 429);
}

$valido = $usuario['Metodo_2FA'] === 'totp'
    ? totp_verificar((string)$usuario['Totp_Secret'], $codigo)
    : validar_codigo_email((int)$usuario['ID_Usuario'], $codigo);

if (!$valido) {
    registrar_falha_login($usuario['Email'], $ip);
    json_resposta(['erro' => 'Código incorreto ou expirado.'], 401);
}

// 2ª etapa concluída: agora sim o login é efetivado e registrado no log.
session_regenerate_id(true);
unset($_SESSION['pre2fa']);
$_SESSION['uid'] = (int)$usuario['ID_Usuario'];
$_SESSION['senha_hash'] = $usuario['Senha_Hash'];
limpar_falhas_login($usuario['Email']);

$pdo->prepare('INSERT INTO LOG_ACESSO (ID_Usuario, Nome, Metodo_2FA, IP) VALUES (?, ?, ?, ?)')
    ->execute([(int)$usuario['ID_Usuario'], $usuario['Nome'], $usuario['Metodo_2FA'], $ip]);

json_resposta([
    'ok'      => true,
    'usuario' => ['nome' => $usuario['Nome'], 'email' => $usuario['Email'], 'cpf' => $usuario['CPF'], 'perfil' => $usuario['Perfil']],
    'destino' => $usuario['Perfil'] === 'master' ? 'usuarios.html' : 'minha_conta.html',
]);
