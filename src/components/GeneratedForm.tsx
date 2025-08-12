import { useState } from 'react';
import { Download, Send, Check, ArrowLeft, FileText, Calendar, User } from 'lucide-react';

interface PolicyOptionData {
  title: string;
  actionType: 'form' | 'request';
  forms?: { name: string; id?: string; url?: string }[];
  requestEndpoint?: string;
}

interface GeneratedFormProps {
  policy: PolicyOptionData;
  formData: Record<string, string>;
  onSubmit: () => void;
  onBack: () => void;
}

export default function GeneratedForm({ policy, formData, onSubmit, onBack }: GeneratedFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    onSubmit();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not specified';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFormattedValue = (key: string, value: string) => {
    if (key.includes('Date') && value) {
      return formatDate(value);
    }
    if (key === 'phone' && value) {
      // Format phone number
      const cleaned = value.replace(/\D/g, '');
      const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
      }
    }
    return value || 'Not specified';
  };

  const fieldLabels: Record<string, string> = {
    employeeName: 'Employee Name',
    employeeId: 'Employee ID',
    email: 'Email Address',
    phone: 'Phone Number',
    startDate: 'Requested Start Date',
    expectedDuration: 'Expected Duration',
    medicalCondition: 'Medical Condition',
    healthcareProvider: 'Healthcare Provider',
    injuryDate: 'Date of Injury/Illness',
    workRelated: 'Work Related',
    lastDayWorked: 'Last Day Worked',
    supervisor: 'Direct Supervisor',
    department: 'Department',
    additionalInfo: 'Additional Information'
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-green-900/20 border border-green-500 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-500 rounded-full p-2">
              <Check className="h-6 w-6 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Form Submitted Successfully!</h2>
          <p className="text-gray-400 text-sm">
            Your {policy.title} request has been submitted to HR. You should receive a confirmation email within 24 hours.
          </p>
        </div>

        <div className="space-y-3 text-sm text-gray-400">
          <p><strong>What happens next?</strong></p>
          <ul className="space-y-2 text-left bg-[#1a1a1a] p-4 rounded-lg">
            <li>• HR will review your request within 1-2 business days</li>
            <li>• You'll receive an email with next steps and any required documentation</li>
            <li>• Keep track of your request ID: <span className="text-white font-mono">ABS-{Date.now().toString().slice(-6)}</span></li>
            <li>• Contact HR at hr@company.com if you have questions</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Review & Submit</h2>
        <p className="text-gray-400 text-sm">
          Please review your information before submitting your {policy.title} request
        </p>
      </div>

      {/* Generated Form Preview */}
      <div className="bg-[#1a1a1a] border border-gray-600 rounded-lg p-6 mb-6">
        {/* Form Header */}
        <div className="border-b border-gray-600 pb-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-[#7c4a3f]" />
            <h3 className="font-semibold text-white">{policy.title}</h3>
          </div>
          <p className="text-xs text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Form Content */}
        <div className="space-y-4">
          {/* Employee Information */}
          <div>
            <h4 className="font-medium text-gray-300 mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Employee Information
            </h4>
            <div className="grid gap-3 md:grid-cols-2 text-sm">
              {['employeeName', 'employeeId', 'email', 'phone', 'department', 'supervisor'].map(key => (
                formData[key] && (
                  <div key={key}>
                    <span className="text-gray-400">{fieldLabels[key]}:</span>
                    <span className="text-white ml-2">{getFormattedValue(key, formData[key])}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Request Details */}
          <div>
            <h4 className="font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Request Details
            </h4>
            <div className="space-y-3 text-sm">
              {Object.entries(formData)
                .filter(([key]) => !['employeeName', 'employeeId', 'email', 'phone', 'department', 'supervisor'].includes(key))
                .map(([key, value]) => (
                  value && (
                    <div key={key}>
                      <span className="text-gray-400">{fieldLabels[key] || key}:</span>
                      <div className="text-white mt-1 ml-2">
                        {key === 'additionalInfo' || key === 'medicalCondition' ? (
                          <div className="bg-[#2a2a2a] p-2 rounded text-xs whitespace-pre-wrap">
                            {value}
                          </div>
                        ) : (
                          getFormattedValue(key, value)
                        )}
                      </div>
                    </div>
                  )
                ))}
            </div>
          </div>

          {/* Required Forms */}
          {policy.forms && policy.forms.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-300 mb-3">Required Forms</h4>
              <div className="space-y-2 text-sm">
                {policy.forms.map((form, index) => (
                  <div key={index} className="flex items-center justify-between bg-[#2a2a2a] p-2 rounded">
                    <span className="text-white">{form.name}</span>
                    {form.url && (
                      <a 
                        href={form.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#7c4a3f] hover:text-[#92574a] text-xs flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4 mb-6 text-xs text-yellow-200">
        <p><strong>Important:</strong> By submitting this form, you certify that the information provided is true and accurate to the best of your knowledge. False information may result in denial of benefits or disciplinary action.</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" />
          Edit Information
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-[#7c4a3f] hover:bg-[#92574a] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Request
            </>
          )}
        </button>
      </div>
    </div>
  );
}