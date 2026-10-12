$ErrorActionPreference = 'Stop'

$base = 'http://127.0.0.1:8000'
$sessao = New-Object Microsoft.PowerShell.Commands.WebRequestSession

function Invoke-WadApi {
    param(
        [Parameter(Mandatory = $true)][string]$Caminho,
        [Parameter(Mandatory = $true)][string]$Metodo,
        [Parameter(Mandatory = $true)][string]$Token,
        [string]$Corpo
    )

    $parametros = @{
        Uri         = "$base$Caminho"
        Method      = $Metodo
        WebSession  = $sessao
        Headers     = @{ 'X-CSRF-Token' = $Token }
        ErrorAction = 'Stop'
    }
    if ($Corpo) {
        $parametros.ContentType = 'application/json'
        $parametros.Body = $Corpo
    }

    try {
        return Invoke-RestMethod @parametros
    } catch {
        $mensagem = $_.Exception.Message
        $resposta = $_.Exception.Response
        if ($resposta -and $resposta.GetResponseStream()) {
            $leitor = New-Object System.IO.StreamReader($resposta.GetResponseStream())
            $detalhes = $leitor.ReadToEnd()
            $leitor.Dispose()
            if ($detalhes) {
                $mensagem = $detalhes
            }
        }
        throw "Falha em $Caminho : $mensagem"
    }
}

try {
    Write-Host 'Wish a Drink - teste de pedido' -ForegroundColor Cyan
    Write-Host 'Este teste cria um pedido real de R$ 1,00 no banco; não há cobrança.'

    $sessaoInicial = Invoke-RestMethod "$base/api/me.php" -WebSession $sessao
    $credencial = Get-Credential -Message 'Entre com a conta COMUM (não use a conta master)'
    if (-not $credencial) {
        throw 'Login cancelado.'
    }

    $loginBody = @{
        email = $credencial.UserName
        senha = $credencial.GetNetworkCredential().Password
    } | ConvertTo-Json
    $login = Invoke-WadApi -Caminho '/api/login.php' -Metodo 'POST' -Token $sessaoInicial.csrf -Corpo $loginBody

    if (-not $login.precisa_2fa) {
        throw 'O servidor não iniciou a verificação em duas etapas esperada.'
    }

    $codigo = ''
    if ($login.metodo_2fa -eq 'email') {
        $pastaEmails = Join-Path $PSScriptRoot '..\storage\emails'
        if (Test-Path $pastaEmails) {
            $emailNormalizado = $credencial.UserName.Trim().ToLowerInvariant()
            $arquivos = Get-ChildItem $pastaEmails -Filter '*.txt' -File |
                Where-Object { $_.LastWriteTime -gt (Get-Date).AddMinutes(-5) } |
                Sort-Object LastWriteTime -Descending

            foreach ($arquivo in $arquivos) {
                $conteudoEmail = Get-Content $arquivo.FullName -Raw
                if ($conteudoEmail -match '(?im)^Para:\s*(?<email>[^\r\n]+)' -and
                    $Matches.email.Trim().ToLowerInvariant() -eq $emailNormalizado -and
                    $conteudoEmail -match '(?i)código de verificação é:\s*(?<codigo>\d{6})') {
                    $codigo = $Matches.codigo
                    break
                }
            }
        }
    }

    if (-not $codigo) {
        if ($login.metodo_2fa -eq 'email') {
            Write-Host "O código foi enviado para $($login.email_mascarado)."
            Write-Host 'No ambiente local, confira o código na pasta storage\emails.'
        } else {
            Write-Host 'Abra o app autenticador configurado para esta conta.'
        }
        $codigo = Read-Host 'Digite o código atual de 6 dígitos'
    } else {
        Write-Host 'Código de e-mail local encontrado.'
    }
    if ($codigo -notmatch '^\d{6}$') {
        throw 'O código precisa conter exatamente 6 dígitos.'
    }

    $verificacaoBody = @{ codigo = $codigo } | ConvertTo-Json
    $verificacao = Invoke-WadApi -Caminho '/api/verify_2fa.php' -Metodo 'POST' -Token $sessaoInicial.csrf -Corpo $verificacaoBody
    if (-not $verificacao.ok -or $verificacao.usuario.perfil -ne 'comum') {
        throw 'A autenticação não concluiu como uma conta comum. Nenhum pedido foi enviado.'
    }
    Write-Host "Login concluído: $($verificacao.usuario.email)" -ForegroundColor Green

    $pedido = @{
        itens = @(
            @{
                id = 'bebida-teste-powershell'
                nome = 'Bebida de teste (PowerShell)'
                preco = [decimal]1.00
                quantidade = 1
            }
        )
        endereco = @{
            rua_numero = 'Endereço fictício de teste, 123'
            cep = '01001000'
            cidade = 'São Paulo'
            estado = 'SP'
            complemento = ''
        }
        telefone = '11999999999'
        pagamento = 'pix'
    } | ConvertTo-Json -Depth 5

    $confirmacao = Read-Host 'Gravar pedido de teste de R$ 1,00 no banco? Digite S para confirmar'
    if ($confirmacao.Trim().ToUpperInvariant() -ne 'S') {
        Write-Host 'Cancelado. Nenhum pedido foi criado.' -ForegroundColor Yellow
        exit 0
    }

    $sessaoAtual = Invoke-RestMethod "$base/api/me.php" -WebSession $sessao
    if (-not $sessaoAtual.logado -or $sessaoAtual.usuario.perfil -ne 'comum') {
        throw 'A sessão de cliente não está mais autenticada. Nenhum pedido foi enviado.'
    }
    $resultado = Invoke-WadApi -Caminho '/api/pedidos.php' -Metodo 'POST' -Token $sessaoAtual.csrf -Corpo $pedido
    Write-Host "Pedido $($resultado.pedido.numero) registrado. Total: R$ $($resultado.pedido.total)." -ForegroundColor Green
    Write-Host 'O endereço usado é fictício e vale apenas para este pedido.'
    Write-Host 'O pagamento PIX foi apenas registrado como opção; não houve cobrança.'
} catch {
    Write-Error $_
    exit 1
}
