interface UserGoalPromptProps {
  visible: boolean;
}

export default function UserGoalPrompt({ visible }: UserGoalPromptProps) {
  if (!visible) return null;

  return (
    <div className={`mb-6 transition-all duration-1000 ease-in-out ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      <div className="w-full max-w-3xl mx-auto">
        <div className="rounded-xl bg-[#2a2a2a] border border-muted/30 p-4 flex items-center gap-3 text-muted-foreground shadow-lg">
          <div className="flex-1">
            <span className="text-white text-sm">🎯 Select Your Learning Goal 
            </span>
            <div className="relative group inline-block ml-2">
  <div className="bg-gray-700 text-white text-xs rounded-full px-1.5 py-0.5 cursor-pointer">?</div>
  <div className="absolute z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 mt-1 w-48">
    This helps Claude tailor the response to your goal.
  </div>
</div>
          </div>
        </div>
      </div>
    </div>
  );
}