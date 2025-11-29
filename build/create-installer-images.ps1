# PowerShell script to create basic installer images
# Requires .NET for bitmap creation

Add-Type -AssemblyName System.Drawing

# Create installer sidebar (164x314)
$sidebar = New-Object System.Drawing.Bitmap(164, 314)
$graphics = [System.Drawing.Graphics]::FromImage($sidebar)
$graphics.Clear([System.Drawing.Color]::FromArgb(45, 38, 64))  # Dark purple matching app theme

# Try to load and draw logo if icon.ico exists
$logoPath = "$PSScriptRoot\icon.ico"
if (Test-Path $logoPath) {
    try {
        $icon = New-Object System.Drawing.Icon($logoPath)
        $logoBitmap = $icon.ToBitmap()
        # Resize logo to fit (48x48) and center it
        $logoSize = 48
        $logoX = (164 - $logoSize) / 2
        $logoY = 40
        $graphics.DrawImage($logoBitmap, $logoX, $logoY, $logoSize, $logoSize)
        $logoBitmap.Dispose()
        $icon.Dispose()
    } catch {
        Write-Host "Could not load logo, continuing without it..." -ForegroundColor Yellow
    }
}

# Add text
$font = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
$brush = [System.Drawing.Brushes]::White
$graphics.DrawString("CIMS", $font, $brush, 20, 120)
$graphics.DrawString("Setup", $font, $brush, 20, 150)

$sidebar.Save("$PSScriptRoot\installerSidebar.bmp", [System.Drawing.Imaging.ImageFormat]::Bmp)
$graphics.Dispose()
$sidebar.Dispose()

Write-Host "Created installerSidebar.bmp (164x314)" -ForegroundColor Green

# Create installer header (150x57)
$header = New-Object System.Drawing.Bitmap(150, 57)
$graphics = [System.Drawing.Graphics]::FromImage($header)
$graphics.Clear([System.Drawing.Color]::FromArgb(31, 27, 46))  # Darker purple for header (#1F1B2E)

# Try to add logo to header
if (Test-Path $logoPath) {
    try {
        $icon = New-Object System.Drawing.Icon($logoPath)
        $logoBitmap = $icon.ToBitmap()
        # Small logo for header (32x32)
        $logoSize = 32
        $logoX = 10
        $logoY = (57 - $logoSize) / 2
        $graphics.DrawImage($logoBitmap, $logoX, $logoY, $logoSize, $logoSize)
        $logoBitmap.Dispose()
        $icon.Dispose()
        
        # Draw text next to logo
        $smallFont = New-Object System.Drawing.Font("Arial", 12, [System.Drawing.FontStyle]::Bold)
        $lightBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
        $graphics.DrawString("CIMS", $smallFont, $lightBrush, 50, 18)
    } catch {
        # Fallback without logo
        $smallFont = New-Object System.Drawing.Font("Arial", 12, [System.Drawing.FontStyle]::Bold)
        $lightBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
        $graphics.DrawString("CIMS", $smallFont, $lightBrush, 10, 18)
    }
} else {
    $smallFont = New-Object System.Drawing.Font("Arial", 12, [System.Drawing.FontStyle]::Bold)
    $lightBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $graphics.DrawString("CIMS", $smallFont, $lightBrush, 10, 18)
}

$header.Save("$PSScriptRoot\installerHeader.bmp", [System.Drawing.Imaging.ImageFormat]::Bmp)
$graphics.Dispose()
$header.Dispose()
$lightBrush.Dispose()

Write-Host "Created installerHeader.bmp (150x57)" -ForegroundColor Green

Write-Host "`nInstaller images created successfully!" -ForegroundColor Cyan
Write-Host "You can now customize these images with any image editor." -ForegroundColor Yellow
