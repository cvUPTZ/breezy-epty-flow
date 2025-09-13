@echo off
echo Installing GPU Monitor Client for Windows...
echo.

REM Check if Python is installed
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ and try again
    pause
    exit /b 1
)

echo Python found, installing dependencies...
python -m pip install --upgrade pip
python -m pip install pynvml GPUtil requests

IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Installation complete!
echo.
echo Usage:
echo   python gpu_monitor.py --api-key YOUR_API_KEY_HERE
echo   python gpu_monitor.py --api-key YOUR_API_KEY_HERE --test
echo.
echo Get your API key from the web dashboard under PC Node Management
pause