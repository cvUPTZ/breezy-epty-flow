import uuid
from datetime import datetime
from typing import List, Optional

from football_tracker.src.models.domain import (
    ActionType,
    Game,
    GameEvent,
    Outcome,
    Player,
    Team,
)


class TrackingService:
    def __init__(self):
        self.game: Optional[Game] = None

    def start_game(self, home_team: Team, away_team: Team) -> Game:
        game_id = str(uuid.uuid4())
        self.game = Game(id=game_id, home_team=home_team, away_team=away_team)
        return self.game

    def record_event(
        self,
        action_type: ActionType,
        team: Team,
        player: Optional[Player] = None,
        outcome: Optional[Outcome] = None,
    ):
        if not self.game:
            raise Exception("Game has not been started.")

        event = GameEvent(
            timestamp=datetime.now(),
            action_type=action_type,
            team=team,
            player=player,
            outcome=outcome,
        )
        self.game.events.append(event)
        return event

    def get_game_events(self) -> List[GameEvent]:
        if not self.game:
            raise Exception("Game has not been started.")
        return self.game.events