<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';

exigir_metodo('GET');
exigir_master();

$idRaw = $_GET['id'] ?? '';
if (!is_string($idRaw)) {
    json_resposta(['erro' => 'Usuário inválido.'], 422);
}
$idUsuario = filter_var($idRaw, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
if ($idUsuario === false || $idUsuario === null) {
    json_resposta(['erro' => 'Usuário inválido.'], 422);
}

$pdo = db();
$st = $pdo->prepare(
    "SELECT u.Nome, u.Email, c.ID_Cliente
     FROM USUARIO u
     LEFT JOIN CLIENTE c ON c.ID_Cliente = u.ID_Cliente
     WHERE u.ID_Usuario = ? AND u.Perfil = 'comum'"
);
$st->execute([$idUsuario]);
$usuario = $st->fetch();
if (!$usuario) {
    json_resposta(['erro' => 'Usuário não encontrado.'], 404);
}

$pedidos = [];
if ($usuario['ID_Cliente'] !== null) {
    $st = $pdo->prepare(
        'SELECT ID_Pedido, Data, VT, Status
         FROM PEDIDO
         WHERE ID_Cliente = ?
         ORDER BY Data DESC, ID_Pedido DESC
         LIMIT 100'
    );
    $st->execute([(int)$usuario['ID_Cliente']]);
    $pedidos = $st->fetchAll();

    if ($pedidos) {
        $idsPedido = array_map(static fn (array $pedido): int => (int)$pedido['ID_Pedido'], $pedidos);
        $marcadores = implode(',', array_fill(0, count($idsPedido), '?'));
        $itensSt = $pdo->prepare(
            "SELECT ID_Pedido, Nome, Valor_Unitario, Quantidade
             FROM PEDIDO_ITEM
             WHERE ID_Pedido IN ($marcadores)
             ORDER BY ID_Pedido, ID_Item"
        );
        $itensSt->execute($idsPedido);
        $itensPorPedido = [];
        foreach ($itensSt->fetchAll() as $item) {
            $itensPorPedido[(int)$item['ID_Pedido']][] = [
                'nome' => $item['Nome'],
                'valor_unitario' => $item['Valor_Unitario'],
                'quantidade' => (int)$item['Quantidade'],
            ];
        }

        foreach ($pedidos as &$pedido) {
            $idPedido = (int)$pedido['ID_Pedido'];
            $pedido['id'] = $idPedido;
            $pedido['itens'] = $itensPorPedido[$idPedido] ?? [];
        }
        unset($pedido);
    }
}

json_resposta([
    'ok' => true,
    'usuario' => ['nome' => $usuario['Nome'], 'email' => $usuario['Email']],
    'total' => count($pedidos),
    'pedidos' => $pedidos,
]);
