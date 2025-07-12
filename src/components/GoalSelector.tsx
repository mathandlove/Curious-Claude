import { useState } from 'react';

interface GoalSelectorProps {
  visible: boolean;
  onGoalSelected: (goal: string) => void;
  dynamicGoals?: string[];
}

export default function GoalSelector({ visible, onGoalSelected, dynamicGoals }: GoalSelectorProps) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [customGoal, setCustomGoal] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal);
    setShowCustomInput(false);
    setIsCollapsed(true);
    onGoalSelected(goal);
  };

  const handleCustomGoalSelect = () => {
    setSelectedGoal("custom");
    setShowCustomInput(true);
  };

const handleCustomGoalSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (customGoal.trim()) {
    const trimmedGoal = customGoal.trim();
    setSelectedGoal(trimmedGoal); // This is the key fix
    setIsCollapsed(true);
    onGoalSelected(trimmedGoal);
  }
};


  if (!visible) return null;

  if (isCollapsed) {
    return (
      <div className="mb-6 transition-all duration-1000 ease-in-out">
        <div className="w-full ">
          <div className="rounded-xl bg-[#7c4a3f] text-white px-4 py-3 text-base font-medium shadow">
            🎯 Learning Goal: {selectedGoal === "custom" ? customGoal : selectedGoal}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-6 transition-all duration-1000 ease-in-out ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      <div className="w-full max-w-3xl mx-auto">
        <div className="rounded-2xl bg-[#1e1e1e] border border-white/10 p-6 shadow-lg">
          <div className="flex flex-col items-start space-y-3">
            {dynamicGoals?.map((goal, index) => (
              <button
                key={index}
                onClick={() => handleGoalSelect(goal)}
                className={`w-full text-left px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 shadow-sm
                  ${
                    selectedGoal === goal
                      ? 'bg-[#7c4a3f] text-white'
                      : 'bg-[#2a2a2a] text-white/80 hover:bg-[#3a3a3a]'
                  }`}
              >
                {goal}
              </button>
            ))}

            <button
              onClick={handleCustomGoalSelect}
              className={`w-full text-left px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 shadow-sm
                ${
                  selectedGoal === "custom"
                    ? 'bg-[#7c4a3f] text-white'
                    : 'bg-[#2a2a2a] text-white/80 hover:bg-[#3a3a3a]'
                }`}
            >
              ✏️ I have my own learning goal
            </button>

            {showCustomInput && (
              <form onSubmit={handleCustomGoalSubmit} className="mt-3 w-[75%] flex items-center gap-2">
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="Enter your custom learning goal..."
                  className="flex-1 bg-[#1a1a1a] text-white placeholder:text-gray-500 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c4a3f] border border-white/10"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!customGoal.trim()}
                  className="bg-[#7c4a3f] hover:bg-[#92574a] disabled:bg-gray-600 text-white px-4 py-2 rounded-md transition-all duration-200 text-sm"
                >
                  Set Goal
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
