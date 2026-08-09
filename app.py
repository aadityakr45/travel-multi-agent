from pathlib import Path
import json
import traceback

import uvicorn
from fastapi import FastAPI
from fastapi.responses import (
    FileResponse,
    JSONResponse,
    StreamingResponse,
)
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from backend import (
    get_travel_thread,
    run_travel_agent,
    resume_travel_agent,
    stream_travel_agent,
    stream_resume_travel_agent,
)

# Route handlers that execute the agent graph are plain `def`, not `async
# def`, so FastAPI runs them in its threadpool instead of the main event
# loop. That gives the agents' own `asyncio.run(...)` calls (used to invoke
# async MCP helpers from synchronous node functions) a thread with no
# already-running loop, so they work without patching asyncio at all - and
# it's required for StreamingResponse below, whose internal anyio task group
# is incompatible with a nest_asyncio-patched main loop.

BASE_DIR = Path(__file__).resolve().parent
WEB_DIST_DIR = BASE_DIR / "web" / "dist"
WEB_INDEX_HTML = WEB_DIST_DIR / "index.html"

app = FastAPI(
    title="TripMate AI",
    description=(
        "LangGraph Multi-Agent Travel Planner with Supervisor, Guardrails, "
        "Human-in-the-Loop, and FastAPI Frontend"
    ),
    version="2.0.0",
)

app.mount(
    "/assets",
    StaticFiles(directory="assets"),
    name="assets"
)

# React frontend (web/), built separately with `npm run build`.
if (WEB_DIST_DIR / "web-assets").is_dir():
    app.mount(
        "/web-assets",
        StaticFiles(directory=str(WEB_DIST_DIR / "web-assets")),
        name="web-assets",
    )

class TravelRequest(BaseModel):
    message: str
    thread_id: str | None = None


class ApprovalRequest(BaseModel):
    thread_id: str = Field(min_length=1)
    approved: bool
    feedback: str = ""


def _serve_frontend():
    """Serve the built React app; never fall back to the removed legacy UI."""
    if WEB_INDEX_HTML.is_file():
        return FileResponse(WEB_INDEX_HTML, media_type="text/html")
    return JSONResponse(
        status_code=503,
        content={
            "success": False,
            "error": "React frontend is not built. Run `npm run build` in web/.",
        },
    )


@app.get("/")
async def home():
    return _serve_frontend()


@app.post("/api/travel")
def travel_planner(request_data: TravelRequest):
    try:
        user_message = request_data.message.strip()

        if not user_message:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Message cannot be empty.",
                },
            )

        result = run_travel_agent(
            user_input=user_message,
            thread_id=request_data.thread_id,
        )

        return JSONResponse(
            content={
                "success": True,
                **result,
            }
        )

    except Exception as exc:
        print("ERROR:", exc)
        traceback.print_exc()

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(exc),
            },
        )


@app.post("/api/travel/approve")
def approve_travel_plan(request_data: ApprovalRequest):
    try:
        if not request_data.approved and not request_data.feedback.strip():
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Please provide revision feedback when rejecting the draft.",
                },
            )

        result = resume_travel_agent(
            thread_id=request_data.thread_id,
            approved=request_data.approved,
            feedback=request_data.feedback,
        )

        return JSONResponse(
            content={
                "success": True,
                **result,
            }
        )

    except Exception as exc:
        print("APPROVAL ERROR:", exc)
        traceback.print_exc()

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(exc),
            },
        )


def _sse_format(event: dict) -> str:
    return f"data: {json.dumps(event)}\n\n"


def _travel_event_stream(user_message: str, thread_id: str | None):
    try:
        for event in stream_travel_agent(
            user_input=user_message,
            thread_id=thread_id,
        ):
            yield _sse_format(event)
    except Exception as exc:
        print("STREAM ERROR:", exc)
        traceback.print_exc()
        yield _sse_format({"event": "error", "error": str(exc)})


def _approval_event_stream(thread_id: str, approved: bool, feedback: str):
    try:
        for event in stream_resume_travel_agent(
            thread_id=thread_id,
            approved=approved,
            feedback=feedback,
        ):
            yield _sse_format(event)
    except Exception as exc:
        print("STREAM APPROVAL ERROR:", exc)
        traceback.print_exc()
        yield _sse_format({"event": "error", "error": str(exc)})


@app.post("/api/travel/stream")
def travel_planner_stream(request_data: TravelRequest):
    user_message = request_data.message.strip()

    if not user_message:
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": "Message cannot be empty.",
            },
        )

    return StreamingResponse(
        _travel_event_stream(user_message, request_data.thread_id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/api/travel/approve/stream")
def approve_travel_plan_stream(request_data: ApprovalRequest):
    if not request_data.approved and not request_data.feedback.strip():
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": "Please provide revision feedback when rejecting the draft.",
            },
        )

    return StreamingResponse(
        _approval_event_stream(
            request_data.thread_id,
            request_data.approved,
            request_data.feedback,
        ),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/api/travel/{thread_id}")
async def get_travel_plan(thread_id: str):
    try:
        result = get_travel_thread(thread_id)

        if result is None:
            return JSONResponse(
                status_code=404,
                content={
                    "success": False,
                    "error": "No travel plan was found for this thread.",
                },
            )

        return JSONResponse(
            content={
                "success": True,
                **result,
            }
        )

    except Exception as exc:
        print("FETCH THREAD ERROR:", exc)
        traceback.print_exc()

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(exc),
            },
        )


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "message": "TripMate AI API is running",
        "features": [
            "supervisor_agent",
            "input_guardrail",
            "human_in_the_loop",
        ],
    }


@app.get("/favicon.ico")
async def favicon():
    return FileResponse(
        BASE_DIR / "assets" / "voyanta_fv.png",
        media_type="image/png",
    )


# SPA fallback: must stay last so every route above (/api/*, /health,
# /favicon.ico) and the /assets, /web-assets mounts are matched first. This
# lets client-side routes like /trips/new or /history be refreshed directly.
@app.get("/{full_path:path}")
async def spa_fallback(full_path: str):
    return _serve_frontend()


if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
