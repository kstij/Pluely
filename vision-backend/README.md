# Cluely Vision Backend

This is the Vision Agents backend that powers real-time screen analysis using GetStream's Vision Agents library.

## Prerequisites

- Python 3.10+
- [uv](https://docs.astral.sh/uv/) package manager (recommended)
- Stream API credentials (free at [getstream.io](https://getstream.io/))
- Gemini API key (for vision analysis)

## Quick Start

### 1. Install uv (if not already installed)

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2. Set up the environment

```bash
cd vision-backend

# Create environment and install dependencies
uv sync

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your API keys
```

### 3. Configure API Keys

Edit `.env` file:

```env
# Required: Stream API credentials
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

# Required: Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Optional: For voice features
ELEVENLABS_API_KEY=your_elevenlabs_key
DEEPGRAM_API_KEY=your_deepgram_key
```

### 4. Start the Server

```bash
# Run the WebSocket/HTTP server
uv run python server.py
```

The server will start on `http://127.0.0.1:8765`

### 5. Configure Electron App

In the main `.env` file (root directory):

```env
USE_VISION_AGENTS=true
VISION_AGENT_URL=http://127.0.0.1:8765
GEMINI_API_KEY=your_gemini_api_key  # Fallback
```

### 6. Start the Electron App

```bash
# From root directory
npm start
```

## API Endpoints

### Health Check

```bash
GET /health
```

Returns: `{ "status": "healthy", "vision_agents": true, "gemini": true }`

### Analyze Screenshot

```bash
POST /analyze
Content-Type: application/json

{
  "image": "base64_encoded_image",
  "mime_type": "image/png"
}
```

Returns structured analysis:
```json
{
  "context": "Interview question about algorithms",
  "problem_statement": "Explain the time complexity of quicksort",
  "key_points": ["O(n log n) average case", "O(n²) worst case"],
  "suggested_responses": [
    { "option": "Start with the average case explanation", "reasoning": "Most common interview focus" }
  ],
  "action_items": ["Mention pivot selection importance"],
  "confidence": 0.85
}
```

### WebSocket (Real-time)

```
WS /ws
```

Send: `{ "type": "screenshot", "image": "base64...", "mime_type": "image/png" }`
Receive: `{ "type": "analysis", "data": {...} }`

## Using Vision Agents Directly

For advanced use cases (real-time video processing, voice interaction):

```bash
# Run the full Vision Agent
uv run python agent.py
```

This starts a Vision Agent that can:
- Watch screen content via WebRTC
- Provide real-time voice coaching
- Handle complex multi-modal interactions

## Architecture

```
┌─────────────────┐     ┌────────────────────┐     ┌──────────────────┐
│  Electron App   │────▶│  Vision Backend    │────▶│  Gemini/Stream   │
│  (Screenshot)   │     │  (FastAPI/WS)      │     │  Vision AI       │
└─────────────────┘     └────────────────────┘     └──────────────────┘
```

## Hackathon Tips

1. **For demos**: Use the HTTP API - it's simpler and more reliable
2. **For real-time**: Use WebSocket for faster updates
3. **Showcase Vision AI**: Mention Stream's Vision Agents and real-time capabilities
4. **Key differentiator**: Sub-30ms latency with Stream's edge network

## Troubleshooting

### Server won't start
- Check Python version: `python --version` (need 3.10+)
- Check uv installation: `uv --version`
- Check dependencies: `uv sync`

### Analysis returns errors
- Verify GEMINI_API_KEY is set correctly
- Check API key permissions at [Google AI Studio](https://makersuite.google.com/app/apikey)

### Electron can't connect
- Ensure server is running on port 8765
- Check firewall settings
- Verify USE_VISION_AGENTS=true in root .env
