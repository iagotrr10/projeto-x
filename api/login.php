<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';

// Hash válido de uma senha qualquer: usado para gastar o mesmo tempo quando o e-mail não existe.
const HASH_FALSO = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

exigir_metodo('POST');
exigir_csrf();
$d = corpo_json();

$email = strtolower(trim(campo($d, 'email')));
$senha = campo($d, 'senha');
if ($email === '' || $senha === '') {
    json_resposta(['erro' => 'Informe e-mail e senha.'], 422);
}

$ip = ip_cliente();
if (login_bloqueado($email, $ip)) {
    json_resposta(['erro' => 'Muitas tentativas. Aguarde 15 minutos e tente novamente.'], 429);
}

$st = db()->prepare('SELECT ID_Usuario, Nome, Email, Senha_Hash, Metodo_2FA FROM USUARIO WHERE Email = ?');
$st->execute([$email]);
$usuario = $st->fetch();

$senhaOk = password_verify($senha, $usuario['Senha_Hash'] ?? HASH_FALSO);
if (!$usuario || !$senhaOk) {
    registrar_falha_login($email, $ip);
    json_resposta(['erro' => 'E-mail ou senha incorretos.'], 401);
}

// 1ª etapa concluída: ainda NÃO há login. Só guardamos "aguardando 2º fator".
iniciar_sessao();
session_regenerate_id(true);
unset($_SESSION['uid'], $_SESSION['senha_hash']);
$_SESSION['pre2fa'] = [
    'uid' => (int)$usuario['ID_Usuario'],
    'senha_hash' => $usuario['Senha_Hash'],
    'inicio' => time(),
    'reenvios' => 0,
];

if ($usuario['Metodo_2FA'] === 'email') {
    $codigo = gerar_codigo_email((int)$usuario['ID_Usuario']);
    if (!enviar_codigo_2fa($usuario['Email'], $usuario['Nome'], $codigo)) {
        unset($_SESSION['pre2fa']);
        json_resposta(['erro' => 'Não foi possível enviar o código por e-mail. Tente novamente.'], 502);
    }
}

json_resposta([
    'ok'               => true,
    'precisa_2fa'      => true,
    'metodo_2fa'       => $usuario['Metodo_2FA'],
    'email_mascarado'  => mascarar_email($usuario['Email']),
]);
