"""
Pluely Vision Agent - Full Vision Agents implementation for advanced features.
Supports real-time video AI, voice interaction, and WebRTC.
"""

import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

# Vision Agents imports
try:
    from vision_agents import Agent, User
    from vision_agents.plugins import gemini, getstream
    VISION_AGENTS_AVAILABLE = True
except ImportError:
    VISION_AGENTS_AVAILABLE = False
    print("[Warning] Vision Agents not installed. Install with: uv pip install vision-agents[getstream,gemini]")

# Instructions for the invisible assistant
ASSISTANT_INSTRUCTIONS = """
You are Pluely, an invisible AI assistant helping the user in real-time.

Your role:
- Silently observe what's on screen (interviews, meetings, presentations)
- Provide helpful text suggestions and insights
- Never interrupt or speak unless asked
- Be concise and actionable in your responses

When analyzing screen content:
1. Identify the context (interview question, meeting topic, presentation slide)
2. Extract key information and questions being asked
3. Suggest possible responses or talking points
4. Highlight important details the user should notice

Response format:
- Keep responses brief and scannable
- Use bullet points for multiple suggestions
- Prioritize the most relevant/urgent information first

Remember: The user is in a live situation. Be quick, helpful, and unobtrusive.
"""


def create_agent() -> "Agent":
    """Create and configure the Vision Agent."""
    
    if not VISION_AGENTS_AVAILABLE:
        raise ImportError("Vision Agents not available. Install with: uv pip install vision-agents[getstream,gemini]")
    
    agent_user = User(
        name="Pluely Assistant",
        id="pluely-agent",
        image="https://ui-avatars.com/api/?name=Pluely&background=6366f1&color=fff"
    )
    
    # Configure the agent
    agent = Agent(
        edge=getstream.Edge(),
        agent_user=agent_user,
        instructions=ASSISTANT_INSTRUCTIONS,
        # Gemini Realtime for video understanding
        llm=gemini.Realtime(
            fps=5,  # Process 5 frames per second
            model="gemini-2.0-flash",
        ),
    )
    
    return agent


async def run_agent():
    """Run the Vision Agent."""
    if not VISION_AGENTS_AVAILABLE:
        print("[Error] Vision Agents not installed.")
        print("Install with: uv pip install vision-agents[getstream,gemini]")
        return
    
    agent = create_agent()
    print("[Pluely] Starting Vision Agent...")
    print("[Pluely] Waiting for connections...")
    await agent.run()


if __name__ == "__main__":
    asyncio.run(run_agent())
