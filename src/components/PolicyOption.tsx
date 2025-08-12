import { useState } from 'react';
import { Check, FileText, Send, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface PolicyForm {
  name: string;
  id?: string;
  url?: string;
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

interface PolicyOptionProps {
  option: PolicyOptionData;
  isSelected?: boolean;
  onSelect: (option: PolicyOptionData) => void;
  onViewForm?: () => void;
}

const jurisdictionColors = {
  federal: 'bg-blue-100 text-blue-800 border-blue-200',
  state: 'bg-green-100 text-green-800 border-green-200',
  company: 'bg-purple-100 text-purple-800 border-purple-200'
};

const confidenceColors = {
  high: 'text-green-600',
  medium: 'text-yellow-600',
  low: 'text-red-600'
};

export default function PolicyOption({ option, isSelected = false, onSelect, onViewForm }: PolicyOptionProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div 
      className="relative h-full cursor-pointer"
      onClick={() => onSelect(option)}
    >

      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            {option.actionType === 'form' ? (
              <FileText className="h-5 w-5 text-gray-400" />
            ) : (
              <Send className="h-5 w-5 text-gray-400" />
            )}
            <h3 className="text-lg font-semibold text-white">{option.title}</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full border ${jurisdictionColors[option.jurisdiction]}`}>
              {option.jurisdiction.toUpperCase()}
            </span>
            <span className={`text-xs font-medium ${confidenceColors[option.confidence]}`}>
              {option.confidence.toUpperCase()} MATCH
            </span>
          </div>
        </div>

        {/* Key Benefits - prominently displayed */}
        <div className="mb-4 p-3 bg-[#7c4a3f]/10 border border-[#7c4a3f]/20 rounded-lg">
          <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-1">
            <span className="text-[#7c4a3f]">★</span>
            Key Benefits
          </h4>
          <div className="space-y-1 text-sm">
            {option.keyBenefits && option.keyBenefits.length > 0 ? (
              option.keyBenefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className={index === 0 ? "text-white font-medium" : "text-gray-300"}
                >
                  • {benefit}
                </div>
              ))
            ) : (
              // Fallback for policies without keyBenefits field
              <>
                {option.title.toLowerCase().includes('fmla') && (
                  <>
                    <div className="text-white font-medium">• Up to 12 weeks unpaid leave</div>
                    <div className="text-gray-300">• Job protection guaranteed</div>
                    <div className="text-gray-300">• Health benefits maintained</div>
                  </>
                )}
                {option.title.toLowerCase().includes('state disability') && (
                  <>
                    <div className="text-white font-medium">• 60-70% pay replacement</div>
                    <div className="text-gray-300">• Up to 52 weeks coverage</div>
                    <div className="text-gray-300">• Covers non-work injuries</div>
                  </>
                )}
                {!option.title.toLowerCase().includes('fmla') && 
                 !option.title.toLowerCase().includes('state disability') && (
                  <div className="text-gray-300 italic">• Benefits details in policy description</div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-3">{option.description}</p>

        {/* Eligibility Requirements */}
        {option.eligibilityRequirements && option.eligibilityRequirements.length > 0 && (
          <div className="mb-3 p-3 bg-gray-800/30 border border-gray-700 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              Eligibility Requirements
            </h4>
            <div className="space-y-1 text-sm">
              {option.eligibilityRequirements.map((requirement, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span className="text-gray-300">{requirement}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {option.requestEndpoint && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-400 mb-1">Submit Request To:</h4>
            <p className="text-sm text-gray-300 font-mono">{option.requestEndpoint}</p>
          </div>
        )}

        {/* Rationale */}
        <div className="border-t border-gray-700 pt-3 mt-3">
          <p className="text-xs text-gray-400 italic">"{option.rationale}"</p>
        </div>

        {/* Expandable details */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-400 mt-2 transition-colors"
        >
          <Info className="h-3 w-3" />
          Legal References
          {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {showDetails && (
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            {option.citations.map((citation, index) => (
              <div key={index} className="pl-4 border-l border-gray-700">
                {citation}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}