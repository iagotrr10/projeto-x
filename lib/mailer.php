<?php
declare(strict_types=1);

/**
 * Envia o código de verificação por e-mail.
 * MAIL_MODO = 'arquivo' → grava em storage/emails/ (desenvolvimento, sem servidor SMTP)
 * MAIL_MODO = 'mail'    → usa mail() (produção; exige sendmail/SMTP configurado no PHP)
 */
function enviar_codigo_2fa(string $email, string $nome, string $codigo): bool
{
    $assunto = 'Seu código de verificação - ' . APP_NOME;
    $corpo = "Olá, {$nome}!\n\n"
        . "Seu código de verificação é: {$codigo}\n\n"
        . 'Ele vale por ' . TEMPO_CODIGO_2FA . " minutos. Se não foi você, ignore esta mensagem e troque sua senha.\n";

    if (MAIL_MODO === 'mail') {
        $cabecalhos = 'From: ' . MAIL_REMETENTE . "\r\nContent-Type: text/plain; charset=UTF-8";
        return mail($email, '=?UTF-8?B?' . base64_encode($assunto) . '?=', $corpo, $cabecalhos);
    }

    $pasta = __DIR__ . '/../storage/emails';
    if (!is_dir($pasta) && !mkdir($pasta, 0775, true)) {
        return false;
    }
    $arquivo = $pasta . '/' . date('Ymd-His') . '-' . bin2hex(random_bytes(3)) . '.txt';
    return file_put_contents($arquivo, "Para: {$email}\nAssunto: {$assunto}\n\n{$corpo}") !== false;
}
