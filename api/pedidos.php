<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';
if (!in_array($metodo, ['GET', 'POST'], true)) {
    exigir_metodo('GET');
}
$usuario = exigir_login();
if ($usuario['Perfil'] !== 'comum') {
    json_resposta(['erro' => 'Pedidos disponíveis apenas para contas de cliente.'], 403);
}

$pdo = db();
$st = $pdo->prepare('SELECT ID_Cliente FROM USUARIO WHERE ID_Usuario = ? AND Perfil = \'comum\'');
$st->execute([(int)$usuario['ID_Usuario']]);
$idCliente = $st->fetchColumn();
if (!$idCliente) {
    json_resposta(['erro' => 'Cadastro de cliente não encontrado.'], 404);
}

if ($metodo === 'GET') {
    $st = $pdo->prepare(
        'SELECT ID_Pedido, Data, VT, Status, Metodo_Pagamento, End_Rua_Numero,
                End_CEP, End_Cidade, End_Estado, End_Complemento
         FROM PEDIDO WHERE ID_Cliente = ? ORDER BY Data DESC, ID_Pedido DESC LIMIT 100'
    );
    $st->execute([(int)$idCliente]);
    $pedidos = $st->fetchAll();
    $itensSt = $pdo->prepare(
        'SELECT Produto_ID, Nome, Valor_Unitario, Quantidade FROM PEDIDO_ITEM WHERE ID_Pedido = ? ORDER BY ID_Item'
    );
    foreach ($pedidos as &$pedido) {
        $itensSt->execute([(int)$pedido['ID_Pedido']]);
        $pedido['itens'] = $itensSt->fetchAll();
    }
    unset($pedido);
    json_resposta(['ok' => true, 'pedidos' => $pedidos]);
}

exigir_csrf();
$d = corpo_json();
$itens = $d['itens'] ?? null;
$endereco = is_array($d['endereco'] ?? null) ? $d['endereco'] : [];
$pagamento = campo($d, 'pagamento');
$telefone = texto_limpo(campo($d, 'telefone'), 20);
$ruaNumero = texto_limpo(campo($endereco, 'rua_numero'), 255);
$cep = limpar_cpf(campo($endereco, 'cep'));
$cidade = texto_limpo(campo($endereco, 'cidade'), 120);
$estado = strtoupper(trim(campo($endereco, 'estado')));
$complemento = texto_limpo(campo($endereco, 'complemento'), 120);
$metodosPagamento = ['pix', 'cartao', 'debito', 'dinheiro', 'boleto'];
$estados = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
$erros = [];

if (!is_array($itens) || count($itens) < 1 || count($itens) > 50) {
    $erros['itens'] = 'O carrinho está vazio ou contém itens demais.';
}
if (!in_array($pagamento, $metodosPagamento, true)) $erros['pagamento'] = 'Selecione uma forma de pagamento.';
if (mb_strlen($ruaNumero) < 5) $erros['endereco'] = 'Informe rua e número.';
if (strlen($cep) !== 8) $erros['cep'] = 'Informe um CEP válido.';
if (mb_strlen($cidade) < 2) $erros['cidade'] = 'Informe a cidade.';
if (!in_array($estado, $estados, true)) $erros['estado'] = 'Selecione um estado válido.';
$telefoneDigitos = limpar_cpf($telefone);
if (!in_array(strlen($telefoneDigitos), [10, 11], true)) $erros['telefone'] = 'Informe um telefone com DDD.';

$itensValidados = [];
$totalCentavos = 0;
if (is_array($itens)) {
    foreach ($itens as $item) {
        if (!is_array($item)) {
            $erros['itens'] = 'Um item do carrinho é inválido.';
            break;
        }
        $id = campo($item, 'id');
        $nome = texto_limpo(campo($item, 'nome'), 180);
        $quantidade = $item['quantidade'] ?? null;
        $preco = $item['preco'] ?? null;
        if (!preg_match('/^[a-zA-Z0-9._-]{1,100}$/', $id) || $nome === ''
            || !is_int($quantidade) || $quantidade < 1 || $quantidade > 99
            || (!is_int($preco) && !is_float($preco) && !is_numeric($preco))
            || !is_finite((float)$preco) || (float)$preco <= 0 || (float)$preco > 100000) {
            $erros['itens'] = 'Um item do carrinho possui dados inválidos.';
            break;
        }
        $centavos = (int)round((float)$preco * 100);
        if (isset($itensValidados[$id])) {
            $quantidade += $itensValidados[$id]['quantidade'];
        }
        if ($quantidade > 99) {
            $erros['itens'] = 'A quantidade máxima por produto é 99.';
            break;
        }
        $itensValidados[$id] = [
            'id' => $id,
            'nome' => $nome,
            'preco' => $centavos,
            'quantidade' => $quantidade,
        ];
    }
}
foreach ($itensValidados as $item) {
    $totalCentavos += $item['preco'] * $item['quantidade'];
}
if ($totalCentavos > 999999999) $erros['itens'] = 'O valor total do pedido excede o limite permitido.';

if ($erros) {
    json_resposta(['erro' => 'Confira os dados do pedido.', 'campos' => $erros], 422);
}

try {
    $pdo->beginTransaction();
    $pdo->prepare(
        'INSERT INTO PEDIDO (ID_Cliente, VT, Metodo_Pagamento, End_Rua_Numero, End_CEP,
                             End_Cidade, End_Estado, End_Complemento, Telefone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        (int)$idCliente,
        number_format($totalCentavos / 100, 2, '.', ''),
        $pagamento,
        $ruaNumero,
        $cep,
        $cidade,
        $estado,
        $complemento ?: null,
        $telefone,
    ]);
    $idPedido = (int)$pdo->lastInsertId();
    $itemSt = $pdo->prepare(
        'INSERT INTO PEDIDO_ITEM (ID_Pedido, Produto_ID, Nome, Valor_Unitario, Quantidade)
         VALUES (?, ?, ?, ?, ?)'
    );
    foreach ($itensValidados as $item) {
        $itemSt->execute([
            $idPedido,
            $item['id'],
            $item['nome'],
            number_format($item['preco'] / 100, 2, '.', ''),
            $item['quantidade'],
        ]);
    }
    $pdo->commit();
} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log('pedidos.php: ' . $e->getMessage());
    json_resposta(['erro' => 'Não foi possível registrar o pedido.'], 500);
}

json_resposta([
    'ok' => true,
    'pedido' => [
        'id' => $idPedido,
        'total' => number_format($totalCentavos / 100, 2, '.', ''),
        'status' => 'recebido',
    ],
], 201);
