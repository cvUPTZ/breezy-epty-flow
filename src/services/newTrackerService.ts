// New Tracker Service API Client
// Interfaces based on the Pydantic models in the new Python service

export enum ActionType {
    PASS_SHORT = "PASS_SHORT",
    PASS_LONG = "PASS_LONG",
    SHOT_ON_TARGET = "SHOT_ON_TARGET",
    SHOT_OFF_TARGET = "SHOT_OFF_TARGET",
    TACKLE = "TACKLE",
    INTERCEPTION = "INTERCEPTION",
    SAVE = "SAVE",
    GOAL = "GOAL",
    YELLOW_CARD = "YELLOW_CARD",
    RED_CARD = "RED_CARD",
    SUBSTITUTION = "SUBSTITUTION",
}

export enum Outcome {
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
}

export interface Team {
    id: string;
    name: string;
}

export interface Player {
    id: string;
    name: string;
    number: number;
    team: Team;
}

export interface GameEvent {
    timestamp?: string; // Datetime string
    action_type: ActionType;
    team: Team;
    player?: Player;
    outcome?: Outcome;
}

export interface Game {
    id: string;
    home_team: Team;
    away_team: Team;
    events: GameEvent[];
    is_active: boolean;
}

class NewTrackerService {
    private baseUrl: string;

    constructor() {
        // Assume the new service will run on port 8001
        this.baseUrl = import.meta.env.VITE_NEW_TRACKING_API_URL || 'http://127.0.0.1:8001/api/v1';
    }

    private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`New Tracker API error: ${response.status} - ${errorData.detail || response.statusText}`);
        }

        return response.json();
    }

    async startGame(home_team: Team, away_team: Team): Promise<Game> {
        console.log('Starting new game with teams:', home_team, away_team);
        return this.makeRequest<Game>('/games/start', {
            method: 'POST',
            body: JSON.stringify({ home_team, away_team }),
        });
    }

    async recordEvent(gameId: string, event: GameEvent): Promise<GameEvent> {
        return this.makeRequest<GameEvent>(`/games/${gameId}/record`, {
            method: 'POST',
            body: JSON.stringify(event),
        });
    }

    async getGame(gameId: string): Promise<Game> {
        return this.makeRequest<Game>(`/games/${gameId}`);
    }

    async endGame(gameId: string): Promise<Game> {
        return this.makeRequest<Game>(`/games/${gameId}/end`, {
            method: 'POST',
        });
    }

    async healthCheck(): Promise<{ status: string }> {
        return this.makeRequest<{ status: string }>('/health');
    }
}

export const newTrackerService = new NewTrackerService();