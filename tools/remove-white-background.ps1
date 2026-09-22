Add-Type -Path "$env:WINDIR\Microsoft.NET\Framework64\v4.0.30319\System.Drawing.dll"

$folder = Join-Path $PSScriptRoot '..\Assets\images\produtos\cervejas'
$files = Get-ChildItem $folder -File | Where-Object { $_.Extension -in '.png', '.jpg', '.jpeg' }
$processed = 0

foreach ($file in $files) {
  $source = [System.Drawing.Bitmap]::new($file.FullName)
  $outputName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name) + '.png'
  $output = Join-Path $folder $outputName
  $bitmap = [System.Drawing.Bitmap]::new($source.Width, $source.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.DrawImage($source, 0, 0, $source.Width, $source.Height)
  $graphics.Dispose()

  $queue = [System.Collections.Generic.Queue[System.Drawing.Point]]::new()
  $visited = [System.Collections.Generic.HashSet[string]]::new()
  for ($x = 0; $x -lt $bitmap.Width; $x++) {
    $queue.Enqueue([System.Drawing.Point]::new($x, 0))
    $queue.Enqueue([System.Drawing.Point]::new($x, $bitmap.Height - 1))
  }
  for ($y = 1; $y -lt ($bitmap.Height - 1); $y++) {
    $queue.Enqueue([System.Drawing.Point]::new(0, $y))
    $queue.Enqueue([System.Drawing.Point]::new($bitmap.Width - 1, $y))
  }

  while ($queue.Count -gt 0) {
    $point = $queue.Dequeue()
    $key = "$($point.X):$($point.Y)"
    if (-not $visited.Add($key)) { continue }
    $pixel = $bitmap.GetPixel($point.X, $point.Y)
    if ($pixel.R -lt 225 -or $pixel.G -lt 225 -or $pixel.B -lt 225) { continue }
    $bitmap.SetPixel($point.X, $point.Y, [System.Drawing.Color]::FromArgb(0, $pixel.R, $pixel.G, $pixel.B))
    if ($point.X -gt 0) { $queue.Enqueue([System.Drawing.Point]::new($point.X - 1, $point.Y)) }
    if ($point.X -lt ($bitmap.Width - 1)) { $queue.Enqueue([System.Drawing.Point]::new($point.X + 1, $point.Y)) }
    if ($point.Y -gt 0) { $queue.Enqueue([System.Drawing.Point]::new($point.X, $point.Y - 1)) }
    if ($point.Y -lt ($bitmap.Height - 1)) { $queue.Enqueue([System.Drawing.Point]::new($point.X, $point.Y + 1)) }
  }

  $temporary = "$output.tmp.png"
  $bitmap.Save($temporary, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
  $source.Dispose()
  Move-Item -Force $temporary $output
  if ($file.FullName -ne (Resolve-Path $output).Path) { Remove-Item $file.FullName -Force }
  $processed++
}

Write-Output "Imagens processadas: $processed"
