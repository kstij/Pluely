# Pluely

**Your invisible AI-powered desktop assistant for real-time insights during meetings, interviews, and presentations.**

Built with [GetStream Vision Agents](https://github.com/GetStream/Vision-Agents) for real-time video AI capabilities.

---

## Features

- **Invisible Overlay** - Translucent window that stays on top without being intrusive
- **Real-time Screen Analysis** - AI analyzes screenshots instantly using Vision Agents
- **Multiple AI Providers** - Stream Vision Agents, Google Gemini, or local Ollama
- **Voice Support** - Speech-to-text and text-to-speech capabilities
- **Cross-Platform** - Works on macOS, Windows, and Linux
- **Privacy-First** - Local AI option available, no data tracking

---

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+ (for Vision Agents backend)
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Stream API credentials from [getstream.io](https://getstream.io/) (free tier: 333k minutes/month)

### Installation

```bash
# Clone the repository
git clone https://github.com/kstij/Pluely.git
cd Pluely

# Install Node dependencies
npm install

# Set up Vision Agents backend
cd vision-backend
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env
uv venv
source .venv/bin/activate
uv pip install fastapi uvicorn websockets python-dotenv pillow google-generativeai
```

### Configuration

**1. Vision Backend** (`vision-backend/.env`):
```env
GEMINI_API_KEY=your_gemini_api_key
STREAM_API_KEY=llama3.2
STREAM_API_SECRET=xr79f7z4st88x34yn9yn8qm6uzpnxrhk2csqbw5p4p7yf8a54v7j32hate79xwwb
HOST=127.0.0.1
PORT=8765
```

**2. Electron App** (`.env` in root):
```env
USE_VISION_AGENTS=true
VISION_AGENT_URL=http://127.0.0.1:8765
GEMINI_API_KEY=your_gemini_api_key
```

### Running

**Terminal 1 - Start Vision Backend:**
```bash
cd vision-backend
source .venv/bin/activate
python server.py
```

**Terminal 2 - Start Electron App:**
```bash
npm start
```

**Verify backend is running:**
```bash
curl http://127.0.0.1:8765/health
# Returns: {"status":"healthy","vision_agents":false,"gemini":true}
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + B` | Toggle window visibility |
| `Cmd/Ctrl + H` | Take screenshot |
| `Cmd/Ctrl + Enter` | Get AI solution |
| `Cmd/Ctrl + Arrow Keys` | Move window |
| `Cmd/Ctrl + Q` | Quit app |

---

## AI Provider Options

### 1. Vision Agents + Gemini (Recommended)

Real-time video AI powered by GetStream's Vision Agents with Gemini backend.

```env
USE_VISION_AGENTS=true
VISION_AGENT_URL=http://127.0.0.1:8765
GEMINI_API_KEY=your_key
```

### 2. Gemini Only

Direct Google Gemini API without Vision Agents backend.

```env
GEMINI_API_KEY=your_key
```

### 3. Ollama (Local/Private)

100% private - runs entirely on your machine.

```env
USE_OLLAMA=true
OLLAMA_MODEL=llama3.2
OLLAMA_URL=http://localhost:11434
```

Setup: `brew install ollama && ollama pull llama3.2`

---

## Project Structure

```
Pluely/
├── electron/          # Electron main process
│   ├── main.ts        # App entry point
│   ├── LLMHelper.ts   # AI provider integration
│   ├── VisionAgentHelper.ts  # Vision Agents client
│   └── ProcessingHelper.ts   # Screenshot processing
├── src/               # React frontend
│   ├── App.tsx        # Main UI
│   └── components/    # UI components
├── vision-backend/    # Python Vision Agents server
│   ├── server.py      # FastAPI server
│   ├── agent.py       # Full Vision Agent
│   └── .env           # Backend config
└── .env               # Electron config
```

---

## API Endpoints (Vision Backend)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/analyze` | POST | Analyze screenshot |
| `/ws` | WebSocket | Real-time analysis |

**Analyze endpoint:**
```bash
curl -X POST http://127.0.0.1:8765/analyze \
  -H "Content-Type: application/json" \
  -d '{"image": "base64_encoded_image", "mime_type": "image/png"}'
```

---

## Troubleshooting

### Vision backend won't start
```bash
cd vision-backend
source .venv/bin/activate
python server.py
```

### Port already in use
```bash
lsof -i :5180  # Find process
kill <PID>     # Kill it
```

### Sharp build errors
```bash
rm -rf node_modules package-lock.json
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install --ignore-scripts
npm rebuild sharp
```

---

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Desktop**: Electron
- **AI Backend**: Python, FastAPI, GetStream Vision Agents
- **AI Models**: Gemini 2.0 Flash, Ollama (Llama 3.2)
- **Build**: Vite, electron-builder

---

## Built With

- [GetStream Vision Agents](https://github.com/GetStream/Vision-Agents) - Real-time video AI framework
- [Google Gemini](https://ai.google.dev/) - Multimodal AI
- [Electron](https://www.electronjs.org/) - Cross-platform desktop apps

---

## License

MIT License

---

**Made by [@kstij](https://github.com/kstij)**
