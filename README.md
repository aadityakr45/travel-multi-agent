# Voyanta AI

Voyanta AI is a multi-agent travel-planning application built with React,
FastAPI, LangGraph, MCP, and a human-in-the-loop review step. A user describes
a trip in natural language, the backend routes the request to the relevant
travel agents, and the React interface presents a draft for approval or
revision before the final plan is generated.

## Features

- React and TypeScript single-page frontend powered by Vite
- LangGraph workflow with supervisor routing and input guardrails
- Specialist agents for flights, hotels, weather, budgets, and itineraries
- Server-sent events (SSE) for live pipeline progress in the frontend
- Human approval and revision feedback before finalization
- Markdown rendering, clipboard copy, and PDF export
- Trip history stored in the browser's local storage
- PostgreSQL checkpointer for durable LangGraph thread state
- In-memory checkpointer fallback for local development when PostgreSQL is unavailable
- MCP integrations for Tavily, AviationStack, and a local weather server

## Architecture

```text
React + Vite frontend
        |
        | REST and SSE requests through /api
        v
FastAPI application (app.py)
        |
        v
LangGraph workflow (backend.py)
        |
        +--> Guardrails and Supervisor
        +--> Flight Agent      -> AviationStack MCP
        +--> Hotel Agent       -> Tavily MCP
        +--> Weather Agent     -> local custom weather MCP server
        +--> Budget Agent
        +--> Itinerary Agent
        +--> Human Approval
        +--> Final Response Agent
        |
        v
PostgreSQL checkpointer or local MemorySaver fallback
```

The workflow runs in this order:

1. The guardrail checks whether the request is travel-related and appropriate.
2. The supervisor selects the specialist agents and extracts trip constraints.
3. Selected agents gather travel information and recommendations.
4. The itinerary agent creates a draft plan.
5. The workflow pauses for human approval or revision feedback.
6. The final response agent produces the approved or revised travel plan.

The architecture diagram is available at
[`assets/Voyanta_architecture.png`](assets/Voyanta_architecture.png).

## Project Structure

```text
app.py                         FastAPI routes and React frontend serving
backend.py                     LangGraph state, agents, routing, and persistence
mcp_client.py                  MCP client and external tool adapters
custom_weather_mcp_server.py   Local weather MCP server
tools/                         Additional travel tool implementations
assets/                        Favicon and architecture image
web/
  src/                         React application source
  src/routes/                  Planner, history, settings, auth, and info pages
  src/features/planner/        Prompt, pipeline, approval, results, and export UI
  src/lib/                     API, types, markdown, and local-storage helpers
  public/                      Public frontend assets
  vite.config.ts               Vite config and /api proxy
```

The old template-based frontend has been removed. The supported frontend is
`web/`.

## Requirements

- Python 3.10 or newer
- Node.js 20 or newer
- npm
- PostgreSQL for durable thread persistence (optional for local testing)
- API keys for the services enabled in your environment

## Environment configuration

### 1. Create the Python environment

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Install frontend dependencies

```powershell
cd web
npm install
cd ..
```

### 3. Configure environment variables

Copy `.env.example` to `.env` in the project root and fill in the values you
need. The main variables are:

| Variable | Used for |
| --- | --- |
| `GROQ_API_KEY` | Supervisor, specialist, itinerary, and final-response LLM calls |
| `TAVILY_API_KEY` | Hotel and web search through Tavily MCP |
| `AVIATIONSTACK_API_KEY` | AviationStack MCP flight and airport data |
| `OPENWEATHER_API_KEY` | The local weather MCP server |
| `DATABASE_URL` | PostgreSQL LangGraph checkpointer |
| `DEFAULT_ORIGIN_IATA` | Default departure airport when an origin is not provided |
| `LANGSMITH_API_KEY` | Optional LangSmith tracing |
| `LANGSMITH_TRACKING` | Optional LangSmith tracing toggle |
| `LANGSMITH_ENDPOINT` | Optional LangSmith endpoint |
| `LANGSMITH_PROJECT` | Optional LangSmith project name |

Never commit `.env` or real API keys. Use `.env.example` as the safe template.

## Development

Run the FastAPI backend from the repository root:

```powershell
.\.venv\Scripts\Activate.ps1
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

In a second terminal, run the React development server:

```powershell
cd web
npm run dev
```

Open `http://127.0.0.1:5173`. Vite proxies `/api` requests to FastAPI on
port 8000.

## Production-style local run

Build the React application first:

```powershell
cd web
npm run build
cd ..
```

Then start FastAPI:

```powershell
.\.venv\Scripts\Activate.ps1
uvicorn app:app --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000`. FastAPI serves `web/dist/index.html` and the
hashed files in `web/dist/web-assets`. If the React build is missing, the root
and SPA routes return a build-required `503` response.

## Docker

The Dockerfile builds the React frontend first and then copies the built files
into the Python image:

```powershell
docker build -t voyanta-ai .
docker run --env-file .env -p 8000:8000 voyanta-ai
```

Open `http://127.0.0.1:8000` after the container starts.

## API

All planning endpoints are available under `/api`.

### Health check

```http
GET /health
```

### Start or continue a planning run

```http
POST /api/travel
Content-Type: application/json

{
  "message": "Plan a 7 day Japan trip from Delhi under 2 lakh INR",
  "thread_id": "optional-existing-thread-id"
}
```

This returns a JSON travel result. New runs receive a generated `thread_id`.

### Start or continue a planning run with live progress

```http
POST /api/travel/stream
Content-Type: application/json

{
  "message": "Plan a 7 day Japan trip from Delhi under 2 lakh INR",
  "thread_id": null
}
```

The response is an SSE stream. Events include:

- `node` when a workflow node completes
- `awaiting_approval` when the draft is ready for review
- `complete` when the final plan is ready
- `error` when the stream fails

### Approve or revise a draft

```http
POST /api/travel/approve
Content-Type: application/json

{
  "thread_id": "user-thread-id",
  "approved": true,
  "feedback": ""
}
```

Set `approved` to `false` and provide `feedback` to request changes. The
streaming equivalent is `POST /api/travel/approve/stream`.

### Fetch an existing thread

```http
GET /api/travel/{thread_id}
```

This is used by the React trip page to reload an existing planning session.

## Frontend Routes

- `/trips/new` - start a new trip
- `/trips/:threadId` - view or resume a planning session
- `/history` - view trips saved in the current browser
- `/settings` - appearance, privacy, and account-preview settings
- `/how-it-works` - workflow explanation
- `/about` - application information
- `/privacy` - privacy information
- `/login` and `/signup` - account UI placeholders

Trip history is browser-local and is not an account-backed synchronization
feature yet.

## MCP Integrations

`mcp_client.py` loads MCP tools on demand:

- Tavily uses the remote streamable HTTP MCP endpoint.
- AviationStack uses the `aviationstack-mcp` command through stdio and requires
  `uvx` to be available.
- Weather starts `custom_weather_mcp_server.py` as a local stdio MCP server.

The local weather server can also be run directly for experimentation:

```powershell
python custom_weather_mcp_server.py
```

## Validation Commands

Run the frontend checks:

```powershell
cd web
npm run build
npm run lint
```

Run a Python syntax check from the repository root:

```powershell
python -m py_compile app.py backend.py mcp_client.py custom_weather_mcp_server.py
```

There is currently no dedicated automated test suite in the repository.

## Persistence and Local Fallback

When `DATABASE_URL` is reachable, LangGraph uses `PostgresSaver` for thread
state. If PostgreSQL cannot be reached, the backend falls back to
`MemorySaver`, which keeps the application usable during local development
but does not preserve threads across process restarts.

## Development Notes

- The frontend expects FastAPI on port 8000 during Vite development.
- The API uses synchronous FastAPI route handlers for graph execution so the
  graph's async MCP calls run safely in worker threads.
- Live fares and search data are guidance and should be verified before a real
  booking.
- The project demonstrates orchestration patterns and is not production
  hardening or booking infrastructure.

## Contributing

Contributions are welcome for documentation, UI improvements, bug fixes,
additional MCP adapters, and automated tests.

## License

This project is licensed under the terms in [LICENSE](LICENSE).
