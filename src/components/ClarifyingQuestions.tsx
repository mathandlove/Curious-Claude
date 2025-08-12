import { useState } from 'react';
import { ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react';

interface Question {
  text: string;
  type: 'yes_no' | 'multiple_choice';
  note?: string;
  options?: string[];
}

interface ClarifyingQuestionsProps {
  questions: Question[];
  onComplete: (answers: Record<string, string>) => void;
  onBack: () => void;
  loading?: boolean;
}

export default function ClarifyingQuestions({ questions, onComplete, onBack, loading = false }: ClarifyingQuestionsProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswer = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const canContinue = () => {
    return questions.every((_, index) => answers[index] !== undefined);
  };

  const handleSubmit = () => {
    if (canContinue()) {
      onComplete(answers);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c4a3f] mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">Analyzing Your Options</h2>
        <p className="text-gray-400 text-sm">Generating personalized questions to help you choose...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <HelpCircle className="h-6 w-6 text-[#7c4a3f]" />
          <h2 className="text-xl font-semibold text-white">Help Me Decide</h2>
        </div>
        <p className="text-gray-400 text-sm">
          Answer these questions to find the best policy option for your situation
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={index} className="bg-[#1a1a1a] border border-gray-600 rounded-lg p-4">
            <div className="mb-3">
              <h3 className="text-white font-medium mb-2">
                {index + 1}. {question.text}
              </h3>
              {question.note && (
                <p className="text-xs text-gray-500 italic">{question.note}</p>
              )}
            </div>

            {question.type === 'yes_no' ? (
              <div className="flex gap-3">
                {['Yes', 'No'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(index, option)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      answers[index] === option
                        ? 'bg-[#7c4a3f] text-white'
                        : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {question.options?.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(index, option)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${
                      answers[index] === option
                        ? 'bg-[#7c4a3f] text-white border-2 border-[#7c4a3f]'
                        : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a] border-2 border-transparent'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="mt-6 mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Progress</span>
          <span>{Object.keys(answers).length} of {questions.length} answered</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1">
          <div 
            className="bg-[#7c4a3f] h-1 rounded-full transition-all duration-300" 
            style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Options
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={!canContinue()}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
            canContinue()
              ? 'bg-[#7c4a3f] hover:bg-[#92574a] text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          Get Recommendation
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}