import { useState, useCallback, useEffect } from 'react';

export function useHistory<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const pushState = useCallback((newState: T) => {
    // If the new state is the same as the current state, don't push it
    if (JSON.stringify(newState) === JSON.stringify(history[currentIndex])) {
      return;
    }

    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    setState(newState);
  }, [currentIndex, history]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setState(history[newIndex]);
    }
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setState(history[newIndex]);
    }
  }, [currentIndex, history]);

  const reset = useCallback(() => {
    setHistory([initialState]);
    setCurrentIndex(0);
    setState(initialState);
  }, [initialState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    state,
    setState: pushState,
    undo,
    redo,
    reset,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
  };
}
