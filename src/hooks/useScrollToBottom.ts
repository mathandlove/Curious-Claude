// src/hooks/useScrollToBottom.ts
import { useEffect } from 'react';

export function useScrollToBottom(
  ref: React.RefObject<HTMLDivElement | null>, 
  deps: React.DependencyList = []
) {
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
        behavior: 'smooth',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, ...deps]);
}
