$htmlPath = Join-Path $PSScriptRoot '..\Alexandria.html'
$html = Get-Content -Raw $htmlPath -ErrorAction Stop

$articlePattern = '(?si)<article\b.*?>.*?</article>'
$matches = [regex]::Matches($html, $articlePattern)

$seen = @{}
$imported = 0
$skipped = 0
$errors = 0

foreach ($m in $matches) {
    $block = $m.Value
    $title = ([regex]::Match($block,'(?si)<h3[^>]*>(.*?)</h3>').Groups[1].Value).Trim()
    if (-not $title) { continue }

    $author = ([regex]::Match($block,'(?si)<span[^>]*class\s*=\s*"[^"]*tag-autor[^"]*"[^>]*>(.*?)</span>').Groups[1].Value).Trim()
    if ($author -match '[:]\s*(.*)') { $author = $Matches[1].Trim() }
    if (-not $author) { $author = '' }

    $categoria = ([regex]::Match($block,'(?si)<span[^>]*class\s*=\s*"[^"]*tag-categoria[^"]*"[^>]*>(.*?)</span>').Groups[1].Value).Trim()
    if (-not $categoria) { $categoria = '' }

    $key = $title.ToLower()
    if ($seen.ContainsKey($key)) { continue } else { $seen[$key] = $true }

    $body = @{ titulo = $title; autor = $author; editora = $categoria; ano = $null } | ConvertTo-Json

    try {
        $resp = Invoke-RestMethod -Uri 'http://localhost:3000/api/livros' -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop
        Write-Host "Imported: $title"
        $imported++
    } catch {
        # Detecta conflito 409 (livro já existe)
        $ex = $_.Exception
        $status = $null
        if ($ex.Response -and $ex.Response.StatusCode) { $status = $ex.Response.StatusCode.Value__ }
        if ($status -eq 409) {
            Write-Host "Skipped (exists): $title"
            $skipped++
        } else {
            Write-Host ("Error importing {0}: {1}" -f $title, $_.Exception.Message)
            $errors++
        }
    }
}

Write-Host ""
Write-Host ("Summary: Imported {0}, Skipped {1}, Errors {2}, Total unique {3}" -f $imported, $skipped, $errors, $seen.Count)
