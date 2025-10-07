import React, { useState } from 'react';
import { EVENT_TYPE_DEFINITIONS, EventTypeDefinition } from '@/types/eventTypes';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Automatically load all icons from the icones folder
// You can use this helper function to dynamically load icons
const getIconList = () => {
  // In a real app, you might use webpack's require.context or import.meta.glob
  // For now, we return the static list
  return [
    'aerialduel_logo_20251007104605_1.webp',
    'aerialduellost_logo_20251007104604_1.webp',
    'aerialduelwon_logo_20251007104604_1.webp',
    'assist_logo_20251002170407_1.webp',
    'backwardpass_logo_20251007104637_1.webp',
    'balllost_logo_20251007104545_1.webp',
    'ballrecovered_logo_20251007104545_1.webp',
    'ballrecovery_logo_20251007104545_1.webp',
    'block_logo_20251002170328_1.webp',
    'clearance_logo_20251002170328_1.webp',
    'contact_logo_20251007104654_1.webp',
    'corner_logo_20251002170330_1.webp',
    'cross_logo_20251002170310_1.webp',
    'decisivepass_logo_20251007104638_1.webp',
    'dribble_logo_20251002170309_1.webp',
    'dribbleattempt_logo_20251007104617_1.webp',
    'forwardpass_logo_20251007104637_1.webp',
    'foul_logo_20251002170348_1.webp',
    'freekick_logo_20251002170349_1.webp',
    'goal_logo_20251002170408_1.webp',
    'goalkick_logo_20251002170348_1.webp',
    'groundduel_logo_20251007104604_1.webp',
    'interception_logo_20251002170328_1.webp',
    'lateralpass_logo_20251007104637_1.webp',
    'longpass_logo_20251007104639_1.webp',
    'offensivepass_logo_20251007104617_1.webp',
    'offside_logo_20251002170407_1.webp',
    'owngoal_logo_20251007104545_1.webp',
    'pass_logo_20251002170310_1.webp',
    'penalty_logo_20251002170349_1.webp',
    'possession_logo_20251007104546_1.webp',
    'posthit_logo_20251007104654_1.webp',
    'pressure_logo_20251007104618_1.webp',
    'redcard_logo_20251002170407_1.webp',
    'save_logo_20251002170328_1.webp',
    'shot_logo_20251002170309_1.webp',
    'sixmeterviolation_logo_20251007104653_1.webp',
    'substitution_logo_20251007104605_1.webp',
    'successfulcross_logo_20251007104655_1.webp',
    'successfuldribble_logo_20251007104618_1.webp',
    'supportpass_logo_20251007104617_1.webp',
    'tackle_logo_20251002170310_1.webp',
    'throwin_logo_20251002170348_1.webp',
    'yellowcard_logo_20251002170407_1.webp'
  ];
};

const iconList = getIconList();

const KeyboardManager: React.FC = () => {
  const [shortcuts, setShortcuts] = useState<EventTypeDefinition[]>(
    Object.values(EVENT_TYPE_DEFINITIONS).filter(
      (def) => def.keyboardShortcut
    )
  );

  const handleIconChange = (key: string, newIcon: string) => {
    setShortcuts((prev) =>
      prev.map((shortcut) =>
        shortcut.key === key ? { ...shortcut, icon: newIcon } : shortcut
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyboard Shortcut Management</CardTitle>
        <p className="text-sm text-gray-500">
          Manage keyboard shortcuts for various actions in the application.
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Icon</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Shortcut Key</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shortcuts.map((def) => (
              <TableRow key={def.key}>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="p-2 w-12 h-12">
                        <img 
                          src={def.icon.startsWith('/') || def.icon.startsWith('icones/') ? def.icon : `/icones/${def.icon}`} 
                          alt={def.label}
                          className="w-6 h-6 object-contain"
                        />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96 max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-6 gap-2">
                        {iconList.map((iconFileName) => (
                          <Button
                            key={iconFileName}
                            variant="ghost"
                            className="p-2 w-12 h-12"
                            onClick={() => handleIconChange(def.key, iconFileName)}
                          >
                            <img 
                              src={`/icones/${iconFileName}`} 
                              alt={iconFileName.split('_')[0]}
                              className="w-8 h-8 object-contain"
                            />
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell className="font-medium">{def.label}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center justify-center rounded-md bg-gray-200 px-2 py-1 text-sm font-semibold text-gray-700">
                    {def.keyboardShortcut}
                  </span>
                </TableCell>
                <TableCell>{def.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default KeyboardManager;
