"""
WebSocket server that bridges Electron app with Vision Agents.
Receives screenshots from Electron and forwards to Vision Agents for processing.
"""

import os
import json
import base64
import asyncio
from io import BytesIO
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# For image processing
from PIL import Image

# Vision Agents imports
try:
    from vision_agents import Agent, User
    from vision_agents.plugins import gemini, getstream
    VISION_AGENTS_AVAILABLE = True
except ImportError:
    VISION_AGENTS_AVAILABLE = False
    print("[Warning] Vision Agents not installed. Running in mock mode.")

# Google Generative AI for direct image analysis (fallback)
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


app = FastAPI(title="Cluely Vision Backend")

# CORS for Electron app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active connections
active_connections: list[WebSocket] = []

# System prompt for analysis
SYSTEM_PROMPT = """You are Cluely, an invisible AI assistant helping the user in real-time during interviews, meetings, and presentations.

Analyze what you see on screen and provide:
1. **Context**: What situation is the user in? (interview, meeting, presentation, etc.)
2. **Key Information**: Important questions, topics, or data visible
3. **Suggested Responses**: 2-3 possible answers or talking points
4. **Action Items**: What the user should do or say next

Be concise, actionable, and helpful. Format your response as JSON:
{
    "context": "Brief description of the situation",
    "problem_statement": "The main question or challenge identified",
    "key_points": ["point 1", "point 2"],
    "suggested_responses": [
        {"option": "Response option 1", "reasoning": "Why this works"},
        {"option": "Response option 2", "reasoning": "Why this works"}
    ],
    "action_items": ["Do this first", "Then do this"],
    "confidence": 0.85
}
"""


class VisionAnalyzer:
    """Handles image analysis using Gemini."""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key and GEMINI_AVAILABLE:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("gemini-2.0-flash")
            print("[VisionAnalyzer] Initialized with Gemini")
        else:
            self.model = None
            print("[VisionAnalyzer] No Gemini API key or library. Running in mock mode.")
    
    async def analyze_image(self, image_data: bytes, mime_type: str = "image/png") -> dict:
        """Analyze an image and return structured insights."""
        
        if not self.model:
            return self._mock_response()
        
        try:
            # Create image part for Gemini
            image_part = {
                "mime_type": mime_type,
                "data": base64.b64encode(image_data).decode("utf-8")
            }
            
            response = await asyncio.to_thread(
                self.model.generate_content,
                [SYSTEM_PROMPT, image_part]
            )
            
            # Parse JSON response
            text = response.text
            # Clean up markdown code blocks if present
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            
            return json.loads(text.strip())
            
        except json.JSONDecodeError:
            # Return raw text if JSON parsing fails
            return {
                "context": "Analysis complete",
                "problem_statement": response.text[:500] if response else "Unable to analyze",
                "suggested_responses": [],
                "key_points": [],
                "action_items": [],
                "confidence": 0.5
            }
        except Exception as e:
            print(f"[VisionAnalyzer] Error: {e}")
            return {"error": str(e)}
    
    def _mock_response(self) -> dict:
        """Return mock response for testing."""
        return {
            "context": "Mock mode - Vision Agents not configured",
            "problem_statement": "Please configure GEMINI_API_KEY in vision-backend/.env",
            "key_points": ["Set up API keys", "Install vision-agents package"],
            "suggested_responses": [
                {"option": "Configure environment", "reasoning": "Required for real analysis"}
            ],
            "action_items": ["Add GEMINI_API_KEY to .env file"],
            "confidence": 0.0
        }


# Global analyzer instance
analyzer = VisionAnalyzer()


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "vision_agents": VISION_AGENTS_AVAILABLE,
        "gemini": GEMINI_AVAILABLE and analyzer.model is not None
    }


@app.post("/analyze")
async def analyze_screenshot(data: dict):
    """
    Analyze a screenshot sent from Electron.
    
    Expected payload:
    {
        "image": "base64_encoded_image_data",
        "mime_type": "image/png"
    }
    """
    try:
        image_b64 = data.get("image")
        mime_type = data.get("mime_type", "image/png")
        
        if not image_b64:
            raise HTTPException(status_code=400, detail="No image data provided")
        
        # Decode base64 image
        image_data = base64.b64decode(image_b64)
        
        # Analyze with Vision
        result = await analyzer.analyze_image(image_data, mime_type)
        
        return JSONResponse(content=result)
        
    except Exception as e:
        print(f"[API] Error analyzing screenshot: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time communication with Electron.
    
    Messages from client:
    - {"type": "screenshot", "image": "base64...", "mime_type": "image/png"}
    - {"type": "ping"}
    
    Messages to client:
    - {"type": "analysis", "data": {...}}
    - {"type": "pong"}
    - {"type": "error", "message": "..."}
    """
    await websocket.accept()
    active_connections.append(websocket)
    print(f"[WebSocket] Client connected. Total: {len(active_connections)}")
    
    try:
        while True:
            message = await websocket.receive_json()
            msg_type = message.get("type")
            
            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})
                
            elif msg_type == "screenshot":
                # Analyze screenshot
                image_b64 = message.get("image")
                mime_type = message.get("mime_type", "image/png")
                
                if image_b64:
                    image_data = base64.b64decode(image_b64)
                    result = await analyzer.analyze_image(image_data, mime_type)
                    await websocket.send_json({
                        "type": "analysis",
                        "data": result
                    })
                else:
                    await websocket.send_json({
                        "type": "error",
                        "message": "No image data in screenshot message"
                    })
                    
            else:
                await websocket.send_json({
                    "type": "error",
                    "message": f"Unknown message type: {msg_type}"
                })
                
    except WebSocketDisconnect:
        active_connections.remove(websocket)
        print(f"[WebSocket] Client disconnected. Total: {len(active_connections)}")
    except Exception as e:
        print(f"[WebSocket] Error: {e}")
        if websocket in active_connections:
            active_connections.remove(websocket)


def main():
    """Run the server."""
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8765"))
    
    print(f"[Server] Starting Vision Backend on {host}:{port}")
    print(f"[Server] Vision Agents available: {VISION_AGENTS_AVAILABLE}")
    print(f"[Server] Gemini available: {GEMINI_AVAILABLE}")
    
    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    main()
