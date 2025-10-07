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

const iconList = [
  '⚽', '🎯', '↗️', '🏃', '⚔️', '✋', '🦶', '🥅', '🛡️', '📐', 'k', 'h', 'l', 'n',
  '⚠️', '🟨', '🟥', '🚩', '🖐️', 'g', 'a', 'w', '❌', '✅', '🔄', 'e', 'q', '🏆',
  '👎', '💨', '⚡', '🏃‍♂️💨', '🤝', '🚀', '🔑', '📏➡️', '⬆️', '⬇️', '↔️', '✅', '💥',
  '📏', '🥅', '👊', '🧤', '🏃‍♂️', '🎯✅', '🎯❌', '🛡️⚽', '🗣️', '🦵', '🧍⚔️', '🏁',
  '⏸️', '⏱️', '⏹️', '🎯🔫', '✅⚽', '❌⚽', '📹', '✓📹', '🚑', '🐌', '🚫👟', '⬆️⚡',
  '🏃⬆️', '🎯🔝', '📦⚽', '🔑🎯', '👢📏', '👢🚀', '🪤'
];

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
                      <Button variant="outline" className="text-2xl p-2">
                        {def.icon}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="grid grid-cols-8 gap-2">
                        {iconList.map((icon) => (
                          <Button
                            key={icon}
                            variant="ghost"
                            className="text-2xl p-2"
                            onClick={() => handleIconChange(def.key, icon)}
                          >
                            {icon}
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