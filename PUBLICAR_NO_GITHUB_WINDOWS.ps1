# Script de conveniência para subir os arquivos locais depois de extrair o ZIP.
# Requer Git para Windows e autenticação do usuário no GitHub.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$repo = 'https://github.com/canalescanorff6-source/scout-pro-offline.git'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error 'Instale o Git for Windows gratuitamente (git-scm.com) e execute novamente.'
}
if (-not (Test-Path .git)) { & git init; if ($LASTEXITCODE -ne 0) { throw 'git init falhou' } }
& git branch -M main
& git remote get-url origin 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    & git remote add origin $repo
} else {
    $origin = (& git remote get-url origin).Trim()
    if ($origin -notin @($repo, 'git@github.com:canalescanorff6-source/scout-pro-offline.git')) {
        throw "Remote GitHub diferente do Scout PRO: $origin. Não publicarei em outro repositório."
    }
}
& git add -A
if ($LASTEXITCODE -ne 0) { throw 'git add falhou' }
& git diff --cached --quiet
if ($LASTEXITCODE -eq 1) {
    $msg = 'Scout PRO V72 - 246 cartas offline, imagens atualizadas e CI seguro'
    & git -c user.name='Scout PRO' -c user.email='scout-pro@users.noreply.github.com' commit -m $msg
    if ($LASTEXITCODE -ne 0) { throw 'git commit falhou' }
} elseif ($LASTEXITCODE -ne 0) { throw 'git diff falhou' }
Write-Host 'Publicando no repositório correto...' -ForegroundColor Cyan
& git push -u origin main
if ($LASTEXITCODE -ne 0) { throw 'Falha no push. Confira login, permissão e se a main recebeu alterações de outra máquina.' }
Write-Host 'Código publicado! Acompanhe GitHub > Actions.' -ForegroundColor Green
