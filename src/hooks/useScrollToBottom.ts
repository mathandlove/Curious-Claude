
import { useEffect } from 'react';

//Whenever the conversation or showSuggestionBanner changes, we want to scroll to the bottom of the message container.

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

  }, [ref, ...deps]);
}
