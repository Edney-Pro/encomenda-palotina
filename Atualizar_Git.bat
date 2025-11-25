@echo off
title Atualizador Git - Edney

echo.
echo ----------------------------------------
echo   ATUALIZANDO REPOSITORIO GIT
echo ----------------------------------------
echo.

:: Adicionar arquivos antes de qualquer coisa
echo > Adicionando arquivos locais...
git add .

:: Criar commit mesmo que seja simples
git commit -m "Atualização automática (%DATE% %TIME%)" >nul 2>&1

:: Continuar mesmo se o commit estiver vazio
echo > Puxando alteracoes do GitHub...
git pull --rebase
if errorlevel 1 (
    echo.
    echo [ERRO] Conflito encontrado! Corrija e depois rode:
    echo    git add .
    echo    git rebase --continue
    echo.
    pause
    goto end
)

echo.
echo > Enviando para o GitHub...
git push

echo.
echo ========================================
echo   SUCESSO! Repositorio atualizado.
echo ========================================

:end
echo.
pause
exit /b
