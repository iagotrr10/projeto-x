Add-Type -Path "$env:WINDIR\Microsoft.NET\Framework64\v4.0.30319\System.Drawing.dll"

$folder = Join-Path $PSScriptRoot '..\Assets\images\produtos\cervejas'
$files = Get-ChildItem $folder -Filter '*.png' -File
$processed = 0

foreach ($file in $files) {
  $source = [System.Drawing.Bitmap]::new($file.FullName)
  $source.MakeTransparent([System.Drawing.Color]::White)
  $temporary = "$($file.FullName).tmp"
  $source.Save($temporary, [System.Drawing.Imaging.ImageFormat]::Png)
  $source.Dispose()
  Move-Item -Force $temporary $file.FullName
  $processed++
}

Write-Output "Imagens processadas: $processed"
