@echo off
setlocal EnableExtensions

echo ----------------------------------------
echo   ATUALIZANDO REPOSITORIO GIT
echo ----------------------------------------

:: 1. Se estiver em detached HEAD, salvar e voltar para main
git symbolic-ref --short HEAD >nul 2>&1
IF ERRORLEVEL 1 (
    echo Detected detached HEAD. Salvando alteracoes...
    git add -A
    git commit -m "Auto-commit: salvando alteracoes pendentes"
    git checkout main
)

:: 2. Commit automatico (push-only, sem pull)
git add -A
git commit -m "Atualizacao automatica" >nul 2>&1

IF ERRORLEVEL 1 (
    echo Nenhuma alteracao para comitar.
) ELSE (
    echo Commit criado com sucesso.
)

:: 3. Push direto
echo Enviando para o repositorio remoto...
git push origin main --force-with-lease

echo ----------------------------------------
echo   Atualizacao concluida!
echo ----------------------------------------
pause
