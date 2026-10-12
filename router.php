<?php
/**
 * Roteador para o servidor embutido do PHP (apenas desenvolvimento):
 *   php -S localhost:8000 router.php
 * Impede que pastas internas sejam abertas pelo navegador.
 */
$caminho = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
if (preg_match('#^/(config|lib|sql|setup|storage)(/|$)#', $caminho)) {
    http_response_code(403);
    exit('Acesso negado.');
}
return false; // deixa o servidor entregar o arquivo / executar o PHP normalmente
