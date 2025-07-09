interface UserPromptProps {
  prompt: string;
}

export default function UserPrompt({ prompt }: UserPromptProps) {
  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-2xl">
        <div className="bg-[#7c4a3f] text-white rounded-xl p-4 shadow-md">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{prompt}</p>
        </div>
      </div>
    </div>
  );
}