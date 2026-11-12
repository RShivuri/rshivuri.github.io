Add-Type -AssemblyName System.Drawing
$dir   = "C:\Users\RonellS\OneDrive - Paycorp Group (Pty) Ltd\Desktop\rshivuri-portfolio"
$fonts = "$dir\assets-raw\fonts"
$S = 2                       # HD: draw at 2x LinkedIn's 1584x396
$W = 1584; $H = 396

function LoadFont($file, $size) {
  $pfc = New-Object System.Drawing.Text.PrivateFontCollection
  $pfc.AddFontFile("$fonts\$file")
  $fam = $pfc.Families[0]
  foreach ($st in @([System.Drawing.FontStyle]::Regular, [System.Drawing.FontStyle]::Bold)) {
    if ($fam.IsStyleAvailable($st)) { return New-Object System.Drawing.Font($fam, [single]$size, $st, [System.Drawing.GraphicsUnit]::Pixel) }
  }
}
function C($hex, $a = 255) { $c = [System.Drawing.ColorTranslator]::FromHtml($hex); [System.Drawing.Color]::FromArgb($a, $c.R, $c.G, $c.B) }
function Brush($hex, $a = 255) { New-Object System.Drawing.SolidBrush (C $hex $a) }

$bmp = New-Object System.Drawing.Bitmap ($W*$S), ($H*$S)
$bmp.SetResolution(144,144)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.ScaleTransform($S, $S)
$g.SmoothingMode = 'AntiAlias'; $g.TextRenderingHint = 'AntiAlias'
$g.InterpolationMode = 'HighQualityBicubic'; $g.PixelOffsetMode = 'HighQuality'
$fmt = [System.Drawing.StringFormat]::GenericTypographic
$fmt.FormatFlags = $fmt.FormatFlags -bor [System.Drawing.StringFormatFlags]::MeasureTrailingSpaces

# palette from the portfolio
$ink='#070B12'; $fg='#EEF2F8'; $muted='#8E9BB3'; $line='#2A3850'; $accent='#5B86FF'; $amber='#FFB547'; $green='#3DD6A3'

# ground, dot grid, cobalt glow
$g.Clear((C $ink))
$dot = Brush '#1E2A3D'
for ($x=14; $x -lt $W; $x+=28) { for ($y=14; $y -lt $H; $y+=28) { $g.FillEllipse($dot, $x, $y, 1.6, 1.6) } }
$gp = New-Object System.Drawing.Drawing2D.GraphicsPath; $gp.AddEllipse(980, -320, 980, 980)
$pg = New-Object System.Drawing.Drawing2D.PathGradientBrush $gp
$pg.CenterColor = (C $accent 105); $pg.SurroundColors = @((C $ink 0))
$g.FillEllipse($pg, 980, -320, 980, 980)
$gp2 = New-Object System.Drawing.Drawing2D.GraphicsPath; $gp2.AddEllipse(-260, 220, 700, 420)
$pg2 = New-Object System.Drawing.Drawing2D.PathGradientBrush $gp2
$pg2.CenterColor = (C $accent 40); $pg2.SurroundColors = @((C $ink 0))
$g.FillEllipse($pg2, -260, 220, 700, 420)

function Pill($x, $y, $h, $text, $font, $txt, $border, $fill, $dotHex) {
  $tw = $g.MeasureString($text, $font, 2000, $fmt).Width
  $padL = if ($dotHex) { 30 } else { 14 }
  $w = $tw + $padL + 14
  $r = $h
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p.AddArc($x, $y, $r, $h, 90, 180); $p.AddArc($x + $w - $r, $y, $r, $h, 270, 180); $p.CloseFigure()
  if ($fill) { $g.FillPath((Brush $fill[0] $fill[1]), $p) }
  $g.DrawPath((New-Object System.Drawing.Pen (C $border), 1.4), $p)
  if ($dotHex) { $g.FillEllipse((Brush $dotHex), $x + 13, $y + $h/2 - 4, 8, 8) }
  $th = $font.GetHeight($g)
  $g.DrawString($text, $font, (Brush $txt), $x + $padL, $y + ($h - $th)/2 + 0.5, $fmt)
  return $w
}

$left = 486; $right = $W - 96
$m = '  ' + [string][char]0x00B7 + '  '
$dy = 16   # shift the block down so it sits centred in the 396px band

# kicker pill, like the site's release pill
$fK = LoadFont 'IBMPlexMono-Medium.ttf' 14
Pill $left (38+$dy) 30 ('DYNAMICS 365 CE' + $m + 'POWER PLATFORM' + $m + 'C# / .NET 8') $fK $muted $line @('#0F1726',255) $green | Out-Null

# headline, auto-fit to the column
$size = 56
do { $fH = LoadFont 'Archivo-ExpandedExtraBold.ttf' $size; $hw = $g.MeasureString('Senior .NET C# D365 Developer', $fH, 4000, $fmt).Width; $size -= 1 } while ($hw -gt ($right - $left))
$g.DrawString('Senior .NET C# D365 Developer', $fH, (Brush $fg), $left - 2, (86+$dy), $fmt)

# subline with the accent phrase in cobalt, like "pipeline" on the site
$fS = LoadFont 'IBMPlexSans-Regular.ttf' 24
$a = 'Enterprise CRM for financial services: architected, automated, '
$b = 'shipped safely.'
$g.DrawString($a, $fS, (Brush '#C9D3E4'), $left, (160+$dy), $fmt)
$aw = $g.MeasureString($a, $fS, 4000, $fmt).Width
$g.DrawString($b, (LoadFont 'IBMPlexSans-Medium.ttf' 24), (Brush $accent), $left + $aw, (160+$dy), $fmt)

# stack line
$fM = LoadFont 'IBMPlexMono-Regular.ttf' 15
$g.DrawString(('Dataverse' + $m + 'Web API & SDK' + $m + 'Azure DevOps pipelines' + $m + 'AI-assisted engineering (Claude, MCP, Copilot)'), $fM, (Brush $muted), $left, (202+$dy), $fmt)

# release line chips
$fC = LoadFont 'IBMPlexMono-Medium.ttf' 15
$x = $left; $y = 238 + $dy
$stages = @(
  @('Design',$line,$green), @('Build',$line,$green), @('E2E test',$line,$green), @('QA',$line,$green),
  @('2-person approval',$amber,$amber), @('PROD',$green,$green)
)
for ($i=0; $i -lt $stages.Count; $i++) {
  $s = $stages[$i]
  $fill = if ($s[0] -eq 'PROD') { @($green, 30) } elseif ($s[1] -eq $amber) { @($amber, 26) } else { @('#0F1726', 255) }
  $w = Pill $x $y 32 $s[0] $fC $fg $s[1] $fill $s[2]
  $x += $w
  if ($i -lt $stages.Count - 1) {
    $pen = New-Object System.Drawing.Pen (C $accent 200), 1.4
    $pen.DashStyle = 'Dash'
    $g.DrawLine($pen, $x + 5, $y + 16, $x + 23, $y + 16)
    $g.FillEllipse((Brush $accent), $x + 22, $y + 13, 6, 6)
    $x += 32
  }
}

# certification row
$fCert = LoadFont 'IBMPlexMono-Medium.ttf' 13.5
$y = 296 + $dy
$g.DrawString('Microsoft Certified', (LoadFont 'IBMPlexSans-Medium.ttf' 15), (Brush $muted), $left, $y + 6, $fmt)
$x = $left + $g.MeasureString('Microsoft Certified', (LoadFont 'IBMPlexSans-Medium.ttf' 15), 2000, $fmt).Width + 16
$x += (Pill $x $y 30 'PL-600 Solution Architect Expert' $fCert $fg $accent @($accent, 40) $accent) + 10
foreach ($c in @('PL-400','MB-230','AZ-400','AZ-900')) { $x += (Pill $x $y 30 $c $fCert '#C9D3E4' $line @('#0F1726',255) $null) + 8 }

$out = "$dir\linkedin-banner.png"
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Copy-Item $out "C:\Users\RonellS\AppData\Local\Temp\claude\378aa9259e52e767\c5484744-40c6-42e4-bdf1-af0cc069bee4\scratchpad\linkedin-banner.png" -Force
"{0} bytes, headline {1}px" -f (Get-Item $out).Length, ($size + 1)
