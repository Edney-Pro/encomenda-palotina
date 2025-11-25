@echo off
setlocal EnableExtensions

echo ----------------------------------------
echo   ATUALIZANDO REPOSITORIO GIT
echo ----------------------------------------

:: 1. Finaliza rebase pendente, se houver
git rebase --continue >nul 2>&1

:: 2. Verifica se esta em detached HEAD
git symbolic-ref --short HEAD >nul 2>&1
IF ERRORLEVEL 1 (
    echo Salvando alteracoes em detached HEAD...
    git add -A
    git commit -m "Auto-commit: salvando alteracoes pendentes"
    echo Voltando para a branch main...
    git checkout main
)

:: 3. Atualiza branch local com remoto
echo Atualizando branch local...
git pull --rebase origin main

:: 4. Verifica se ha alteracoes reais para commit
git diff --quiet
IF ERRORLEVEL 1 (
    echo Realizando commit...
    git add -A
    git commit -m "Atualizacao automatica"
) ELSE (
    echo Nenhuma alteracao para comitar.
)

:: 5. Push seguro
echo Enviando para o repositorio remoto...
git push origin main --force-with-lease

echo ----------------------------------------
echo   Atualizacao concluida!
echo ----------------------------------------
pause
