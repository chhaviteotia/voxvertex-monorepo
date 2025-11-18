@echo off
echo Switching to LOCAL backend...
echo.
echo Copying backend environment file...
copy /Y apps\backend\env.local.dev apps\backend\.env.local
echo.
echo Environment set to LOCAL backend
echo.
echo To start development:
echo   Frontend: cd apps\frontend && npm run dev
echo   Backend:  cd apps\backend && npm run dev
echo.
echo Or use: npm run dev:full (from frontend directory)
pause

