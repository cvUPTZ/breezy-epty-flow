
import { useEffect, useState, useCallback } from 'react';

interface GamepadState {
  connected: boolean;
  gamepadIndex: number | null;
  lastButtonStates: boolean[];
}

interface GamepadTrackerConfig {
  buttonMapping: { [buttonIndex: number]: string };
  onEventTrigger: (eventType: string) => void;
}

export const useGamepadTracker = (config: GamepadTrackerConfig) => {
  const [gamepadState, setGamepadState] = useState<GamepadState>({
    connected: false,
    gamepadIndex: null,
    lastButtonStates: []
  });

  const checkGamepadConnection = useCallback(() => {
    const gamepads = navigator.getGamepads();
    let connectedGamepad = null;
    let gamepadIndex = null;

    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        connectedGamepad = gamepads[i];
        gamepadIndex = i;
        break;
      }
    }

    if (connectedGamepad && gamepadIndex !== null) {
      setGamepadState(prev => ({
        ...prev,
        connected: true,
        gamepadIndex,
        lastButtonStates: prev.lastButtonStates.length === 0 
          ? new Array(connectedGamepad.buttons.length).fill(false)
          : prev.lastButtonStates
      }));
    } else {
      setGamepadState(prev => ({
        ...prev,
        connected: false,
        gamepadIndex: null
      }));
    }
  }, []);

  const handleGamepadInput = useCallback(() => {
    if (!gamepadState.connected || gamepadState.gamepadIndex === null) return;

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[gamepadState.gamepadIndex];
    
    if (!gamepad) return;

    const currentButtonStates = gamepad.buttons.map(button => button.pressed);
    
    // Check for button press events (transition from false to true)
    currentButtonStates.forEach((pressed, index) => {
      const wasPressed = gamepadState.lastButtonStates[index] || false;
      
      if (pressed && !wasPressed) {
        // Button was just pressed
        const eventType = config.buttonMapping[index];
        if (eventType) {
          console.log(`Gamepad button ${index} pressed, triggering event: ${eventType}`);
          config.onEventTrigger(eventType);
        }
      }
    });

    // Update last button states
    setGamepadState(prev => ({
      ...prev,
      lastButtonStates: currentButtonStates
    }));
  }, [gamepadState, config]);

  useEffect(() => {
    // Check for gamepad connection on mount and set up listeners
    checkGamepadConnection();

    const handleGamepadConnected = (event: GamepadEvent) => {
      console.log('Gamepad connected:', event.gamepad.id);
      checkGamepadConnection();
    };

    const handleGamepadDisconnected = (event: GamepadEvent) => {
      console.log('Gamepad disconnected:', event.gamepad.id);
      checkGamepadConnection();
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    // Set up polling for gamepad input
    const pollInterval = setInterval(() => {
      handleGamepadInput();
    }, 50); // Poll every 50ms for responsive input

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
      clearInterval(pollInterval);
    };
  }, [checkGamepadConnection, handleGamepadInput]);

  return {
    isConnected: gamepadState.connected,
    gamepadIndex: gamepadState.gamepadIndex
  };
};
