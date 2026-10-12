<?php
declare(strict_types=1);

/**
 * Cria o usuário MASTER pelo terminal (a senha nunca fica gravada no código).
 *   php setup/criar_master.php
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Execute este script pelo terminal: php setup/criar_master.php');
}

require __DIR__ . '/../lib/bootstrap.php';

function perguntar(string $texto, bool $oculto = false): string
{
    echo $texto;
    $windows = stripos(PHP_OS_FAMILY, 'Windows') === 0;
    if ($oculto && !$windows) {
        shell_exec('stty -echo');
    }
    $resposta = trim((string)fgets(STDIN));
    if ($oculto && !$windows) {
        shell_exec('stty echo');
        echo PHP_EOL;
    }
    return $resposta;
}

echo "=== Criar usuário master - " . APP_NOME . " ===\n";
$nome   = texto_limpo(perguntar('Nome completo: '), 120);
$email  = strtolower(perguntar('E-mail: '));
$cpf    = limpar_cpf(perguntar('CPF: '));
$senha  = perguntar('Senha (8+ caracteres, maiúscula, minúscula, número e símbolo): ', true);
$metodo = strtolower(perguntar('2º fator [email/totp] (padrão: email): ')) ?: 'email';

$erros = [];
if (mb_strlen($nome) < 3)                        $erros[] = 'Nome inválido.';
if (!email_valido($email))                       $erros[] = 'E-mail inválido.';
if (!cpf_valido($cpf))                           $erros[] = 'CPF inválido.';
if (!senha_forte($senha))                        $erros[] = 'Senha fraca.';
if (!in_array($metodo, ['email', 'totp'], true)) $erros[] = 'Método de 2º fator inválido.';
if ($erros) {
    fwrite(STDERR, "Não foi possível criar:\n - " . implode("\n - ", $erros) . "\n");
    exit(1);
}

$secret = $metodo === 'totp' ? totp_gerar_secret() : null;

try {
    db()->prepare(
        "INSERT INTO USUARIO (Nome, Email, CPF, Senha_Hash, Perfil, Metodo_2FA, Totp_Secret)
         VALUES (?, ?, ?, ?, 'master', ?, ?)"
    )->execute([$nome, $email, $cpf, password_hash($senha, PASSWORD_DEFAULT), $metodo, $secret]);
} catch (PDOException $e) {
    fwrite(STDERR, $e->getCode() === '23000'
        ? "Já existe um usuário com este e-mail ou CPF.\n"
        : 'Erro no banco: ' . $e->getMessage() . "\n");
    exit(1);
}

echo "\nMaster criado com sucesso: {$email}\n";
if ($secret !== null) {
    echo "\nCadastre esta chave no app autenticador (Google Authenticator, Authy...):\n";
    echo "  Chave:  {$secret}\n  URI:    " . totp_uri($secret, $email) . "\n";
    echo "Guarde-a agora: ela não será exibida novamente.\n";
}
