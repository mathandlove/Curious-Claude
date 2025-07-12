import UserPrompt from './UserPrompt';
import ClaudeMessage from './ClaudeMessage';
import UserGoalPrompt from './UserGoalPrompt';
import GoalSelector from './GoalSelector';

interface Message {
  id: string;
  type: 'user' | 'claude';
  content: string;
  isThinking?: boolean;
  error?: string | null;
}

interface ClaudeResponseProps {
  visible: boolean;
  conversation: Message[];
  showGoalPrompt: boolean;
  showGoalSelector: boolean;
  onGoalSelected: (goal: string) => void;
  selectedGoal: string | null;
  dynamicGoals?: string[];
}

export default function ClaudeResponse({ visible, conversation, showGoalPrompt, showGoalSelector, onGoalSelected, selectedGoal, dynamicGoals }: ClaudeResponseProps) {
  if (!visible) return null;

  return (
    <div className={`flex-1 py-8 transition-all duration-1000 ease-in-out ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      <div className="max-w-3xl mx-auto h-full px-6">
        {conversation.map((message, index) => (
          <div key={message.id}>
            {message.type === 'user' ? (
              <>
                <UserPrompt prompt={message.content} />
                {index === 0 && (
                  <>
                    <div className="max-w-md text-sm px-4">
                    <UserGoalPrompt visible={showGoalPrompt} />

                    <GoalSelector visible={showGoalSelector} onGoalSelected={onGoalSelected} dynamicGoals={dynamicGoals} />
                    </div>
                    {/* Show goal badge only under the first user message after goal is selected */}
                    {selectedGoal && (
                      <div className="mb-6">
                        <div className="rounded-lg bg-[#7c4a3f] text-white px-3 py-2 text-sm inline-block">
                          🎯 Learning Goal: {selectedGoal}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <ClaudeMessage 
                response={message.content}
                error={message.error}
                isThinking={message.isThinking || false}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}