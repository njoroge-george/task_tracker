"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import CommandPalette from '@/components/commands/CommandPalette';

type KeyboardShortcutsContextType = {
  registerShortcut: (key: string, callback: () => void) => void;
  unregisterShortcut: (key: string) => void;
  openCommandPalette: () => void;
};

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | null>(null);

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider');
  }
  return context;
};

type Props = {
  children: ReactNode;
  onToggleTheme?: () => void;
};

export default function KeyboardShortcutsProvider({ children, onToggleTheme }: Props) {
  const [shortcuts, setShortcuts] = useState<Map<string, () => void>>(new Map());
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const registerShortcut = (key: string, callback: () => void) => {
    setShortcuts((prev) => new Map(prev).set(key, callback));
  };

  const unregisterShortcut = (key: string) => {
    setShortcuts((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  };

  const openCommandPalette = () => {
    setCommandPaletteOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // Don't trigger shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Build the shortcut key string
      const parts: string[] = [];
      if (e.ctrlKey) parts.push('ctrl');
      if (e.shiftKey) parts.push('shift');
      if (e.altKey) parts.push('alt');
      if (e.metaKey) parts.push('meta');
      parts.push(e.key.toLowerCase());
      
      const shortcutKey = parts.join('+');

      // Execute registered shortcut
      const callback = shortcuts.get(shortcutKey);
      if (callback) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        registerShortcut,
        unregisterShortcut,
        openCommandPalette,
      }}
    >
      {children}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onToggleTheme={onToggleTheme}
      />
    </KeyboardShortcutsContext.Provider>
  );
}
