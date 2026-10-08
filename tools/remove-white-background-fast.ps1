<#
.SYNOPSIS
  Remove somente pixels brancos puros e salva as imagens como PNG.
.DESCRIPTION
  Compatível com Windows PowerShell 5.1. Faz cópia dos originais em _originais.
#>
param(
  [string]$Pasta = (Join-Path $PSScriptRoot '..\Assets\images\produtos\cervejas')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

if (-not (Test-Path -LiteralPath $Pasta)) { throw "Pasta não encontrada: $Pasta" }
$Pasta = (Resolve-Path -LiteralPath $Pasta).Path
$backup = Join-Path $Pasta '_originais'
New-Item -ItemType Directory -Force -Path $backup | Out-Null

$processadas = 0
foreach ($arquivo in (Get-ChildItem -LiteralPath $Pasta -Filter '*.png' -File)) {
  $copia = Join-Path $backup $arquivo.Name
  if (-not (Test-Path -LiteralPath $copia)) { Copy-Item -LiteralPath $arquivo.FullName -Destination $copia }

  $origem = [System.Drawing.Bitmap]::new($copia)
  $imagem = [System.Drawing.Bitmap]::new($origem.Width, $origem.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $grafico = [System.Drawing.Graphics]::FromImage($imagem)
  $grafico.DrawImage($origem, 0, 0, $origem.Width, $origem.Height)
  $grafico.Dispose()
  $origem.Dispose()

  $imagem.MakeTransparent([System.Drawing.Color]::White)
  $temporario = "$($arquivo.FullName).tmp"
  $imagem.Save($temporario, [System.Drawing.Imaging.ImageFormat]::Png)
  $imagem.Dispose()
  $backupSubstituicao = "$temporario.bak"
  [System.IO.File]::Replace($temporario, $arquivo.FullName, $backupSubstituicao)
  Remove-Item -LiteralPath $backupSubstituicao -Force
  $processadas++
}

Write-Output "Imagens processadas: $processadas (originais em $backup)"
