#!/bin/bash

echo "Installing GPU Monitor Client for Linux/macOS..."
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.7+ and try again"
    exit 1
fi

echo "Python found, installing dependencies..."
python3 -m pip install --upgrade pip
python3 -m pip install pynvml GPUtil requests

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo
echo "✅ Installation complete!"
echo
echo "Usage:"
echo "  python3 gpu_monitor.py --api-key YOUR_API_KEY_HERE"
echo "  python3 gpu_monitor.py --api-key YOUR_API_KEY_HERE --test"
echo
echo "Get your API key from the web dashboard under PC Node Management"