<?php
declare(strict_types=1);

/** TOTP (RFC 6238): compatível com Google Authenticator, Microsoft Authenticator, Authy etc. */

const BASE32_ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32_codificar(string $binario): string
{
    $bits = '';
    foreach (str_split($binario) as $byte) {
        $bits .= str_pad(decbin(ord($byte)), 8, '0', STR_PAD_LEFT);
    }
    $saida = '';
    foreach (str_split($bits, 5) as $bloco) {
        $saida .= BASE32_ALFABETO[bindec(str_pad($bloco, 5, '0', STR_PAD_RIGHT))];
    }
    return $saida;
}

function base32_decodificar(string $texto): string
{
    $texto = strtoupper(preg_replace('/[^A-Za-z2-7]/', '', $texto) ?? '');
    $bits = '';
    foreach (str_split($texto) as $caractere) {
        $bits .= str_pad(decbin((int)strpos(BASE32_ALFABETO, $caractere)), 5, '0', STR_PAD_LEFT);
    }
    $binario = '';
    foreach (str_split($bits, 8) as $byte) {
        if (strlen($byte) === 8) {
            $binario .= chr(bindec($byte));
        }
    }
    return $binario;
}

function totp_gerar_secret(): string
{
    return base32_codificar(random_bytes(20)); // 160 bits → 32 caracteres
}

function totp_codigo(string $secret, int $contador): string
{
    $chave = base32_decodificar($secret);
    $mensagem = pack('N2', 0, $contador);               // contador de 64 bits (big-endian)
    $hash = hash_hmac('sha1', $mensagem, $chave, true);
    $offset = ord($hash[19]) & 0x0F;
    $numero = ((ord($hash[$offset]) & 0x7F) << 24)
            | ((ord($hash[$offset + 1]) & 0xFF) << 16)
            | ((ord($hash[$offset + 2]) & 0xFF) << 8)
            |  (ord($hash[$offset + 3]) & 0xFF);
    return str_pad((string)($numero % 1000000), 6, '0', STR_PAD_LEFT);
}

/** Aceita o código atual e o anterior/seguinte (tolerância de ±30 s de relógio). */
function totp_verificar(string $secret, string $codigo, int $janela = 1): bool
{
    $codigo = preg_replace('/\D/', '', $codigo) ?? '';
    if (strlen($codigo) !== 6 || $secret === '') {
        return false;
    }
    $atual = intdiv(time(), 30);
    for ($i = -$janela; $i <= $janela; $i++) {
        if (hash_equals(totp_codigo($secret, $atual + $i), $codigo)) {
            return true;
        }
    }
    return false;
}

function totp_uri(string $secret, string $email): string
{
    return 'otpauth://totp/' . rawurlencode(APP_NOME . ':' . $email)
        . '?secret=' . $secret . '&issuer=' . rawurlencode(APP_NOME) . '&digits=6&period=30';
}
