<?php
declare(strict_types=1);

/** Conexão PDO única (prepared statements reais, erros como exceção). */
function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_PORT, DB_NAME);
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            error_log('Falha ao conectar no banco: ' . $e->getMessage());
            json_resposta(['erro' => 'Banco de dados indisponível. Verifique config/config.php.'], 503);
        }
    }
    return $pdo;
}
