import { useEffect, useState, useCallback, useRef } from 'react';

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
  console.log('useGamepadTracker initializing with mapping:', config.buttonMapping);

  const [gamepadState, setGamepadState] = useState<GamepadState>({
    connected: false,
    gamepadIndex: null,
    lastButtonStates: []
  });

  // Use refs to store the latest values to avoid stale closures
  const gamepadStateRef = useRef(gamepadState);
  const configRef = useRef(config);
  
  // Update refs when state/config changes
  useEffect(() => {
    gamepadStateRef.current = gamepadState;
  }, [gamepadState]);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const checkGamepadConnection = useCallback(() => {
    console.log('checkGamepadConnection called');

    const gamepads = navigator.getGamepads();
    let connectedGamepad = null;
    let gamepadIndex = null;

    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        connectedGamepad = gamepads[i];
        gamepadIndex = i;
        console.log(`Found gamepad at index ${i}:`, connectedGamepad.id);
        break;
      }
    }

    if (connectedGamepad && gamepadIndex !== null) {
      console.log(`Setting gamepad state: connected=true, index=${gamepadIndex}`);
      setGamepadState(prev => ({
        ...prev,
        connected: true,
        gamepadIndex,
        lastButtonStates: prev.lastButtonStates.length === 0 
          ? new Array(connectedGamepad.buttons.length).fill(false)
          : prev.lastButtonStates
      }));
    } else {
      console.log('No gamepad found or index is null.');
      setGamepadState(prev => ({
        ...prev,
        connected: false,
        gamepadIndex: null
      }));
    }
  }, []);

  const handleGamepadInput = useCallback(() => {
    const currentState = gamepadStateRef.current;
    const currentConfig = configRef.current;

    if (!currentState.connected || currentState.gamepadIndex === null) {
      return;
    }

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[currentState.gamepadIndex];
    
    if (!gamepad) {
      console.warn(`handleGamepadInput: Gamepad at index ${currentState.gamepadIndex} is null.`);
      return;
    }

    const currentButtonStates = gamepad.buttons.map(button => button.pressed);
    console.log('handleGamepadInput: Current buttons:', currentButtonStates.map((pressed, i) => pressed ? i : null).filter(x => x !== null));
    
    // Check for button press events (transition from false to true)
    currentButtonStates.forEach((pressed, index) => {
      const wasPressed = currentState.lastButtonStates[index] || false;
      
      if (pressed && !wasPressed) {
        // Button was just pressed
        const eventType = currentConfig.buttonMapping[index];
        if (eventType) {
          console.log(`Gamepad button ${index} pressed, triggering event: ${eventType}`);
          currentConfig.onEventTrigger(eventType);
        } else {
          console.log(`Gamepad button ${index} pressed, but no mapping found.`);
        }
      }
    });

    // Update last button states
    setGamepadState(prev => ({
      ...prev,
      lastButtonStates: currentButtonStates
    }));
  }, []); // Empty dependency array since we're using refs

  useEffect(() => {
    console.log('Gamepad hook useEffect setup');

    checkGamepadConnection(); // Initial check

    const handleGamepadConnected = (event: GamepadEvent) => {
      console.log('Gamepad connected event:', event.gamepad.id);
      checkGamepadConnection();
    };

    const handleGamepadDisconnected = (event: GamepadEvent) => {
      console.log('Gamepad disconnected event:', event.gamepad.id);
      checkGamepadConnection();
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    const pollInterval = setInterval(() => {
      handleGamepadInput();
    }, 50); 

    return () => {
      console.log('Gamepad hook useEffect cleanup');
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