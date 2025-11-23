# PowerShell script to create basic installer images
# Requires .NET for bitmap creation

Add-Type -AssemblyName System.Drawing

# Create installer sidebar (164x314)
$sidebar = New-Object System.Drawing.Bitmap(164, 314)
$graphics = [System.Drawing.Graphics]::FromImage($sidebar)
$graphics.Clear([System.Drawing.Color]::FromArgb(103, 126, 234))  # Purple gradient color

# Add text
$font = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
$brush = [System.Drawing.Brushes]::White
$graphics.DrawString("SRMS", $font, $brush, 20, 120)
$graphics.DrawString("Setup", $font, $brush, 20, 150)

$sidebar.Save("$PSScriptRoot\installerSidebar.bmp", [System.Drawing.Imaging.ImageFormat]::Bmp)
$graphics.Dispose()
$sidebar.Dispose()

Write-Host "Created installerSidebar.bmp (164x314)" -ForegroundColor Green

# Create installer header (150x57)
$header = New-Object System.Drawing.Bitmap(150, 57)
$graphics = [System.Drawing.Graphics]::FromImage($header)
$graphics.Clear([System.Drawing.Color]::FromArgb(224, 229, 236))  # Light gray

$smallFont = New-Object System.Drawing.Font("Arial", 12, [System.Drawing.FontStyle]::Bold)
$darkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 60, 60))
$graphics.DrawString("SRMS", $smallFont, $darkBrush, 10, 18)

$header.Save("$PSScriptRoot\installerHeader.bmp", [System.Drawing.Imaging.ImageFormat]::Bmp)
$graphics.Dispose()
$header.Dispose()
$darkBrush.Dispose()

Write-Host "Created installerHeader.bmp (150x57)" -ForegroundColor Green

Write-Host "`nInstaller images created successfully!" -ForegroundColor Cyan
Write-Host "You can now customize these images with any image editor." -ForegroundColor Yellow
