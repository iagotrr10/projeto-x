<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';

exigir_metodo($_SERVER['REQUEST_METHOD'] === 'POST' ? 'POST' : 'GET');
$usuario = exigir_login();
if ($usuario['Perfil'] !== 'comum') {
    json_resposta(['erro' => 'Endereço de entrega disponível apenas para contas de cliente.'], 403);
}

$st = db()->prepare(
    'SELECT c.ID_Cliente, c.Endereco, e.Rua_Numero, e.CEP, e.Cidade, e.Estado, e.Complemento
     FROM USUARIO u
     JOIN CLIENTE c ON c.ID_Cliente = u.ID_Cliente
     LEFT JOIN ENDERECO_CLIENTE e ON e.ID_Cliente = c.ID_Cliente
     WHERE u.ID_Usuario = ?'
);
$st->execute([(int)$usuario['ID_Usuario']]);
$cliente = $st->fetch();
if (!$cliente) {
    json_resposta(['erro' => 'Cadastro de cliente não encontrado.'], 404);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_resposta([
        'ok' => true,
        'endereco' => [
            'rua_numero'  => $cliente['Rua_Numero'] ?: $cliente['Endereco'],
            'cep'         => $cliente['CEP'],
            'cidade'      => $cliente['Cidade'],
            'estado'      => $cliente['Estado'],
            'complemento' => $cliente['Complemento'],
        ],
    ]);
}

exigir_csrf();
$d = corpo_json();
$ruaNumero = texto_limpo(campo($d, 'rua_numero'), 255);
$cep = limpar_cpf(campo($d, 'cep'));
$cidade = texto_limpo(campo($d, 'cidade'), 120);
$estado = strtoupper(trim(campo($d, 'estado')));
$complemento = texto_limpo(campo($d, 'complemento'), 120);

$estados = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
$erros = [];
if (mb_strlen($ruaNumero) < 5) $erros['rua_numero'] = 'Informe rua e número.';
if (strlen($cep) !== 8) $erros['cep'] = 'Informe um CEP válido com 8 dígitos.';
if (mb_strlen($cidade) < 2) $erros['cidade'] = 'Informe a cidade.';
if (!in_array($estado, $estados, true)) $erros['estado'] = 'Selecione um estado válido.';
if ($erros) {
    json_resposta(['erro' => 'Confira os dados do endereço.', 'campos' => $erros], 422);
}

try {
    $pdo = db();
    $pdo->beginTransaction();
    $pdo->prepare(
        'INSERT INTO ENDERECO_CLIENTE (ID_Cliente, Rua_Numero, CEP, Cidade, Estado, Complemento)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE Rua_Numero = VALUES(Rua_Numero), CEP = VALUES(CEP),
             Cidade = VALUES(Cidade), Estado = VALUES(Estado), Complemento = VALUES(Complemento)'
    )->execute([(int)$cliente['ID_Cliente'], $ruaNumero, $cep, $cidade, $estado, $complemento ?: null]);
    $pdo->prepare('UPDATE CLIENTE SET Endereco = ? WHERE ID_Cliente = ?')
        ->execute([$ruaNumero, (int)$cliente['ID_Cliente']]);
    $pdo->commit();
} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log('endereco.php: ' . $e->getMessage());
    json_resposta(['erro' => 'Não foi possível salvar o endereço.'], 500);
}

json_resposta(['ok' => true]);
