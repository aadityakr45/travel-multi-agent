# Voyanta AI

Voyanta AI is a multi-agent travel planning  built with LangGraph, MCP, and FastAPI. It shows how a supervisor-led workflow, input guardrails, and human-in-the-loop approval can work together to generate travel itineraries in a safer, more reviewable way.

## Overview

This project combines:

- LangGraph for multi-step orchestration
- MCP for tool and adapter integration
- A supervisor pattern for routing tasks across specialized agents
- Guardrails for validating user requests
- Human approval before final itinerary generation
- A FastAPI web interface for interacting with the system

The app can coordinate tasks such as flight research, hotel suggestions, weather checks, budget review, and itinerary drafting.

## Features

- Interactive web UI for submitting travel planning requests
- Supervisor-based routing across multiple travel agents
- Input guardrail checks before planning begins
- Draft approval and revision flow before final output
- PDF export for generated travel plans
- Example custom MCP server for weather-related tooling

# System Architecture

The architecture below illustrates the end-to-end workflow of **Voyanta AI**, a production-inspired multi-agent travel planning system built with LangGraph, MCP, Supervisor Agent, Guardrails, and Human-in-the-Loop (HITL).

<p align="center">
  <img src="assets\Voyanta_architecture.png" alt="Voyanta AI Architecture" width="1000">
</p>

### Key Components

- 🛡️ Input Guardrails for request validation
- 🤖 Supervisor Agent for dynamic agent orchestration
- ✈️ Flight Agent (AviationStack MCP)
- 🏨 Hotel Agent (Tavily MCP)
- 🌤️ Weather Agent (Custom Weather MCP)
- 💰 Budget Agent
- 🗺️ Itinerary Agent
- 👤 Human-in-the-Loop (Approval & Revision)
- 💬 Final Response Agent
- 🗄️ PostgreSQL for long-term memory
- 🔄 LangGraph Shared State for cross-agent communication

## Project Structure

- `app.py` - FastAPI app, routes, and frontend serving
- `backend.py` - core orchestration and travel-planning workflow
- `mcp_client.py` - MCP client helpers used by the app
- `custom_weather_mcp_server.py` - example MCP server for weather checks
- `templates/index.html` - main frontend page
- `static/style.css` - frontend styling
- `static/script.js` - frontend interaction logic

## How The Workflow Works

1. A user submits a travel request from the Voyanta AI web interface.
2. The input guardrail checks whether the request is appropriate for the travel-planning workflow.
3. The supervisor decides which specialist agents should be involved.
4. The system generates a draft itinerary.
5. If approval is required, the user can approve the draft or request revisions.
6. The final itinerary is returned and can be exported as a PDF.

## Prerequisites

- Python 3.10 or newer
- Git
- A virtual environment tool such as `venv`

## Setup

### 1. Clone the repository

```powershell
git clone <https://github.com/aadityakr45/travel-multi-agent.git>
cd travel-multi-agent
```

### 2. Create and activate a virtual environment

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```powershell
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the project root and provide the keys your setup needs.

Common variables used by this project:

- `GROQ_API_KEY`
- `TAVILY_API_KEY`
- `AVIATIONSTACK_API_KEY`
- `OPENWEATHER_API_KEY`
- `DATABASE_URL`
- `DEFAULT_ORIGIN_IATA`
- `LANGSMITH_API_KEY`
- `LANGSMITH_TRACKING`
- `LANGSMITH_ENDPOINT`
- `LANGSMITH_PROJECT`

## Run The App

Start the FastAPI app in either of these ways:

```powershell
python app.py
```

or

```powershell
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Then open:

```text
http://127.0.0.1:8000
```

## Run The Example MCP Server

If you want to experiment with the example weather adapter, start the MCP server in a separate terminal:

```powershell
python custom_weather_mcp_server.py
```


## API Endpoints

- `POST /api/travel` - create a new planning run or continue an existing thread  
  Body: `{ "message": "<user prompt>", "thread_id": "optional-thread-id" }`
- `POST /api/travel/approve` - approve a draft or request revisions  
  Body: `{ "thread_id": "<id>", "approved": true|false, "feedback": "optional" }`
- `GET /health` - basic health check

## Frontend

The frontend is a server-rendered single-page interface built with:

- FastAPI templates via Jinja2
- Custom CSS in `static/style.css`
- Vanilla JavaScript in `static/script.js`
- `marked` for markdown rendering
- `html2pdf.js` for PDF export

## Development Notes

- `nest_asyncio` is applied in `app.py` so synchronous helper functions can call async MCP-related code inside FastAPI.
- The repository is focused on demonstrating orchestration patterns rather than production hardening.
- Automated tests are not included in the current project.

## Contributing

Contributions are welcome for:

- documentation improvements
- bug fixes
- UI polish
- new MCP adapters or examples

Please open an issue or submit a pull request if you would like to contribute.

## License

This project follows the license in [LICENSE](LICENSE).
