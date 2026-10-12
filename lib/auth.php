<?php
declare(strict_types=1);

/* ---------------------------------------------------------------------------
   Sessão, respostas JSON, CSRF e controle de acesso
   --------------------------------------------------------------------------- */

function iniciar_sessao(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_name('WADSESSID');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => COOKIE_SEGURO,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();

    $agora = time();
    if (isset($_SESSION['ultima_atividade']) && $agora - (int)$_SESSION['ultima_atividade'] > TEMPO_MAX_SESSAO) {
        $_SESSION = [];
        session_regenerate_id(true);
    }
    $_SESSION['ultima_atividade'] = $agora;
}

function json_resposta(array $dados, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function exigir_metodo(string $metodo): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $metodo) {
        header('Allow: ' . $metodo);
        json_resposta(['erro' => 'Método não permitido.'], 405);
    }
}

/** Lê o corpo JSON. Exigir application/json também barra formulários de outros sites. */
function corpo_json(): array
{
    $tipo = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($tipo, 'application/json') !== 0) {
        json_resposta(['erro' => 'Content-Type inválido.'], 415);
    }
    $bruto = file_get_contents('php://input');
    if ($bruto === false || strlen($bruto) > 20000) {
        json_resposta(['erro' => 'Requisição inválida.'], 400);
    }
    $dados = json_decode($bruto, true);
    if (!is_array($dados)) {
        json_resposta(['erro' => 'JSON inválido.'], 400);
    }
    return $dados;
}

function csrf_token(): string
{
    iniciar_sessao();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function exigir_csrf(): void
{
    iniciar_sessao();
    $enviado  = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $esperado = $_SESSION['csrf'] ?? '';
    if (!is_string($esperado) || $esperado === '' || !hash_equals($esperado, (string)$enviado)) {
        json_resposta(['erro' => 'Sessão inválida ou expirada. Recarregue a página e tente de novo.'], 403);
    }
}

function ip_cliente(): string
{
    // Não confiamos em X-Forwarded-For (pode ser forjado). Ajuste se houver proxy confiável.
    return substr((string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'), 0, 45);
}

/** Usuário da sessão (relido do banco: se foi excluído, a sessão deixa de valer). */
function usuario_logado(): ?array
{
    iniciar_sessao();
    $id = $_SESSION['uid'] ?? null;
    if (!$id) {
        return null;
    }
    $st = db()->prepare('SELECT ID_Usuario, Nome, Email, CPF, Perfil, Metodo_2FA, Senha_Hash FROM USUARIO WHERE ID_Usuario = ?');
    $st->execute([(int)$id]);
    $usuario = $st->fetch();
    if (!$usuario) {
        unset($_SESSION['uid'], $_SESSION['senha_hash']);
        session_regenerate_id(true);
        return null;
    }
    if (!isset($_SESSION['senha_hash']) || !hash_equals((string)$_SESSION['senha_hash'], (string)$usuario['Senha_Hash'])) {
        unset($_SESSION['uid'], $_SESSION['senha_hash']);
        session_regenerate_id(true);
        return null;
    }
    unset($usuario['Senha_Hash']);
    return $usuario;
}

function exigir_login(): array
{
    $usuario = usuario_logado();
    if ($usuario === null) {
        json_resposta(['erro' => 'Faça login para continuar.'], 401);
    }
    return $usuario;
}

/** Acesso exclusivo do usuário master (validado SEMPRE no servidor). */
function exigir_master(): array
{
    $usuario = exigir_login();
    if ($usuario['Perfil'] !== 'master') {
        json_resposta(['erro' => 'Acesso restrito ao usuário master.'], 403);
    }
    return $usuario;
}

/* ---------------------------------------------------------------------------
   Bloqueio de força bruta (senha e 2º fator compartilham o mesmo contador)
   --------------------------------------------------------------------------- */

function login_bloqueado(string $email, string $ip): bool
{
    $st = db()->prepare(
        'SELECT
           SUM(Email = ?) AS por_email,
           SUM(IP = ?)    AS por_ip
         FROM LOGIN_TENTATIVA
         WHERE Criado_Em > (NOW() - INTERVAL 15 MINUTE) AND (Email = ? OR IP = ?)'
    );
    $st->execute([$email, $ip, $email, $ip]);
    $linha = $st->fetch();
    return (int)($linha['por_email'] ?? 0) >= MAX_FALHAS_LOGIN || (int)($linha['por_ip'] ?? 0) >= MAX_FALHAS_LOGIN * 4;
}

function registrar_falha_login(string $email, string $ip): void
{
    db()->prepare('INSERT INTO LOGIN_TENTATIVA (Email, IP) VALUES (?, ?)')->execute([$email, $ip]);
}

function limpar_falhas_login(string $email): void
{
    db()->prepare('DELETE FROM LOGIN_TENTATIVA WHERE Email = ?')->execute([$email]);
}

/* ---------------------------------------------------------------------------
   2º fator por e-mail
   --------------------------------------------------------------------------- */

/** Cria um código novo (invalida os anteriores) e devolve o código em texto puro para envio. */
function gerar_codigo_email(int $idUsuario): string
{
    $codigo = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $pdo = db();
    $pdo->prepare('DELETE FROM CODIGO_2FA WHERE ID_Usuario = ?')->execute([$idUsuario]);
    $pdo->prepare(
        'INSERT INTO CODIGO_2FA (ID_Usuario, Codigo_Hash, Expira_Em)
         VALUES (?, ?, NOW() + INTERVAL ' . TEMPO_CODIGO_2FA . ' MINUTE)'
    )->execute([$idUsuario, password_hash($codigo, PASSWORD_DEFAULT)]);
    return $codigo;
}

function validar_codigo_email(int $idUsuario, string $codigo): bool
{
    $pdo = db();
    $st = $pdo->prepare(
        'SELECT ID_Codigo, Codigo_Hash, Tentativas FROM CODIGO_2FA
         WHERE ID_Usuario = ? AND Expira_Em > NOW() ORDER BY ID_Codigo DESC LIMIT 1'
    );
    $st->execute([$idUsuario]);
    $registro = $st->fetch();
    if (!$registro || (int)$registro['Tentativas'] >= 5) {
        return false;
    }
    if (password_verify($codigo, $registro['Codigo_Hash'])) {
        $pdo->prepare('DELETE FROM CODIGO_2FA WHERE ID_Usuario = ?')->execute([$idUsuario]);
        return true;
    }
    $pdo->prepare('UPDATE CODIGO_2FA SET Tentativas = Tentativas + 1 WHERE ID_Codigo = ?')->execute([$registro['ID_Codigo']]);
    return false;
}
