<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';

/**
 * Lista de usuários COMUNS — exclusivo do usuário master.
 * GET ?modo=todos            → todos
 * GET ?modo=nome&q=maria     → nome contém a substring (sem diferenciar maiúsculas/acentos)
 * GET ?modo=cpf&q=123456     → CPF contém os dígitos informados
 */
exigir_metodo('GET');
exigir_master();

$modo = (string)($_GET['modo'] ?? 'todos');
$q    = trim((string)($_GET['q'] ?? ''));
if (!in_array($modo, ['todos', 'nome', 'cpf'], true)) {
    json_resposta(['erro' => 'Modo de pesquisa inválido.'], 422);
}

$sql = "SELECT u.ID_Usuario, u.Nome, u.Email, u.CPF, u.Metodo_2FA, u.Criado_Em,
               c.Numero AS Telefone, c.Dt_Nasc AS Nascimento, c.Endereco,
               (SELECT MAX(l.Data_Hora) FROM LOG_ACESSO l WHERE l.ID_Usuario = u.ID_Usuario) AS Ultimo_Acesso
        FROM USUARIO u
        LEFT JOIN CLIENTE c ON c.ID_Cliente = u.ID_Cliente
        WHERE u.Perfil = 'comum'";
$sqlTotal = "SELECT COUNT(*) FROM USUARIO u WHERE u.Perfil = 'comum'";
$params = [];

if ($modo === 'nome') {
    if ($q === '') {
        json_resposta(['erro' => 'Digite parte do nome para pesquisar.'], 422);
    }
    $sql .= " AND u.Nome LIKE ? ESCAPE '!'";
    $sqlTotal .= " AND u.Nome LIKE ? ESCAPE '!'";
    $params[] = '%' . escapar_like(mb_substr($q, 0, 120)) . '%';
} elseif ($modo === 'cpf') {
    $digitos = limpar_cpf($q);
    if ($digitos === '') {
        json_resposta(['erro' => 'Digite o CPF (ou parte dele) para pesquisar.'], 422);
    }
    $sql .= ' AND u.CPF LIKE ?';
    $sqlTotal .= ' AND u.CPF LIKE ?';
    $params[] = '%' . substr($digitos, 0, 11) . '%';
}

$stTotal = db()->prepare($sqlTotal);
$stTotal->execute($params);
$total = (int)$stTotal->fetchColumn();
$contagens = db()->query(
    "SELECT
        SUM(Perfil = 'master') AS total_masters,
        SUM(Perfil = 'comum') AS total_comuns
     FROM USUARIO"
)->fetch();

$sql .= ' ORDER BY u.Nome ASC LIMIT 200';
$st = db()->prepare($sql);
$st->execute($params);

$usuarios = array_map(static fn (array $l): array => [
    'id'             => (int)$l['ID_Usuario'],
    'nome'           => $l['Nome'],
    'email'          => $l['Email'],
    'cpf'            => formatar_cpf($l['CPF']),
    'cpf_digitos'    => $l['CPF'],
    'telefone'       => $l['Telefone'],
    'nascimento'     => $l['Nascimento'],
    'endereco'       => $l['Endereco'],
    'metodo_2fa'     => $l['Metodo_2FA'],
    'criado_em'      => $l['Criado_Em'],
    'ultimo_acesso'  => $l['Ultimo_Acesso'],
], $st->fetchAll());

json_resposta([
    'ok' => true,
    'total' => $total,
    'total_masters' => (int)$contagens['total_masters'],
    'total_comuns' => (int)$contagens['total_comuns'],
    'usuarios' => $usuarios,
]);
