import uuid
from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware

# --- Enums ---
class ActionType(str, Enum):
    PASS_SHORT = "PASS_SHORT"
    PASS_LONG = "PASS_LONG"
    SHOT_ON_TARGET = "SHOT_ON_TARGET"
    SHOT_OFF_TARGET = "SHOT_OFF_TARGET"
    TACKLE = "TACKLE"
    INTERCEPTION = "INTERCEPTION"
    SAVE = "SAVE"
    GOAL = "GOAL"
    YELLOW_CARD = "YELLOW_CARD"
    RED_CARD = "RED_CARD"
    SUBSTITUTION = "SUBSTITUTION"

class Outcome(str, Enum):
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"

# --- Pydantic Models for API ---
class Team(BaseModel):
    id: str
    name: str

class Player(BaseModel):
    id: str
    name: str
    number: int
    team: Team

class GameEvent(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.now)
    action_type: ActionType
    team: Team
    player: Optional[Player] = None
    outcome: Optional[Outcome] = None

class Game(BaseModel):
    id: str
    home_team: Team
    away_team: Team
    events: List[GameEvent] = []
    is_active: bool = False

# --- In-memory storage ---
# In a real app, this would be a database (e.g., Redis, PostgreSQL)
games: Dict[str, Game] = {}

# --- FastAPI App ---
app = FastAPI(title="Football Tracking API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Tracking Service Logic ---
class TrackingService:
    def start_game(self, home_team: Team, away_team: Team) -> Game:
        game_id = str(uuid.uuid4())
        if game_id in games:
            raise HTTPException(status_code=409, detail="Game with this ID already exists.")

        game = Game(id=game_id, home_team=home_team, away_team=away_team, is_active=True)
        games[game_id] = game
        return game

    def record_event(self, game_id: str, event: GameEvent) -> GameEvent:
        if game_id not in games:
            raise HTTPException(status_code=404, detail="Game not found.")

        game = games[game_id]
        if not game.is_active:
            raise HTTPException(status_code=400, detail="Game is not active.")

        game.events.append(event)
        return event

    def get_game(self, game_id: str) -> Optional[Game]:
        return games.get(game_id)

    def end_game(self, game_id: str) -> Game:
        if game_id not in games:
            raise HTTPException(status_code=404, detail="Game not found.")

        game = games[game_id]
        game.is_active = False
        return game

# Instantiate the service
tracking_service = TrackingService()

# --- API Endpoints ---

class StartGameRequest(BaseModel):
    home_team: Team
    away_team: Team

@app.post("/api/v1/games/start", response_model=Game)
async def start_game(request: StartGameRequest):
    """
    Starts a new game session.
    """
    try:
        game = tracking_service.start_game(request.home_team, request.away_team)
        return game
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/games/{game_id}/record", response_model=GameEvent)
async def record_event(game_id: str, event: GameEvent):
    """
    Records a new event for a specific game.
    """
    try:
        return tracking_service.record_event(game_id, event)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/games/{game_id}", response_model=Game)
async def get_game(game_id: str):
    """
    Retrieves the current state of a game.
    """
    game = tracking_service.get_game(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found.")
    return game

@app.post("/api/v1/games/{game_id}/end", response_model=Game)
async def end_game(game_id: str):
    """
    Ends a game session.
    """
    try:
        return tracking_service.end_game(game_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)