@echo off
setlocal
cd /d "%~dp0"
where git >nul 2>&1
if errorlevel 1 (
 echo Git nao encontrado. Instale https://git-scm.com/downloads/win
 pause
 exit /b 1
)
echo Publicando Scout PRO V72 para canalescanorff6-source/scout-pro-offline...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0PUBLICAR_NO_GITHUB_WINDOWS.ps1"
if errorlevel 1 (
 echo FALHA NA PUBLICACAO. Confira as mensagens acima.
 pause
 exit /b 1
)
echo Concluido. Acompanhe Actions no GitHub.
pause
