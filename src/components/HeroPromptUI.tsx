import { Brain } from 'lucide-react';

interface HeroPromptUIProps {
  visible: boolean;
}

export default function HeroPromptUI({ visible }: HeroPromptUIProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-background text-foreground px-6 transition-opacity duration-1000 ease-in-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-3xl w-full mx-auto text-center mt-0 sm:mt-0">
        <div className="flex flex-col-reverse sm:flex-row items-center justify-center gap-3 mb-4">
          <h1 className="text-5xl font-sans font-light text-white">
            Curious Claude
          </h1>
          <Brain className="h-10 w-10 text-[#7c4a3f]" />
        </div>

        <p className="text-muted-foreground text-xl text-center">
          Get Better at Thinking, One Prompt at a Time
        </p>
      </div>
    </div>
  );
}
