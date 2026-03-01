# Pluely Vision Backend

Python backend for Pluely, powered by GetStream Vision Agents.

## Setup

```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env

# Create virtual environment
uv venv
source .venv/bin/activate

# Install dependencies
uv pip install fastapi uvicorn websockets python-dotenv pillow google-generativeai
```

## Configuration

Create `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
HOST=127.0.0.1
PORT=8765
```

## Running

```bash
source .venv/bin/activate
python server.py
```

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/analyze` | POST | Analyze screenshot |
| `/ws` | WebSocket | Real-time analysis |

## Health Check

```bash
curl http://127.0.0.1:8765/health
```
