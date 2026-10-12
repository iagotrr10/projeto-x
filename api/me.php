<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';

exigir_metodo('GET');
$usuario = usuario_logado();
$dados = null;

if ($usuario !== null && $usuario['Perfil'] === 'comum') {
    $st = db()->prepare(
        'SELECT c.Nome, c.Email, c.CPF, c.Numero, c.Dt_Nasc, c.Endereco,
                e.Rua_Numero, e.CEP, e.Cidade, e.Estado, e.Complemento
         FROM USUARIO u
         JOIN CLIENTE c ON c.ID_Cliente = u.ID_Cliente
         LEFT JOIN ENDERECO_CLIENTE e ON e.ID_Cliente = c.ID_Cliente
         WHERE u.ID_Usuario = ?'
    );
    $st->execute([(int)$usuario['ID_Usuario']]);
    $cliente = $st->fetch();
    if ($cliente) {
        $dados = [
            'nome'       => $cliente['Nome'],
            'email'      => $cliente['Email'],
            'cpf'        => $cliente['CPF'],
            'telefone'   => $cliente['Numero'],
            'nascimento' => $cliente['Dt_Nasc'],
            'endereco'   => [
                'rua_numero'  => $cliente['Rua_Numero'] ?: $cliente['Endereco'],
                'cep'         => $cliente['CEP'],
                'cidade'      => $cliente['Cidade'],
                'estado'      => $cliente['Estado'],
                'complemento' => $cliente['Complemento'],
            ],
        ];
    }
}

json_resposta([
    'logado'  => $usuario !== null,
    'usuario' => $usuario ? [
        'nome'   => $usuario['Nome'],
        'email'  => $usuario['Email'],
        'cpf'    => $usuario['CPF'],
        'perfil' => $usuario['Perfil'],
    ] : null,
    'dados'   => $dados,
    'csrf'    => csrf_token(),
]);
