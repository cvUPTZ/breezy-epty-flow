from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum, auto
from typing import List, Optional

class ActionType(Enum):
    # Pass
    PASS_SHORT = auto()
    PASS_LONG = auto()

    # Shot
    SHOT_ON_TARGET = auto()
    SHOT_OFF_TARGET = auto()

    # Duel
    TACKLE = auto()
    INTERCEPTION = auto()

    # Goalkeeper
    SAVE = auto()

    # Urgent Events
    GOAL = auto()
    YELLOW_CARD = auto()
    RED_CARD = auto()
    SUBSTITUTION = auto()

class Outcome(Enum):
    SUCCESS = auto()
    FAILURE = auto()

@dataclass
class Team:
    id: str
    name: str

@dataclass
class Player:
    id: str
    name: str
    number: int
    team: Team

@dataclass
class GameEvent:
    timestamp: datetime
    action_type: ActionType
    team: Team
    player: Optional[Player] = None
    outcome: Optional[Outcome] = None

@dataclass
class Game:
    id: str
    home_team: Team
    away_team: Team
    events: List[GameEvent] = field(default_factory=list)