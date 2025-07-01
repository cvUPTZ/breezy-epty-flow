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
  console.log('useGamepadTracker initializing with mapping:', config.buttonMapping); // LOG 1: Check mapping

  const [gamepadState, setGamepadState] = useState<GamepadState>({
    connected: false,
    gamepadIndex: null,
    lastButtonStates: []
  });

  const checkGamepadConnection = useCallback(() => {
    console.log('checkGamepadConnection called'); // LOG 2: Fired

    const gamepads = navigator.getGamepads();
    let connectedGamepad = null;
    let gamepadIndex = null;

    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        connectedGamepad = gamepads[i];
        gamepadIndex = i;
        console.log(`Found gamepad at index ${i}:`, connectedGamepad.id); // LOG 3: Found gamepad
        break;
      }
    }

    if (connectedGamepad && gamepadIndex !== null) {
      console.log(`Setting gamepad state: connected=true, index=${gamepadIndex}`); // LOG 4: Setting true
      setGamepadState(prev => ({
        ...prev,
        connected: true,
        gamepadIndex,
        lastButtonStates: prev.lastButtonStates.length === 0 
          ? new Array(connectedGamepad.buttons.length).fill(false)
          : prev.lastButtonStates
      }));
    } else {
      console.log('No gamepad found or index is null.'); // LOG 5: No gamepad found
      setGamepadState(prev => ({
        ...prev,
        connected: false,
        gamepadIndex: null
      }));
    }
  }, []);

  const handleGamepadInput = useCallback(() => {
    if (!gamepadState.connected || gamepadState.gamepadIndex === null) {
      // console.log('handleGamepadInput: Skipping input check, not connected or index is null.'); // Can be noisy, uncomment if needed
      return;
    }

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[gamepadState.gamepadIndex];
    
    if (!gamepad) {
      console.warn(`handleGamepadInput: Gamepad at index ${gamepadState.gamepadIndex} is null.`); // LOG 6: Null gamepad during input
      return;
    }

    const currentButtonStates = gamepad.buttons.map(button => button.pressed);
    console.log('handleGamepadInput: Current buttons:', currentButtonStates); // LOG 7: Current button states
    console.log('handleGamepadInput: Last buttons:', gamepadState.lastButtonStates); // LOG 8: Last button states
    
    // Check for button press events (transition from false to true)
    currentButtonStates.forEach((pressed, index) => {
      const wasPressed = gamepadState.lastButtonStates[index] || false;
      
      if (pressed && !wasPressed) {
        // Button was just pressed
        const eventType = config.buttonMapping[index];
        if (eventType) {
          console.log(`Gamepad button ${index} pressed, triggering event: ${eventType}`); // LOG 9: Button press detected and mapped
          config.onEventTrigger(eventType);
        } else {
          console.log(`Gamepad button ${index} pressed, but no mapping found.`); // LOG 10: Button press, but no mapping
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
    console.log('Gamepad hook useEffect setup'); // LOG 11: Effect setup

    checkGamepadConnection(); // Initial check

    const handleGamepadConnected = (event: GamepadEvent) => {
      console.log('Gamepad connected event:', event.gamepad.id); // LOG 12: Connected event
      checkGamepadConnection();
    };

    const handleGamepadDisconnected = (event: GamepadEvent) => {
      console.log('Gamepad disconnected event:', event.gamepad.id); // LOG 13: Disconnected event
      checkGamepadConnection();
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    const pollInterval = setInterval(() => {
      handleGamepadInput();
    }, 50); 

    return () => {
      console.log('Gamepad hook useEffect cleanup'); // LOG 14: Effect cleanup
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