
"""
Vercel API endpoint handler for SOTA detection service
"""
import sys
import os

# Add the python-detection-service directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'python-detection-service'))

from vercel_main import app

# Export the FastAPI app as the Vercel handler
handler = app
