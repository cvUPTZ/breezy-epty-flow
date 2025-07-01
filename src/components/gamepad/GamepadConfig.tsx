
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gamepad2, Settings } from 'lucide-react';

interface GamepadConfigProps {
  isConnected: boolean;
  onConfigChange: (mapping: { [buttonIndex: number]: string }) => void;
  availableEvents: string[];
}

const XBOX_BUTTON_NAMES: { [key: number]: string } = {
  0: 'A Button',
  1: 'B Button', 
  2: 'X Button',
  3: 'Y Button',
  4: 'Left Bumper',
  5: 'Right Bumper',
  6: 'Left Trigger',
  7: 'Right Trigger',
  8: 'Back/Select',
  9: 'Start/Menu',
  10: 'Left Stick',
  11: 'Right Stick',
  12: 'D-Pad Up',
  13: 'D-Pad Down',
  14: 'D-Pad Left',
  15: 'D-Pad Right'
};

const GamepadConfig: React.FC<GamepadConfigProps> = ({
  isConnected,
  onConfigChange,
  availableEvents
}) => {
  const [buttonMapping, setButtonMapping] = useState<{ [buttonIndex: number]: string }>({
    0: 'goal',      // A Button
    1: 'shot',      // B Button
    2: 'pass',      // X Button
    3: 'tackle',    // Y Button
    4: 'foul',      // Left Bumper
    5: 'save'       // Right Bumper
  });

  const [showConfig, setShowConfig] = useState(false);

  const handleMappingChange = (buttonIndex: number, eventType: string) => {
    const newMapping = { ...buttonMapping };
    if (eventType === 'none') {
      delete newMapping[buttonIndex];
    } else {
      newMapping[buttonIndex] = eventType;
    }
    setButtonMapping(newMapping);
    onConfigChange(newMapping);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Gamepad Controller
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfig(!showConfig)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected && (
          <div className="text-center p-4 text-muted-foreground">
            <Gamepad2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Connect an Xbox or PC controller to use gamepad tracking</p>
            <p className="text-sm mt-1">Press any button on your controller to connect</p>
          </div>
        )}

        {isConnected && !showConfig && (
          <div className="space-y-2">
            <h4 className="font-medium">Current Button Mapping:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {Object.entries(buttonMapping).map(([buttonIndex, eventType]) => (
                <div key={buttonIndex} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="font-mono">{XBOX_BUTTON_NAMES[parseInt(buttonIndex)] || `Button ${buttonIndex}`}</span>
                  <Badge variant="outline">{eventType}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {isConnected && showConfig && (
          <div className="space-y-4">
            <h4 className="font-medium">Configure Button Mapping:</h4>
            <div className="space-y-3">
              {Object.entries(XBOX_BUTTON_NAMES).map(([buttonIndex, buttonName]) => (
                <div key={buttonIndex} className="flex items-center justify-between gap-2">
                  <span className="text-sm font-mono min-w-0 flex-1">{buttonName}</span>
                  <Select
                    value={buttonMapping[parseInt(buttonIndex)] || 'none'}
                    onValueChange={(value) => handleMappingChange(parseInt(buttonIndex), value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableEvents.map((event) => (
                        <SelectItem key={event} value={event}>
                          {event}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GamepadConfig;
