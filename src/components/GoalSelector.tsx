import { useState } from 'react';

interface GoalSelectorProps {
  visible: boolean;
  onGoalSelected: (goal: string) => void;
}

export default function GoalSelector({ visible, onGoalSelected }: GoalSelectorProps) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [customGoal, setCustomGoal] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const predefinedGoals = [
    "Understand the concept",
    "Learn practical applications", 
    "Get examples and use cases"
  ];

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
      setIsCollapsed(true);
      onGoalSelected(customGoal.trim());
    }
  };

  if (!visible) return null;

  if (isCollapsed) {
    return (
      <div className="mb-6 transition-all duration-1000 ease-in-out">
        <div className="w-full max-w-3xl mx-auto">
          <div className="rounded-lg bg-[#7c4a3f] text-white px-3 py-2 text-sm inline-block">
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
        <div className="rounded-xl bg-[#2a2a2a] border border-muted/30 p-4 shadow-lg">
          <div className="space-y-3">
            {predefinedGoals.map((goal, index) => (
              <button
                key={index}
                onClick={() => handleGoalSelect(goal)}
                className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                  selectedGoal === goal
                    ? 'bg-[#7c4a3f] text-white'
                    : 'bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]'
                }`}
              >
                {goal}
              </button>
            ))}
            
            <button
              onClick={handleCustomGoalSelect}
              className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                selectedGoal === "custom"
                  ? 'bg-[#7c4a3f] text-white'
                  : 'bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]'
              }`}
            >
              ✏️ I have my own learning goal
            </button>
            
            {showCustomInput && (
              <form onSubmit={handleCustomGoalSubmit} className="mt-3">
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="Enter your custom learning goal..."
                  className="w-full bg-[#1a1a1a] text-white placeholder:text-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c4a3f] border border-muted/30"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!customGoal.trim()}
                  className="mt-2 bg-[#7c4a3f] hover:bg-[#92574a] disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
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