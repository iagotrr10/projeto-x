<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';
if (!in_array($metodo, ['GET', 'POST'], true)) {
    header('Allow: GET, POST');
    json_resposta(['erro' => 'Método não permitido.'], 405);
}

if ($metodo === 'POST') {
    $usuario = exigir_login();
    exigir_csrf();
    $dados = corpo_json();
    $pagina = campo($dados, 'pagina');
    $paginasPermitidas = [
        'index.html', 'bebidas.html', 'ofertas.html', 'sobre.html',
        'carrinho.html', 'checkout.html', 'login.html', 'cadastro.html',
        'minha_conta.html', 'pedidos.html', 'favoritos.html',
        'alterar_senha.html', '2fa.html', 'usuarios.html',
        'admin.html', 'modelagem.html',
    ];
    if (!in_array($pagina, $paginasPermitidas, true)) {
        json_resposta(['erro' => 'Página inválida.'], 422);
    }

    try {
        db()->prepare('INSERT INTO LOG_PAGINA (ID_Usuario, Pagina) VALUES (?, ?)')
            ->execute([(int)$usuario['ID_Usuario'], $pagina]);
    } catch (PDOException $e) {
        error_log('page_activity.php: ' . $e->getMessage());
        json_resposta(['erro' => 'Não foi possível registrar o acesso à página.'], 500);
    }
    json_resposta(['ok' => true], 201);
}

$master = exigir_master();
$idRaw = $_GET['id'] ?? '';
if (!is_string($idRaw)) {
    json_resposta(['erro' => 'Usuário inválido.'], 422);
}
$idUsuario = $idRaw === ''
    ? (int)$master['ID_Usuario']
    : filter_var($idRaw, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
if ($idUsuario === false || $idUsuario === null) {
    json_resposta(['erro' => 'Usuário inválido.'], 422);
}

$pdo = db();
$st = $pdo->prepare(
    "SELECT ID_Usuario, Nome, Email, Perfil, Criado_Em
     FROM USUARIO
     WHERE ID_Usuario = ?
       AND (Perfil = 'comum' OR (Perfil = 'master' AND ID_Usuario = ?))"
);
$st->execute([(int)$idUsuario, (int)$master['ID_Usuario']]);
$usuario = $st->fetch();
if (!$usuario) {
    json_resposta(['erro' => 'Usuário não encontrado.'], 404);
}

$st = $pdo->prepare(
    'SELECT Pagina, Data_Hora
     FROM LOG_PAGINA
     WHERE ID_Usuario = ?
     ORDER BY Data_Hora DESC, ID_Log_Pagina DESC
     LIMIT 500'
);
$st->execute([(int)$idUsuario]);
$logs = $st->fetchAll();

json_resposta([
    'ok' => true,
    'usuario' => [
        'id' => (int)$usuario['ID_Usuario'],
        'nome' => $usuario['Nome'],
        'email' => $usuario['Email'],
        'perfil' => $usuario['Perfil'],
        'criado_em' => $usuario['Criado_Em'],
    ],
    'total' => count($logs),
    'logs' => $logs,
]);
