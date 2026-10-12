<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';

/**
 * Resumo do log de entradas dos usuários COMUNS — exclusivo do master.
 * GET                → log geral (todos os comuns)
 * GET ?id=7          → log só do usuário 7
 * Cada linha: dia/hora, nome e qual foi o 2º fator. Mais recentes primeiro.
 */
exigir_metodo('GET');
exigir_master();

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$pdo = db();

$nomeUsuario = null;
if ($id > 0) {
    $st = $pdo->prepare("SELECT Nome FROM USUARIO WHERE ID_Usuario = ? AND Perfil = 'comum'");
    $st->execute([$id]);
    $nomeUsuario = $st->fetchColumn();
    if ($nomeUsuario === false) {
        json_resposta(['erro' => 'Usuário não encontrado.'], 404);
    }
}

$sql = "SELECT l.ID_Log, l.Data_Hora, l.Nome, l.Metodo_2FA
        FROM LOG_ACESSO l
        JOIN USUARIO u ON u.ID_Usuario = l.ID_Usuario
        WHERE u.Perfil = 'comum'";
$params = [];
if ($id > 0) {
    $sql .= ' AND l.ID_Usuario = ?';
    $params[] = $id;
}
$sql .= ' ORDER BY l.Data_Hora DESC, l.ID_Log DESC LIMIT 500';

$st = $pdo->prepare($sql);
$st->execute($params);

$logs = array_map(static fn (array $l): array => [
    'id'         => (int)$l['ID_Log'],
    'data_hora'  => $l['Data_Hora'],
    'nome'       => $l['Nome'],
    'metodo_2fa' => $l['Metodo_2FA'],
], $st->fetchAll());

json_resposta(['ok' => true, 'usuario' => $nomeUsuario ?: null, 'total' => count($logs), 'logs' => $logs]);
