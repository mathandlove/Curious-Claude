import { useState, useRef } from 'react';
import AbsenceHeroUI from '@/components/AbsenceHeroUI';
import AbsencePromptForm from '@/components/AbsencePromptForm';
import PolicySelector from '@/components/PolicySelector';
import FormDataCollector from '@/components/FormDataCollector';
import GeneratedForm from '@/components/GeneratedForm';
import ClarifyingQuestions from '@/components/ClarifyingQuestions';
import PolicyRecommendation from '@/components/PolicyRecommendation';
import DemoModal from '@/components/DemoModal';
import { postToClaude } from '@/api/claude';
import type { ClaudeTextResponse } from '../../backend/shared/claudeTypes';
import type { Message } from '../../backend/shared/messageTypes';
import './AbsenceNavigator.css';

type WorkflowStep = 'initial' | 'empathy' | 'options' | 'clarifying-questions' | 'recommendation' | 'form-data' | 'review-submit' | 'completed' | 'help-deciding';

interface Question {
  text: string;
  type: 'yes_no' | 'multiple_choice';
  note?: string;
  options?: string[];
}

interface PolicyOptionData {
  title: string;
  actionType: 'form' | 'request';
  description: string;
  keyBenefits?: string[];
  eligibilityRequirements?: string[];
  requestEndpoint?: string;
  jurisdiction: 'federal' | 'state' | 'company';
  confidence: 'high' | 'medium' | 'low';
  citations: string[];
  rationale: string;
}

interface RecommendationAction {
  type: 'form' | 'request';
  name: string;
  id?: string;
  url?: string;
}

interface Recommendation {
  title: string;
  confidence: 'high' | 'medium' | 'low';
  why: string[];
  required_actions: RecommendationAction[];
  sequence_notes?: string;
  citations: string[];
}

export default function AbsenceNavigator() {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('initial');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [policyOptions, setPolicyOptions] = useState<PolicyOptionData[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyOptionData | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);
  const [clarifyingQuestions, setClarifyingQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (submittedPrompt: string) => {
    if (currentStep === 'initial') {
      setCurrentStep('empathy');
      setLoading(true);

      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: submittedPrompt,
      };

      const claudeMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'claude',
        content: 'Understanding your situation...',
        isThinking: true,
      };

      // Add messages to conversation
      setConversation(prev => [...prev, userMessage, claudeMessage]);

      try {
        // First message - use empathy/confirmation endpoint
        const result = await postToClaude<ClaudeTextResponse>('absence', {
          request: submittedPrompt,
        });

        // Update the Claude message with the response
        setConversation(prev => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage?.isThinking) {
            lastMessage.content = result.content;
            lastMessage.isThinking = false;
          }
          return updated;
        });
      } catch (error) {
        console.error('Error calling absence API:', error);
        
        // Update the Claude message with error
        setConversation(prev => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage?.isThinking) {
            lastMessage.error = 'I apologize, but I encountered an error while processing your request. Please try again.';
            lastMessage.content = '';
            lastMessage.isThinking = false;
          }
          return updated;
        });
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 'empathy') {
      // Handle Yes/No response
      handleEmpathyResponse(submittedPrompt);
    } else if (currentStep === 'help-deciding') {
      // Handle follow-up questions for decision assistance
      handleDecisionHelp(submittedPrompt);
    }
  };

  const handleEmpathyResponse = async (response: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: response,
    };

    setConversation(prev => [...prev, userMessage]);

    if (response.toLowerCase().includes('yes')) {
      // Add thinking message to conversation
      const thinkingMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'claude',
        content: 'Let me analyze your situation and find the best policy options for you...',
        isThinking: true,
      };
      
      setConversation(prev => [...prev, thinkingMessage]);
      setLoading(true);
      setIsLoadingPolicies(true);
      
      // Generate dynamic policy options including company policies
      setTimeout(async () => {
        console.log('Starting policy generation...');
        // Get the user's original request - define outside try/catch for use in both blocks
        const originalRequest = conversation[0]?.content || '';
        console.log('Original request:', originalRequest);
        
        try {
          // Call the all policy options API that uses GetCompanyPolicy tool internally
          const allPolicyOptionsResult = await postToClaude<ClaudeTextResponse>('get-all-policy-options', {
            request: originalRequest,
          });

          // Parse the policy options (handle markdown if present)
          let policyOptionsContent = allPolicyOptionsResult.content;
          if (policyOptionsContent.includes('```json')) {
            const match = policyOptionsContent.match(/```json\n([\s\S]*?)\n```/);
            if (match) {
              policyOptionsContent = match[1];
            }
          }
          
          const policyOptionsData = JSON.parse(policyOptionsContent);
          
          // Set the policy options directly from the comprehensive API response
          setPolicyOptions(policyOptionsData.policyOptions || []);
        } catch (error) {
          console.error('Error getting all policy options:', error);
          console.error('Error details:', error instanceof Error ? error.message : String(error));
          
          // If API fails, show an error message instead of fallback
          alert('Unable to load policy options. Please check your internet connection and try again.');
          setLoading(false);
          setIsLoadingPolicies(false);
          return;
        }
        
        console.log('Policy generation completed, transitioning to options...');
        // Remove thinking message and transition to options
        setConversation(prev => prev.filter(msg => !msg.isThinking));
        setCurrentStep('options');
        setLoading(false);
        setIsLoadingPolicies(false);
      }, 500); // Reduced delay
    } else {
      // Restart the process
      setCurrentStep('initial');
      setConversation([]);
    }
  };

  const handleDecisionHelp = async (question: string) => {
    setLoading(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
    };

    const claudeMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'claude',
      content: '',
      isThinking: true,
    };

    setConversation(prev => [...prev, userMessage, claudeMessage]);

    try {
      // Use decision assistance endpoint
      const result = await postToClaude<ClaudeTextResponse>('absence-decision-help', {
        question: question,
        policies: policyOptions,
        originalRequest: conversation[0]?.content || ''
      });

      setConversation(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage?.isThinking) {
          lastMessage.content = result.content;
          lastMessage.isThinking = false;
        }
        return updated;
      });
    } catch (error) {
      console.error('Error with decision help:', error);
      setConversation(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage?.isThinking) {
          lastMessage.error = 'Sorry, I encountered an error while helping with your decision.';
          lastMessage.content = '';
          lastMessage.isThinking = false;
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePolicySelect = (policy: PolicyOptionData) => {
    setSelectedPolicy(policy);
    setShowDemoModal(true);
  };

  const handleNeedHelp = async () => {
    setIsLoadingQuestions(true);
    setCurrentStep('clarifying-questions');
    
    try {
      // Call the new clarifying questions API
      const result = await postToClaude<ClaudeTextResponse>('absence-clarifying-questions', {
        policies: policyOptions,
      });

      // Parse the JSON response (handle markdown code blocks)
      let jsonContent = result.content;
      if (jsonContent.includes('```json')) {
        // Extract JSON from markdown code blocks
        const match = jsonContent.match(/```json\n([\s\S]*?)\n```/);
        if (match) {
          jsonContent = match[1];
        }
      }
      
      const questionsData = JSON.parse(jsonContent);
      setClarifyingQuestions(questionsData.questions || []);
    } catch (error) {
      console.error('Error getting clarifying questions:', error);
      // Fallback to default questions
      setClarifyingQuestions([
        {
          text: "Have you worked here for at least 12 months?",
          type: "yes_no",
          note: "Required for FMLA eligibility."
        },
        {
          text: "Is your absence for your own serious health condition or a family member's?",
          type: "multiple_choice",
          options: ["My own health", "Family member's health", "Both"],
          note: "Helps determine which policies apply."
        },
        {
          text: "Do you need continuous time off or intermittent leave?",
          type: "multiple_choice", 
          options: ["Continuous (all at once)", "Intermittent (as needed)", "Not sure"],
          note: "Different policies have different flexibility."
        }
      ]);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleFormDataSubmit = (data: Record<string, string>) => {
    setFormData(data);
    setCurrentStep('review-submit');
  };

  const handleFormSubmit = () => {
    setCurrentStep('completed');
  };

  const handleBackToOptions = () => {
    setCurrentStep('options');
    setSelectedPolicy(null);
    setFormData({});
  };

  const handleBackToForm = () => {
    setCurrentStep('form-data');
  };

  const handleQuestionsComplete = async (answers: Record<string, string>) => {
    setIsLoadingRecommendation(true);
    setCurrentStep('recommendation');
    
    try {
      // Call the policy recommendation API
      console.log('Calling recommendation API with policies:', policyOptions);
      console.log('Policy titles:', policyOptions.map(p => p.title));
      console.log('Policy confidences:', policyOptions.map(p => `${p.title}: ${p.confidence}`));
      console.log('User answers:', answers);
      
      const result = await postToClaude<ClaudeTextResponse>('absence-policy-recommendation', {
        policies: policyOptions,
        answers: answers,
      });

      console.log('Raw API response:', result);

      // Parse the JSON response (handle markdown code blocks)
      let jsonContent = result.content;
      if (jsonContent.includes('```json')) {
        // Extract JSON from markdown code blocks
        const match = jsonContent.match(/```json\n([\s\S]*?)\n```/);
        if (match) {
          jsonContent = match[1];
        }
      }
      
      const recommendationData = JSON.parse(jsonContent);
      console.log('Parsed recommendation data:', recommendationData);
      setRecommendation(recommendationData.recommendation);
    } catch (error) {
      console.error('Error getting policy recommendation:', error);
      console.error('Error details:', error);
      // Fallback recommendation
      setRecommendation({
        title: "FMLA Medical Leave",
        confidence: "medium",
        why: [
          "Based on your answers, FMLA appears to be the most suitable option",
          "This provides federal protection for medical leave situations",
          "Fallback recommendation due to system error"
        ],
        required_actions: [
          {
            type: "form",
            name: "FMLA Application Form",
            id: "FMLA-001"
          }
        ],
        sequence_notes: "This is a fallback recommendation. Please contact HR for personalized assistance.",
        citations: ["29 U.S.C. § 2601"]
      });
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  const handleBackFromQuestions = () => {
    setCurrentStep('options');
    setClarifyingQuestions([]);
  };

  const handleRecommendationAccept = () => {
    // Find the recommended policy from our options and set it as selected
    if (recommendation) {
      const recommendedPolicy = policyOptions.find(policy => policy.title === recommendation.title);
      if (recommendedPolicy) {
        setSelectedPolicy(recommendedPolicy);
      }
      setShowDemoModal(true);
    }
  };

  const handleBackFromRecommendation = () => {
    setCurrentStep('clarifying-questions');
    setRecommendation(null);
  };

  const handleCloseDemoModal = () => {
    setShowDemoModal(false);
  };

  // Removed unused handleBookmark function to fix lint warning

  const renderProgressIndicator = () => {
    if (currentStep === 'initial') return null;
    
    const steps = [
      { key: 'empathy', label: 'Understanding', completed: ['options', 'clarifying-questions', 'recommendation', 'form-data', 'review-submit', 'completed'].includes(currentStep) },
      { key: 'options', label: 'Options', completed: ['clarifying-questions', 'recommendation', 'form-data', 'review-submit', 'completed'].includes(currentStep), current: currentStep === 'options' || isLoadingPolicies },
      { key: 'clarifying-questions', label: 'Questions', completed: ['recommendation', 'form-data', 'review-submit', 'completed'].includes(currentStep), current: currentStep === 'clarifying-questions' },
      { key: 'recommendation', label: 'Recommendation', completed: ['form-data', 'review-submit', 'completed'].includes(currentStep), current: currentStep === 'recommendation' },
      { key: 'form-data', label: 'Information', completed: ['review-submit', 'completed'].includes(currentStep), current: currentStep === 'form-data' },
      { key: 'review-submit', label: 'Review', completed: currentStep === 'completed', current: currentStep === 'review-submit' }
    ];

    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-30 hidden sm:block">
        <div className="flex items-center gap-2 bg-[#1a1a1a]/90 backdrop-blur-sm border border-gray-700 rounded-full px-4 py-2">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                step.completed ? 'bg-green-500' : 
                step.current ? 'bg-[#7c4a3f]' : 
                'bg-gray-600'
              }`} />
              <span className={`text-xs ${
                step.completed ? 'text-green-400' :
                step.current ? 'text-white' :
                'text-gray-500'
              }`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className="w-4 h-px bg-gray-600 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'initial':
        return (
          <>
            {/* Hero section */}
            <div className="pb-20 h-[80vh] flex items-center justify-center">
              <AbsenceHeroUI visible={true} />
            </div>
            {/* Prompt Form */}
            <div className="fixed left-0 right-0 bottom-[15vh] flex justify-center px-6 z-20">
              <div className="w-full max-w-sm sm:max-w-3xl mx-auto px-4 sm:px-6">
                <AbsencePromptForm
                  onSubmit={handleSubmit}
                  loading={loading}
                  response=""
                  error={null}
                />
              </div>
            </div>
          </>
        );

      case 'empathy':
        return (
          <>
            {/* Conversation area */}
            <div
              ref={scrollContainerRef}
              className="absolute top-0 left-0 md:left-20 right-0 bottom-0 overflow-y-auto"
            >
              <div className="pb-32 pt-20 px-6">
                <div className="max-w-3xl mx-auto">
                  {conversation.map((message) => (
                    <div key={message.id} className="mb-6">
                      {message.type === 'user' ? (
                        <div className="flex justify-end">
                          <div className="max-w-2xl">
                            <p className="text-white text-sm leading-relaxed bg-[#7c4a3f] rounded-lg px-4 py-2">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-start">
                          <div className="max-w-2xl">
                            {message.isThinking && (
                              <div className="flex items-center gap-3 text-muted-foreground">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#7c4a3f]"></div>
                                <p className="text-sm">{message.content}</p>
                              </div>
                            )}
                            
                            {message.error && !message.isThinking && (
                              <div className="text-red-400">
                                <p className="text-sm font-medium mb-1">Something went wrong</p>
                                <p className="text-sm text-red-300">{message.error}</p>
                              </div>
                            )}
                            
                            {message.content && !message.isThinking && !message.error && (
                              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                {message.content}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Prompt Form */}
            <div className="fixed left-0 right-0 bottom-0 flex justify-center px-6 z-20">
              <div className="w-full max-w-sm sm:max-w-3xl mx-auto px-4 sm:px-6">
                <AbsencePromptForm
                  onSubmit={handleSubmit}
                  loading={loading}
                  response=""
                  error={null}
                />
              </div>
            </div>
          </>
        );

      case 'options':
        return (
          <div className="min-h-screen px-6 py-4">
            {isLoadingPolicies ? (
              <div className="text-center flex items-center justify-center min-h-screen">
                <div>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c4a3f] mx-auto mb-4"></div>
                  <h2 className="text-xl font-semibold text-white mb-2">Analyzing Your Situation</h2>
                  <p className="text-gray-400 text-sm">Finding the best policy options for your needs...</p>
                </div>
              </div>
            ) : (
              <PolicySelector
                options={policyOptions}
                onSelect={handlePolicySelect}
                onNeedHelp={handleNeedHelp}
                onViewForm={() => setShowDemoModal(true)}
              />
            )}
          </div>
        );

      case 'clarifying-questions':
        return (
          <div className="min-h-screen pt-20 pb-6 px-6">
            <div className="max-w-4xl mx-auto">
              <ClarifyingQuestions
                questions={clarifyingQuestions}
                onComplete={handleQuestionsComplete}
                onBack={handleBackFromQuestions}
                loading={isLoadingQuestions}
              />
            </div>
          </div>
        );

      case 'recommendation':
        return (
          <div className="min-h-screen pt-20 pb-6 px-6">
            <div className="max-w-4xl mx-auto">
              {recommendation ? (
                <PolicyRecommendation
                  recommendation={recommendation}
                  onAccept={handleRecommendationAccept}
                  onBack={handleBackFromRecommendation}
                  onViewForm={() => setShowDemoModal(true)}
                  loading={isLoadingRecommendation}
                />
              ) : (
                <PolicyRecommendation
                  recommendation={{} as Recommendation}
                  onAccept={handleRecommendationAccept}
                  onBack={handleBackFromRecommendation}
                  onViewForm={() => setShowDemoModal(true)}
                  loading={isLoadingRecommendation}
                />
              )}
            </div>
          </div>
        );

      case 'form-data':
        return (
          <div className="min-h-screen flex items-center justify-center px-6">
            {selectedPolicy && (
              <FormDataCollector
                policyTitle={selectedPolicy.title}
                onSubmit={handleFormDataSubmit}
                onBack={handleBackToOptions}
              />
            )}
          </div>
        );

      case 'review-submit':
        return (
          <div className="min-h-screen flex items-center justify-center px-6">
            {selectedPolicy && (
              <GeneratedForm
                policy={selectedPolicy}
                formData={formData}
                onSubmit={handleFormSubmit}
                onBack={handleBackToForm}
              />
            )}
          </div>
        );

      case 'completed':
        return (
          <div className="min-h-screen flex items-center justify-center px-6">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-green-900/20 border border-green-500 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">Request Completed!</h2>
                <p className="text-gray-400 text-sm">
                  Your absence request has been successfully submitted to HR.
                </p>
              </div>
              <button
                onClick={() => {
                  setCurrentStep('initial');
                  setConversation([]);
                  setPolicyOptions([]);
                  setSelectedPolicy(null);
                  setFormData({});
                }}
                className="px-6 py-2 bg-[#7c4a3f] hover:bg-[#92574a] text-white rounded-lg font-medium transition-colors"
              >
                Start New Request
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {renderProgressIndicator()}
      {renderCurrentStep()}
      <DemoModal isOpen={showDemoModal} onClose={handleCloseDemoModal} />
    </div>
  );
}