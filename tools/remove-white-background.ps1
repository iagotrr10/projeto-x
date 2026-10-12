<#
.SYNOPSIS
  Remove o fundo branco conectado as bordas das imagens e salva como PNG.
.DESCRIPTION
  Compatível com Windows PowerShell 5.1. Faz cópia dos originais em _originais.
#>
param(
  [string]$Pasta = (Join-Path $PSScriptRoot '..\Assets\images\produtos\cervejas'),
  [ValidateRange(0, 255)][int]$Limiar = 225
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

if (-not (Test-Path -LiteralPath $Pasta)) { throw "Pasta não encontrada: $Pasta" }
$Pasta = (Resolve-Path -LiteralPath $Pasta).Path
$backup = Join-Path $Pasta '_originais'
New-Item -ItemType Directory -Force -Path $backup | Out-Null

$arquivos = Get-ChildItem -LiteralPath $Pasta -File | Where-Object { $_.Extension -in '.png', '.jpg', '.jpeg' }
$processadas = 0

foreach ($arquivo in $arquivos) {
  $copia = Join-Path $backup $arquivo.Name
  if (-not (Test-Path -LiteralPath $copia)) { Copy-Item -LiteralPath $arquivo.FullName -Destination $copia }

  $origem = [System.Drawing.Bitmap]::new($copia)
  $imagem = [System.Drawing.Bitmap]::new($origem.Width, $origem.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $grafico = [System.Drawing.Graphics]::FromImage($imagem)
  $grafico.DrawImage($origem, 0, 0, $origem.Width, $origem.Height)
  $grafico.Dispose()
  $origem.Dispose()

  $largura = $imagem.Width
  $altura = $imagem.Height
  $visitado = New-Object 'bool[]' ($largura * $altura)
  $fila = [System.Collections.Generic.Queue[int]]::new()
  for ($x = 0; $x -lt $largura; $x++) { $fila.Enqueue($x); $fila.Enqueue(($altura - 1) * $largura + $x) }
  for ($y = 1; $y -lt ($altura - 1); $y++) { $fila.Enqueue($y * $largura); $fila.Enqueue($y * $largura + $largura - 1) }

  while ($fila.Count -gt 0) {
    $indice = $fila.Dequeue()
    if ($visitado[$indice]) { continue }
    $visitado[$indice] = $true
    $x = $indice % $largura
    $y = [int][math]::Floor($indice / $largura)
    $pixel = $imagem.GetPixel($x, $y)
    if ($pixel.R -lt $Limiar -or $pixel.G -lt $Limiar -or $pixel.B -lt $Limiar) { continue }
    $imagem.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $pixel.R, $pixel.G, $pixel.B))
    if ($x -gt 0) { $fila.Enqueue($indice - 1) }
    if ($x -lt ($largura - 1)) { $fila.Enqueue($indice + 1) }
    if ($y -gt 0) { $fila.Enqueue($indice - $largura) }
    if ($y -lt ($altura - 1)) { $fila.Enqueue($indice + $largura) }
  }

  $destino = Join-Path $Pasta (([System.IO.Path]::GetFileNameWithoutExtension($arquivo.Name)) + '.png')
  $temporario = "$destino.tmp"
  $imagem.Save($temporario, [System.Drawing.Imaging.ImageFormat]::Png)
  $imagem.Dispose()
  if (Test-Path -LiteralPath $destino) {
    $backupSubstituicao = "$temporario.bak"
    [System.IO.File]::Replace($temporario, $destino, $backupSubstituicao)
    Remove-Item -LiteralPath $backupSubstituicao -Force
  } else {
    Move-Item -LiteralPath $temporario -Destination $destino
  }
  if ($arquivo.FullName -ne $destino -and (Test-Path -LiteralPath $arquivo.FullName)) {
    Remove-Item -LiteralPath $arquivo.FullName -Force
  }
  $processadas++
}

Write-Output "Imagens processadas: $processadas (originais em $backup)"
