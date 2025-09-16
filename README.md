# Football Analytics Platform

This project is a comprehensive, full-stack platform for football (soccer) match analysis. It provides a complete ecosystem for recording, analyzing, and visualizing match data, with advanced collaboration features and administrative tools for coaches, analysts, and football organizations.

For a more detailed feature list, see [APP_DESCRIPTION.md](APP_DESCRIPTION.md).

## Architecture Overview

The platform consists of several key components:

- **React Frontend**: The main web application built with React, Vite, and TypeScript. It provides all the user interfaces for data entry, visualization, and administration.
- **Python Detection Service**: A backend service written in Python using FastAPI. It's designed to handle computationally intensive tasks like player and ball detection in video footage using machine learning models.
- **Supabase**: Used as the primary backend-as-a-service provider. It handles the PostgreSQL database, user authentication, real-time data synchronization via subscriptions, and serverless Edge Functions.
- **Chrome Extension**: A browser extension that facilitates integration and data capture from external sources.

## Local Development Setup

To run the full application locally, you will need to set up each component.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Python](https://www.python.org/) (v3.10 or later)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_DIRECTORY>
```

### 2. Supabase Setup

The project uses Supabase for the database and authentication. To run it locally, you need to use the Supabase CLI.

```sh
# Start the local Supabase services
supabase start
```

Once the services are running, the CLI will output the local Supabase configuration, including the **URL** and the **anon key**. You will need these for the frontend.

**Example output:**
```
Started local development setup.
...
API URL: http://127.0.0.1:54321
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Frontend Setup

The frontend is a React application built with Vite.

```sh
# Navigate to the root directory
cd <YOUR_PROJECT_DIRECTORY>

# Install dependencies
npm install
```

**Connecting to Supabase:**

The frontend needs to connect to your local Supabase instance. The connection details are located in `src/integrations/supabase/client.ts`. This file is auto-generated in the production environment and contains production keys. For local development, you must **temporarily** replace them.

1.  Open `src/integrations/supabase/client.ts`.
2.  Replace the hardcoded `SUPABASE_URL` with the `API URL` from the `supabase start` output.
3.  Replace the hardcoded `SUPABASE_PUBLISHABLE_KEY` with the `anon key` from the `supabase start` output.

**WARNING:** Do **NOT** commit these changes to `src/integrations/supabase/client.ts`. This file should remain with the production keys in version control.

**Running the Frontend:**

```sh
# Start the development server
npm run dev
```

The application should now be running at `http://localhost:5173`.

### 4. Python Detection Service Setup

The detection service is a FastAPI application.

```sh
# Navigate to the service directory
cd python-detection-service

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
# You may need to check main.py for the correct run command.
# A common way to run FastAPI is with uvicorn:
uvicorn main:app --reload
```

The Python service will typically run on `http://127.0.0.1:8000`. You may need to configure the frontend to point to this local service URL via environment variables if you are testing features that rely on it.

### 5. Chrome Extension Setup

1.  Open Google Chrome and navigate to `chrome://extensions`.
2.  Enable "Developer mode" using the toggle in the top-right corner.
3.  Click the "Load unpacked" button.
4.  Select the `chrome-extension` directory from this project.
5.  The extension should now be loaded and active in your browser.
