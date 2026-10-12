<?php
declare(strict_types=1);

/**
 * Configurações do backend.
 * Em produção prefira variáveis de ambiente (WAD_DB_*), assim a senha do
 * banco não fica gravada no código.
 */
function cfg(string $chave, string $padrao): string
{
    $valor = getenv($chave);
    return ($valor === false || $valor === '') ? $padrao : $valor;
}

const APP_NOME = 'Wish a Drink';

define('DB_HOST', cfg('WAD_DB_HOST', '127.0.0.1'));
define('DB_PORT', cfg('WAD_DB_PORT', '3306'));
define('DB_NAME', cfg('WAD_DB_NAME', 'wishadrink'));
define('DB_USER', cfg('WAD_DB_USER', 'root'));
define('DB_PASS', cfg('WAD_DB_PASS', ''));

// 'arquivo' = grava o e-mail com o código em storage/emails (ideal p/ desenvolvimento)
// 'mail'    = envia de verdade com a função mail() do PHP (produção)
define('MAIL_MODO', cfg('WAD_MAIL_MODO', 'arquivo'));
define('MAIL_REMETENTE', cfg('WAD_MAIL_FROM', 'no-reply@wishadrink.local'));

// Coloque WAD_COOKIE_SEGURO=1 quando o site estiver em HTTPS.
define('COOKIE_SEGURO', cfg('WAD_COOKIE_SEGURO', '0') === '1');

const TEMPO_MAX_SESSAO = 7200;      // 2 h sem atividade derruba a sessão
const TEMPO_CODIGO_2FA = 5;         // minutos de validade do código por e-mail
const MAX_FALHAS_LOGIN = 5;         // falhas em 15 min antes de bloquear o e-mail
