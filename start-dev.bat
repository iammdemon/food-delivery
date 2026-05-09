@echo off
echo Starting backend server...
start "Backend - Express :5001" cmd /k "cd /d "%~dp0server" && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting frontend server...
start "Frontend - Vite :5173" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo Both servers are starting.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5001
