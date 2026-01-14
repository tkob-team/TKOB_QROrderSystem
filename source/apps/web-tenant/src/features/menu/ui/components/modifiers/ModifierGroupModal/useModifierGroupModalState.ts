import { useCallback, type KeyboardEvent } from 'react';

interface UseModifierGroupModalStateArgs {
  onAddOption: () => void;
}

export function useModifierGroupModalState({ onAddOption }: UseModifierGroupModalStateArgs) {
  const handleOptionKeyPress = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        onAddOption();
      }
    },
    [onAddOption],
  );

  return {
    handleOptionKeyPress,
  };
}
