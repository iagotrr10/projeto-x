<?php
declare(strict_types=1);

/** Lê um campo de texto do JSON recebido (ignora tipos inesperados). */
function campo(array $dados, string $chave): string
{
    $valor = $dados[$chave] ?? '';
    return is_string($valor) ? $valor : '';
}

/** Remove espaços extras e limita o tamanho. */
function texto_limpo(string $texto, int $max): string
{
    $texto = trim(preg_replace('/\s+/u', ' ', $texto) ?? '');
    return mb_substr($texto, 0, $max);
}

function limpar_cpf(string $cpf): string
{
    return preg_replace('/\D/', '', $cpf) ?? '';
}

function cpf_valido(string $cpf): bool
{
    $c = limpar_cpf($cpf);
    if (strlen($c) !== 11 || preg_match('/^(\d)\1{10}$/', $c)) {
        return false;
    }
    for ($t = 9; $t < 11; $t++) {
        $soma = 0;
        for ($i = 0; $i < $t; $i++) {
            $soma += (int)$c[$i] * (($t + 1) - $i);
        }
        $digito = ((10 * $soma) % 11) % 10;
        if ((int)$c[$t] !== $digito) {
            return false;
        }
    }
    return true;
}

function formatar_cpf(string $cpf): string
{
    $c = limpar_cpf($cpf);
    return strlen($c) === 11
        ? substr($c, 0, 3) . '.' . substr($c, 3, 3) . '.' . substr($c, 6, 3) . '-' . substr($c, 9, 2)
        : $cpf;
}

function email_valido(string $email): bool
{
    return strlen($email) <= 150 && filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/** Mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo (mesma regra do cadastro). */
function senha_forte(string $senha): bool
{
    return strlen($senha) >= 8 && strlen($senha) <= 72
        && preg_match('/[A-Z]/', $senha) && preg_match('/[a-z]/', $senha)
        && preg_match('/\d/', $senha) && preg_match('/[\W_]/', $senha);
}

function idade_minima(string $dataIso, int $anos): bool
{
    $d = DateTime::createFromFormat('Y-m-d', $dataIso);
    if (!$d || $d->format('Y-m-d') !== $dataIso) {
        return false;
    }
    return $d->diff(new DateTime('today'))->y >= $anos && $d <= new DateTime('today');
}

/** Escapa %, _ e o próprio caractere de escape para uso em LIKE ... ESCAPE '!'. */
function escapar_like(string $texto): string
{
    return str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $texto);
}

function mascarar_email(string $email): string
{
    [$local, $dominio] = array_pad(explode('@', $email, 2), 2, '');
    return mb_substr($local, 0, 2) . str_repeat('*', max(1, mb_strlen($local) - 2)) . '@' . $dominio;
}
