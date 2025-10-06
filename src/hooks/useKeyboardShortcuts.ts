import { useEffect, useCallback } from 'react';

type ShortcutCallback = () => void;

interface ShortcutMap {
  [key: string]: ShortcutCallback;
}

export const useKeyboardShortcuts = (shortcutMap: ShortcutMap, isActive: boolean = true) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActive) return;

      const callback = shortcutMap[event.code];
      if (callback) {
        event.preventDefault();
        callback();
      }
    },
    [shortcutMap, isActive]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};