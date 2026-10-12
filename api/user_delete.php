<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';

/** Exclui um usuário COMUM — exclusivo do master. Os logs dele são apagados junto (ON DELETE CASCADE). */
exigir_metodo('POST');
exigir_csrf();
$master = exigir_master();
$d = corpo_json();

$idBruto = $d['id'] ?? 0;
$id = (is_int($idBruto) || (is_string($idBruto) && ctype_digit($idBruto))) ? (int)$idBruto : 0;
if ($id <= 0) {
    json_resposta(['erro' => 'Usuário inválido.'], 422);
}
if ($id === (int)$master['ID_Usuario']) {
    json_resposta(['erro' => 'Você não pode excluir a própria conta.'], 403);
}

$pdo = db();
$st = $pdo->prepare("SELECT ID_Usuario, Nome, ID_Cliente FROM USUARIO WHERE ID_Usuario = ? AND Perfil = 'comum'");
$st->execute([$id]);
$alvo = $st->fetch();
if (!$alvo) {
    json_resposta(['erro' => 'Usuário não encontrado (ou não é um usuário comum).'], 404);
}

$clienteMantido = false;
try {
    $pdo->beginTransaction();
    $pdo->prepare('DELETE FROM USUARIO WHERE ID_Usuario = ?')->execute([$id]);

    if ($alvo['ID_Cliente'] !== null) {
        // O cadastro de cliente só some se nunca houve venda (mantém o histórico financeiro).
        $st = $pdo->prepare(
            'SELECT 1 FROM VENDA WHERE ID_Cliente = ?
             UNION ALL
             SELECT 1 FROM PEDIDO WHERE ID_Cliente = ?
             LIMIT 1'
        );
        $st->execute([(int)$alvo['ID_Cliente'], (int)$alvo['ID_Cliente']]);
        if ($st->fetch()) {
            $clienteMantido = true;
        } else {
            $pdo->prepare('DELETE FROM CLIENTE WHERE ID_Cliente = ?')->execute([(int)$alvo['ID_Cliente']]);
        }
    }
    $pdo->commit();
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('user_delete.php: ' . $e->getMessage());
    json_resposta(['erro' => 'Não foi possível excluir o usuário.'], 500);
}

json_resposta(['ok' => true, 'nome' => $alvo['Nome'], 'cliente_mantido' => $clienteMantido]);
