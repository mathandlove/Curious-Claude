// PolicyRecommendation component
import { Check, FileText, Send, ArrowRight, ArrowLeft, Star, AlertCircle } from 'lucide-react';

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
  keyBenefits?: string[];
  eligibilityRequirements?: string[];
}

interface PolicyRecommendationProps {
  recommendation: Recommendation;
  onAccept: () => void;
  onBack: () => void;
  onViewForm?: () => void;
  loading?: boolean;
}

const confidenceColors = {
  high: 'text-green-400 bg-green-900/20 border-green-500/30',
  medium: 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30',
  low: 'text-red-400 bg-red-900/20 border-red-500/30'
};

const confidenceIcons = {
  high: <Check className="h-4 w-4" />,
  medium: <AlertCircle className="h-4 w-4" />,
  low: <AlertCircle className="h-4 w-4" />
};

export default function PolicyRecommendation({ recommendation, onAccept, onBack, onViewForm, loading = false }: PolicyRecommendationProps) {
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c4a3f] mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">Analyzing Your Answers</h2>
        <p className="text-gray-400 text-sm">Finding the perfect policy match for your situation...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Star className="h-6 w-6 text-[#7c4a3f]" />
          <h2 className="text-xl font-semibold text-white">Recommended Policy</h2>
        </div>
        <p className="text-gray-400 text-sm">
          Based on your answers, here's the best option for your situation
        </p>
      </div>

      {/* Recommendation Card */}
      <div className="bg-[#1a1a1a] border border-gray-600 rounded-lg overflow-hidden">
        {/* Policy Header */}
        <div className="bg-[#7c4a3f]/10 border-b border-[#7c4a3f]/20 p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">{recommendation.title}</h3>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${confidenceColors[recommendation.confidence]}`}>
                {confidenceIcons[recommendation.confidence]}
                {recommendation.confidence.toUpperCase()} CONFIDENCE
              </div>
            </div>
          </div>

          {/* Key Benefits - prominently displayed */}
          <div className="mt-4 p-3 bg-[#7c4a3f]/15 border border-[#7c4a3f]/30 rounded-lg">
            <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-1">
              <span className="text-[#7c4a3f]">★</span>
              Key Benefits
            </h4>
            <div className="space-y-1 text-sm">
              {recommendation.keyBenefits && recommendation.keyBenefits.length > 0 ? (
                recommendation.keyBenefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className={index === 0 ? "text-white font-medium" : "text-gray-200"}
                  >
                    • {benefit}
                  </div>
                ))
              ) : (
                // Fallback for recommendations without keyBenefits field
                <>
                  {recommendation.title.toLowerCase().includes('fmla') && (
                    <>
                      <div className="text-white font-medium">• Up to 12 weeks unpaid leave</div>
                      <div className="text-gray-200">• Job protection guaranteed</div>
                      <div className="text-gray-200">• Health benefits maintained</div>
                    </>
                  )}
                  {recommendation.title.toLowerCase().includes('state disability') && (
                    <>
                      <div className="text-white font-medium">• 60-70% pay replacement</div>
                      <div className="text-gray-200">• Up to 52 weeks coverage</div>
                      <div className="text-gray-200">• Covers non-work injuries</div>
                    </>
                  )}
                  {!recommendation.title.toLowerCase().includes('fmla') && 
                   !recommendation.title.toLowerCase().includes('state disability') && (
                    <div className="text-gray-200 italic">• Benefits details in policy description</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Why This Policy */}
        <div className="p-4 border-b border-gray-700">
          <h4 className="font-medium text-gray-300 mb-3">Why this policy is right for you:</h4>
          <ul className="space-y-2">
            {recommendation.why.map((reason, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 bg-[#7c4a3f] rounded-full mt-2 flex-shrink-0"></div>
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Eligibility Requirements */}
        {recommendation.eligibilityRequirements && recommendation.eligibilityRequirements.length > 0 && (
          <div className="p-4 border-b border-gray-700">
            <h4 className="font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Eligibility Requirements
            </h4>
            <ul className="space-y-2">
              {recommendation.eligibilityRequirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-gray-300">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  {requirement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Required Actions */}
        <div className="p-4 border-b border-gray-700">
          <h4 className="font-medium text-gray-300 mb-3">Next steps:</h4>
          <div className="space-y-2">
            {recommendation.required_actions.map((action, index) => (
              <div key={index} className="flex items-center justify-between bg-[#2a2a2a] p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  {action.type === 'form' ? (
                    <FileText className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Send className="h-4 w-4 text-gray-400" />
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">{action.name}</p>
                    {action.id && <p className="text-gray-500 text-xs">{action.id}</p>}
                  </div>
                </div>
                {(action.url || action.type === 'form') && onViewForm && (
                  <button
                    onClick={onViewForm}
                    className="text-[#7c4a3f] hover:text-[#92574a] text-sm"
                  >
                    View Form
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sequence Notes */}
        {recommendation.sequence_notes && (
          <div className="p-4 border-b border-gray-700">
            <h4 className="font-medium text-gray-300 mb-2">Important notes:</h4>
            <p className="text-sm text-gray-400 bg-blue-900/10 border border-blue-500/20 rounded-lg p-3">
              {recommendation.sequence_notes}
            </p>
          </div>
        )}

        {/* Citations */}
        {recommendation.citations.length > 0 && (
          <div className="p-4">
            <h4 className="font-medium text-gray-300 mb-2">Legal references:</h4>
            <div className="space-y-1">
              {recommendation.citations.map((citation, index) => (
                <p key={index} className="text-xs text-gray-500 font-mono">
                  {citation}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Try Different Answers
        </button>
        
        <button
          onClick={onAccept}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-[#7c4a3f] hover:bg-[#92574a] text-white rounded-lg font-medium transition-colors"
        >
          Continue with This Policy
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}