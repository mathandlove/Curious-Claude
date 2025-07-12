// src/hooks/useScrollToBottom.ts
import { useEffect } from 'react';

export function useScrollToBottom(ref: React.RefObject<HTMLDivElement | null>, deps: any[] = []) {
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, deps);
}
