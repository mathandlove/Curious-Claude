import { useState } from 'react';
import { Calendar, User, MapPin, FileText, Clock, Phone, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'email' | 'phone' | 'textarea' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[];
  icon?: React.ReactNode;
}

interface FormDataCollectorProps {
  policyTitle: string;
  onSubmit: (data: Record<string, string>) => void;
  onBack: () => void;
}

export default function FormDataCollector({ policyTitle, onSubmit, onBack }: FormDataCollectorProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic form fields based on policy type
  const getFormFields = (): FormField[] => {
    const baseFields: FormField[] = [
      {
        id: 'employeeName',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your full legal name',
        icon: <User className="h-4 w-4" />
      },
      {
        id: 'employeeId',
        label: 'Employee ID',
        type: 'text',
        required: true,
        placeholder: 'Your employee ID number',
        icon: <FileText className="h-4 w-4" />
      },
      {
        id: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'your.email@company.com',
        icon: <Mail className="h-4 w-4" />
      },
      {
        id: 'phone',
        label: 'Phone Number',
        type: 'phone',
        required: true,
        placeholder: '(555) 123-4567',
        icon: <Phone className="h-4 w-4" />
      }
    ];

    // Add policy-specific fields
    if (policyTitle.toLowerCase().includes('medical') || policyTitle.toLowerCase().includes('fmla')) {
      baseFields.push(
        {
          id: 'startDate',
          label: 'Requested Start Date',
          type: 'date',
          required: true,
          icon: <Calendar className="h-4 w-4" />
        },
        {
          id: 'expectedDuration',
          label: 'Expected Duration',
          type: 'select',
          required: true,
          options: ['1-2 weeks', '3-4 weeks', '1-2 months', '3+ months', 'Intermittent', 'Uncertain'],
          icon: <Clock className="h-4 w-4" />
        },
        {
          id: 'medicalCondition',
          label: 'Medical Condition (brief description)',
          type: 'textarea',
          required: true,
          placeholder: 'Briefly describe your medical condition or reason for leave',
        },
        {
          id: 'healthcareProvider',
          label: 'Healthcare Provider Name',
          type: 'text',
          required: true,
          placeholder: 'Dr. Smith, ABC Medical Center',
        }
      );
    }

    if (policyTitle.toLowerCase().includes('disability')) {
      baseFields.push(
        {
          id: 'injuryDate',
          label: 'Date of Injury/Illness',
          type: 'date',
          required: true,
          icon: <Calendar className="h-4 w-4" />
        },
        {
          id: 'workRelated',
          label: 'Is this work-related?',
          type: 'select',
          required: true,
          options: ['Yes', 'No', 'Uncertain']
        },
        {
          id: 'lastDayWorked',
          label: 'Last Day You Were Able to Work',
          type: 'date',
          required: true,
          icon: <Calendar className="h-4 w-4" />
        }
      );
    }

    baseFields.push(
      {
        id: 'supervisor',
        label: 'Direct Supervisor/Manager',
        type: 'text',
        required: true,
        placeholder: 'Manager name and department',
        icon: <User className="h-4 w-4" />
      },
      {
        id: 'department',
        label: 'Department/Team',
        type: 'text',
        required: true,
        placeholder: 'Your department or team',
        icon: <MapPin className="h-4 w-4" />
      },
      {
        id: 'additionalInfo',
        label: 'Additional Information',
        type: 'textarea',
        required: false,
        placeholder: 'Any additional details that might be helpful for processing your request...',
      }
    );

    return baseFields;
  };

  const formFields = getFormFields();

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    formFields.forEach(field => {
      if (field.required && !formData[field.id]?.trim()) {
        newErrors[field.id] = `${field.label} is required`;
      }
      
      // Email validation
      if (field.type === 'email' && formData[field.id] && !/\S+@\S+\.\S+/.test(formData[field.id])) {
        newErrors[field.id] = 'Please enter a valid email address';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] || '';
    const error = errors[field.id];

    return (
      <div key={field.id} className="space-y-1">
        <label className="block text-sm font-medium text-gray-300">
          {field.label} {field.required && <span className="text-red-400">*</span>}
        </label>
        
        <div className="relative">
          {field.icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {field.icon}
            </div>
          )}
          
          {field.type === 'textarea' ? (
            <textarea
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
              className={`w-full bg-[#2a2a2a] text-white placeholder:text-gray-500 rounded-md px-3 py-2 ${
                field.icon ? 'pl-10' : ''
              } focus:outline-none focus:ring-2 focus:ring-[#7c4a3f] border ${
                error ? 'border-red-400' : 'border-gray-600'
              }`}
            />
          ) : field.type === 'select' ? (
            <select
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={`w-full bg-[#2a2a2a] text-white rounded-md px-3 py-2 ${
                field.icon ? 'pl-10' : ''
              } focus:outline-none focus:ring-2 focus:ring-[#7c4a3f] border ${
                error ? 'border-red-400' : 'border-gray-600'
              }`}
            >
              <option value="">Select...</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full bg-[#2a2a2a] text-white placeholder:text-gray-500 rounded-md px-3 py-2 ${
                field.icon ? 'pl-10' : ''
              } focus:outline-none focus:ring-2 focus:ring-[#7c4a3f] border ${
                error ? 'border-red-400' : 'border-gray-600'
              }`}
            />
          )}
        </div>
        
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Complete Your Request</h2>
        <p className="text-gray-400 text-sm mb-1">Selected Policy: <span className="text-white font-medium">{policyTitle}</span></p>
        <p className="text-gray-500 text-xs">Fill out the information below to generate your form</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {formFields.map(renderField)}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-gray-700">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Options
          </button>
          
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-[#7c4a3f] hover:bg-[#92574a] text-white rounded-lg font-medium transition-colors"
          >
            Generate My Form
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}