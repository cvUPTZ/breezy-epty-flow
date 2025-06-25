
"""
Vercel API endpoint handler
"""
from vercel_main import app

# Export the FastAPI app as the Vercel handler
handler = app
