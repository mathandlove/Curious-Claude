import type { ClaudeTextResponse } from '../shared/claudeTypes';
import type { Message } from '../shared/messageTypes';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

interface PolicyOption {
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

dotenv.config();

const ABSENCE_MODEL_STR = 'claude-sonnet-4-20250514';
const HAIKU_MODEL_STR = 'claude-3-haiku-20240307';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function generateAbsenceResponse(userRequest: string): Promise<ClaudeTextResponse> {
  try {
    const response = await anthropic.messages.create({
      model: ABSENCE_MODEL_STR,
      max_tokens: 512,
      tools: [
        {
          name: "GetCompanyPolicy",
          description: "Retrieves Google's internal policies for specific HR topics or employee requests",
          input_schema: {
            type: "object",
            properties: {
              request: {
                type: "string",
                description: "The policy topic or employee request to look up (e.g., 'parental leave', 'remote work accommodation', 'medical leave')"
              }
            },
            required: ["request"]
          }
        }
      ],
      system: `You are an AI assistant inside an HR leave management tool.
The user has just described an employee's situation (for example: "My wife is due Sept 28. I'll need time off starting Sept 20. I've been here 3 years and work in Colorado.").

Your job in this step:
    1.    Respond with a brief, empathetic acknowledgement.
    2.    Restate the user's goal in plain language so they can confirm you understood.
    3.    End with the question: "Does this sound right?"

Output format:
    •    Empathy sentence (short, human tone)
    •    Restated goal ("It sounds like your goal is…")
    •    Final confirmation ("Does this sound right?")

Keep the tone supportive, professional, and concise.
Do not recommend a legal action yet — this step is only about confirming understanding and building trust.`,
      messages: [
        {
          role: 'user',
          content: userRequest,
        },
      ],
    });

    // Handle tool calls
    if (response.content.some(content => content.type === 'tool_use')) {
      const toolUse = response.content.find(content => content.type === 'tool_use') as any;
      
      if (toolUse?.name === 'GetCompanyPolicy') {
        console.log('Claude is calling GetCompanyPolicy with:', toolUse.input);
        
        // Call our getCompanyPolicy function
        const policyResult = await getCompanyPolicy(toolUse.input.request);
        
        // Continue the conversation with the tool result
        const followUpResponse = await anthropic.messages.create({
          model: ABSENCE_MODEL_STR,
          max_tokens: 512,
          messages: [
            {
              role: 'user',
              content: userRequest,
            },
            {
              role: 'assistant',
              content: response.content,
            },
            {
              role: 'user',
              content: [
                {
                  type: 'tool_result',
                  tool_use_id: toolUse.id,
                  content: policyResult.content,
                }
              ],
            }
          ],
          tools: [
            {
              name: "GetCompanyPolicy",
              description: "Retrieves Google's internal policies for specific HR topics or employee requests",
              input_schema: {
                type: "object",
                properties: {
                  request: {
                    type: "string",
                    description: "The policy topic or employee request to look up"
                  }
                },
                required: ["request"]
              }
            }
          ],
          system: `You are an AI assistant inside an HR leave management tool.
The user has just described an employee's situation. You have access to company policies through the GetCompanyPolicy tool.

Your job in this step:
    1.    Respond with a brief, empathetic acknowledgement.
    2.    Restate the user's goal in plain language so they can confirm you understood.
    3.    End with the question: "Does this sound right?"

Output format:
    •    Empathy sentence (short, human tone)
    •    Restated goal ("It sounds like your goal is…")
    •    Final confirmation ("Does this sound right?")

Keep the tone supportive, professional, and concise.
Do not recommend a legal action yet — this step is only about confirming understanding and building trust.`,
        });

        const followUpContent = followUpResponse.content[0];
        const followUpText = followUpContent.type === 'text' ? followUpContent.text : '';
        return { content: followUpText.trim() };
      }
    }

    // Handle regular text response
    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';
    
    if (!text.trim()) {
      throw new Error('Empty response from Claude');
    }

    return { content: text.trim() };
  } catch (error) {
    console.error('Error generating absence response:', error);
    return { 
      content: 'I apologize, but I encountered an error while processing your request. Please try again or provide more details about your situation.' 
    };
  }
}

export async function generateCompanyPolicyResponse(userRequest: string): Promise<ClaudeTextResponse> {
  // Retry logic for overloaded API
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: HAIKU_MODEL_STR,
        max_tokens: 2048,
        system: `You are simulating the backend for a function called GetCompanyPolicy(request).

The request object will have:
- topic: a string like "medical leave", "parental leave", or "accommodations"
- company: optional string, e.g., "Google"
- location: optional string, e.g., "CA"
- tenureMonths: optional number, e.g., 36
- startDate: optional string in ISO format

Your job:
1. Return 1–4 realistic policy options that involve either completing the correct form or submitting the right request for the given topic.
2. For each option, return the following fields:
   - title: clear name of the policy/action (string)
   - actionType: either "form" or "request"
   - description: one-sentence summary of what it is and when it applies
   - forms: optional array of { name, id?, url? }
   - requestEndpoint: optional string if actionType is "request"
   - jurisdiction: "federal", "state", or "company"
   - confidence: "high", "medium", or "low"
   - citations: array of strings referencing relevant law/policy
   - rationale: short explanation of why this option is relevant

3. If a company is given, include at least one company-specific policy if relevant.
4. If a location is given, include state-specific options if relevant.
5. Output the result as a valid JSON array.

For now, assume the company is "Google" and the location is "CA" unless otherwise specified in the user request.`,
        messages: [
          {
            role: 'user',
            content: `Parse this employee request and return policy options: "${userRequest}"`,
          },
        ],
      });

      const content = response.content[0];
      const text = content.type === 'text' ? content.text : '';
      
      if (!text.trim()) {
        throw new Error('Empty response from Claude');
      }

      return { content: text.trim() };
    } catch (error: any) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      // If it's an overloaded error and we have attempts left, wait and retry
      if (error?.status === 529 && attempt < 3) {
        console.log(`Retrying in ${attempt * 2} seconds...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
        continue;
      }
      
      // If all attempts failed or it's a different error, return fallback
      console.error('All retry attempts failed');
      break;
    }
  }
  
  return { 
    content: 'I apologize, but I encountered an error while processing your request. Please try again or provide more details about your situation.' 
  };
}

export async function generateClarifyingQuestions(policyOptions: PolicyOption[]): Promise<ClaudeTextResponse> {
  try {
    const response = await anthropic.messages.create({
      model: ABSENCE_MODEL_STR,
      max_tokens: 1024,
      system: `You are an AI assistant inside an HR leave management tool.
The user has been shown a shortlist of possible policies they might use, each with fields like: title, description, jurisdiction, confidence, and eligibilityRequirements.

Your task:
    1.    Review the policy options and their eligibility requirements.
    2.    Generate a minimal set of clarifying questions (max 5) that would help determine the best fit for the user's situation.
    3.    Questions should be simple, plain-language, and answerable with Yes/No or multiple choice.
    4.    Prioritize questions that clearly distinguish between the options (if a question's answer would not change the choice, skip it).
    5.    If a question needs explanation, include a short one-sentence note.

Output format (JSON):
{
  "questions": [
    {
      "text": "Have you worked here for at least 12 months?",
      "type": "yes_no",
      "note": "Required for FMLA eligibility."
    }
  ]
}

Keep tone professional, supportive, and concise.
Do not recommend a policy yet — your job is only to generate the most useful questions for narrowing down the options.`,
      messages: [
        {
          role: 'user',
          content: `Here are the policy options to analyze: ${JSON.stringify(policyOptions, null, 2)}`,
        },
      ],
    });

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';
    
    if (!text.trim()) {
      throw new Error('Empty response from Claude');
    }

    return { content: text.trim() };
  } catch (error) {
    console.error('Error generating clarifying questions:', error);
    return { 
      content: JSON.stringify({
        questions: [
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
        ]
      })
    };
  }
}

export async function generatePolicyRecommendation(policyOptions: PolicyOption[], answers: Record<string, string>): Promise<ClaudeTextResponse> {
  try {
    console.log('generatePolicyRecommendation called with:', { 
      policiesCount: policyOptions.length, 
      answersKeys: Object.keys(answers),
      answers: answers 
    });

    const response = await anthropic.messages.create({
      model: ABSENCE_MODEL_STR,
      max_tokens: 1024,
      system: `You are an AI assistant inside an HR leave management tool.
You have:
    •    A shortlist of possible policy options, each with fields like: title, description, jurisdiction, confidence, eligibilityRequirements, and citations.
    •    The user's answers to a set of clarifying questions.

Your task:
    1.    Use the policy details and the user's answers to determine which single policy is the best fit for their situation.
    2.    If two policies can or should be used together (e.g., FMLA + State Disability Insurance), recommend them as a sequence and explain the order.
    3.    IMPORTANT: Company policies (especially Google's) are often more generous than federal minimums like FMLA. If a high-confidence company policy exists, it should generally be preferred over federal options.
    4.    Write a clear, plain-language justification for the choice, tying it directly to the facts from the answers.
    5.    Include any relevant forms or actions needed to proceed.
    6.    Provide citations if they are included with the policy data.

Output format (JSON):
{
  "recommendation": {
    "title": "Chosen policy title",
    "confidence": "high | medium | low",
    "keyBenefits": ["Copy the keyBenefits array from the selected policy", "if available"],
    "why": [
      "Reason 1 tied to the user's answers",
      "Reason 2 tied to eligibility requirements",
      "Reason 3 referencing a citation if available"
    ],
    "required_actions": [
      {
        "type": "form" | "request",
        "name": "Form or request name",
        "id": "Optional form id",
        "url": "Optional form link"
      }
    ],
    "sequence_notes": "If recommending multiple policies, explain the order and why.",
    "citations": ["Short citation text 1", "Short citation text 2"]
  }
}

Keep tone professional, supportive, and concise.
Only recommend policies from the provided shortlist.
Base the decision strictly on the user's answers and the eligibility requirements provided.`,
      messages: [
        {
          role: 'user',
          content: `Here are the policy options: ${JSON.stringify(policyOptions, null, 2)}

And here are the user's answers to clarifying questions: ${JSON.stringify(answers, null, 2)}

Please recommend the best policy option(s) based on this information.`,
        },
      ],
    });

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';
    
    console.log('Claude recommendation response:', text);
    
    if (!text.trim()) {
      throw new Error('Empty response from Claude');
    }

    return { content: text.trim() };
  } catch (error) {
    console.error('Error generating policy recommendation:', error);
    return { 
      content: JSON.stringify({
        recommendation: {
          title: "FMLA Medical Leave",
          confidence: "medium",
          keyBenefits: [
            "Up to 12 weeks unpaid leave",
            "Job protection guaranteed",
            "Health benefits maintained"
          ],
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
        }
      })
    };
  }
}

export async function getFederalAndStatePolicies(userRequest: string): Promise<ClaudeTextResponse> {
  try {
    console.log('getFederalAndStatePolicies called with request:', userRequest);

    const response = await anthropic.messages.create({
      model: HAIKU_MODEL_STR,
      max_tokens: 2048,
      system: `You are an AI assistant inside an HR leave management tool.

The user has requested: "${userRequest}"
Assume the user works in California.

Your job:
1. Generate federal and state policy options that apply to this request
2. Do NOT include company policies - only federal and state options
3. Return ONLY the JSON response - no additional text or explanations
4. Start your response directly with the JSON object

For each policy option, include:
- title: clear name of the policy/action
- actionType: "form" or "request"  
- description: one-sentence summary
- keyBenefits: array of main benefits
- eligibilityRequirements: array of specific requirements the employee must meet
- requestEndpoint: optional contact if actionType is "request"
- jurisdiction: "federal" or "state"
- confidence: "high", "medium", or "low" based on applicability
- citations: array of legal references
- rationale: explanation of why this option is relevant

Output format (JSON):
{
  "policyOptions": [
    {
      "title": "Policy Name",
      "actionType": "form" | "request",
      "description": "Brief description",
      "keyBenefits": ["Benefit 1", "Benefit 2"],
      "eligibilityRequirements": ["Requirement 1", "Requirement 2"],
      "requestEndpoint": "email@company.com",
      "jurisdiction": "federal" | "state",
      "confidence": "high" | "medium" | "low",
      "citations": ["Legal reference"],
      "rationale": "Why this applies"
    }
  ]
}`,
      messages: [
        {
          role: 'user',
          content: userRequest,
        },
      ],
    });

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';
    
    if (!text.trim()) {
      throw new Error('Empty response from Claude');
    }

    return { content: text.trim() };
  } catch (error) {
    console.error('Error getting federal and state policies:', error);
    return { 
      content: JSON.stringify({
        policyOptions: [
          {
            title: "Federal Family and Medical Leave Act (FMLA)",
            actionType: "form",
            description: "Federal law providing eligible employees with unpaid, job-protected leave for serious health conditions.",
            keyBenefits: ["Up to 12 weeks of unpaid leave per year", "Job protection", "Health benefits maintained"],
            eligibilityRequirements: ["Worked for employer for 12+ months", "Worked 1,250+ hours in past 12 months", "Employer has 50+ employees"],
            jurisdiction: "federal",
            confidence: "high",
            citations: ["29 U.S.C. § 2601"],
            rationale: "Fallback federal option"
          },
          {
            title: "California Family Rights Act (CFRA)",
            actionType: "form", 
            description: "California state law providing job-protected leave for serious health conditions.",
            keyBenefits: ["Up to 12 weeks of unpaid leave", "Broader coverage than FMLA"],
            eligibilityRequirements: ["Worked for employer for 12+ months", "Worked 1,250+ hours in past 12 months", "Employer has 5+ employees"],
            jurisdiction: "state",
            confidence: "high", 
            citations: ["California Government Code § 12945.2"],
            rationale: "Fallback state option"
          }
        ]
      })
    };
  }
}

export async function getAllPolicyOptions(userRequest: string): Promise<ClaudeTextResponse> {
  try {
    console.log('getAllPolicyOptions called with request:', userRequest);

    // Run both API calls in parallel for faster response
    console.log('Running federal/state and company policy calls in parallel...');
    const [federalStateResult, companyPolicyResult] = await Promise.all([
      getFederalAndStatePolicies(userRequest),
      getCompanyPolicy(userRequest)
    ]);
    
    let federalStatePolicies: PolicyOption[] = [];
    try {
      const parsedFederalState = JSON.parse(federalStateResult.content.replace(/```json\n?|\n?```/g, ''));
      federalStatePolicies = parsedFederalState.policyOptions || [];
      console.log('Successfully parsed', federalStatePolicies.length, 'federal/state policies');
    } catch (parseError) {
      console.error('Error parsing federal/state policies:', parseError);
    }

    let companyPolicies: PolicyOption[] = [];
    try {
      const parsedCompany = JSON.parse(companyPolicyResult.content.replace(/```json\n?|\n?```/g, ''));
      companyPolicies = [parsedCompany]; // Single company policy
      console.log('Successfully parsed company policy');
    } catch (parseError) {
      console.error('Error parsing company policy:', parseError);
    }

    // Combine all policies (company policy first, then federal/state)
    const allPolicyOptions = [...companyPolicies, ...federalStatePolicies];
    
    const response = {
      policyOptions: allPolicyOptions
    };
    
    console.log('Successfully combined all policies:', allPolicyOptions.length, 'total options');
    return { content: JSON.stringify(response) };

  } catch (error) {
    console.error('Error getting all policy options:', error);
    return { 
      content: JSON.stringify({
        policyOptions: [
          {
            title: "Federal Family and Medical Leave Act (FMLA)",
            actionType: "form",
            description: "Federal family and medical leave - eligibility depends on specific situation",
            keyBenefits: ["Up to 12 weeks unpaid leave", "Job protection if eligible", "Health benefits maintained"],
            eligibilityRequirements: ["Worked for employer for 12+ months", "Worked 1,250+ hours in past 12 months", "Employer has 50+ employees"],
            jurisdiction: "federal",
            confidence: "medium",
            citations: ["29 U.S.C. § 2601"],
            rationale: "Fallback option due to system error"
          }
        ]
      })
    };
  }
}

export async function getCompanyPolicy(request: string): Promise<ClaudeTextResponse> {
  try {
    console.log('getCompanyPolicy called with request:', request);

    const response = await anthropic.messages.create({
      model: ABSENCE_MODEL_STR,
      max_tokens: 1024,
      system: `You are an AI assistant with access to Google's internal employee handbook and HR policies.

When asked about Google's internal policy on a specific topic, you should:
1. FIRST, analyze the request to determine the correct type of leave:
   - Bereavement/Death: Use "Google Bereavement Leave Policy" (NOT medical leave)
   - Medical conditions: Use "Google Medical Leave Policy" 
   - Pregnancy/childbirth: Use "Google Parental Leave Policy"
   - Family care: Use "Google Family Care Leave Policy"
2. Reference Google's employee handbook and internal HR policies
3. Provide specific policy details, eligibility requirements, and procedures
4. Return the information in the exact JSON format specified below
5. Include relevant forms, submission processes, and contact information
6. Google is known for having very generous employee benefits that often exceed federal and state minimums
7. Set confidence to "high" for well-established Google policies like medical leave, parental leave, bereavement leave
8. Emphasize how Google's policies are typically more generous than federal options like FMLA

Output format (JSON):
{
  "title": "Policy name (e.g., Google Medical Leave Policy)",
  "actionType": "form" | "request",
  "description": "One-sentence summary of the policy and when it applies",
  "keyBenefits": [
    "Primary benefit (e.g., '12-18 weeks paid leave')",
    "Secondary benefit (e.g., 'Full salary continuation')",
    "Additional benefit (e.g., 'Gradual return options')"
  ],
  "eligibilityRequirements": [
    "Primary requirement (e.g., 'Employee must be full-time')",
    "Secondary requirement (e.g., 'Worked for Google for 90+ days')",
    "Additional requirement (e.g., 'Manager approval required')"
  ],
  "requestEndpoint": "Optional email/contact for requests",
  "jurisdiction": "company",
  "confidence": "high" | "medium" | "low",
  "citations": ["Employee Handbook Section X.X", "HR Policy Manual YYYY"],
  "rationale": "Brief explanation of why this policy applies to the request"
}

Always set jurisdiction to "company" since this is internal Google policy.
Keep tone professional and supportive.`,
      messages: [
        {
          role: 'user',
          content: `What is Google's internal policy about ${request}? Please refer to the employee handbook.`,
        },
      ],
    });

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';
    
    console.log('Claude company policy response:', text);
    
    if (!text.trim()) {
      throw new Error('Empty response from Claude');
    }

    return { content: text.trim() };
  } catch (error) {
    console.error('Error getting company policy:', error);
    return { 
      content: JSON.stringify({
        title: "Company Leave Policy",
        actionType: "request",
        description: "Internal company policy for leave requests",
        keyBenefits: [
          "Company-specific leave benefits",
          "Enhanced job protection",
          "HR support throughout process"
        ],
        eligibilityRequirements: [
          "Must be a current Google employee",
          "Manager approval required",
          "HR consultation recommended"
        ],
        requestEndpoint: "hr@google.com",
        jurisdiction: "company",
        confidence: "medium",
        citations: ["Employee Handbook Section 4.0"],
        rationale: "Fallback company policy due to system error"
      })
    };
  }
}

export async function generateAbsenceConversationResponse(conversation: Message[]): Promise<ClaudeTextResponse> {
  try {
    // Check if the last user message is "No" or similar
    const lastUserMessage = conversation
      .filter(msg => msg.type === 'user')
      .pop();
    
    if (lastUserMessage && lastUserMessage.content.toLowerCase().trim().includes('no')) {
      return {
        content: "I haven't programmed this tree. Please restart."
      };
    }

    // Check if user confirmed with "Yes" or similar
    if (lastUserMessage && (
      lastUserMessage.content.toLowerCase().trim().includes('yes') || 
      lastUserMessage.content.toLowerCase().trim().includes('correct') ||
      lastUserMessage.content.toLowerCase().trim().includes('right')
    )) {
      // Convert to Anthropic message format for step 2 (policy options)
      const anthropicMessages = conversation
        .filter(msg => !msg.isThinking && !msg.error && msg.content.trim())
        .map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));

      const response = await anthropic.messages.create({
        model: ABSENCE_MODEL_STR,
        max_tokens: 2048,
        system: `You are simulating the backend for a function called GetCompanyPolicy(request).

The request object will have:
- topic: a string like "medical leave", "parental leave", or "accommodations"
- company: optional string, e.g., "Google"
- location: optional string, e.g., "CA"
- tenureMonths: optional number, e.g., 36
- startDate: optional string in ISO format

Your job:
1. Return 1–4 realistic policy options that involve either completing the correct form or submitting the right request for the given topic.
2. For each option, return the following fields:
   - title: clear name of the policy/action (string)
   - actionType: either "form" or "request"
   - description: one-sentence summary of what it is and when it applies
   - forms: optional array of { name, id?, url? }
   - requestEndpoint: optional string if actionType is "request"
   - jurisdiction: "federal", "state", or "company"
   - confidence: "high", "medium", or "low"
   - citations: array of strings referencing relevant law/policy
   - rationale: short explanation of why this option is relevant

3. If a company is given, include at least one company-specific policy if relevant.
4. If a location is given, include state-specific options if relevant.
5. Output the result as a valid JSON array.

For now, assume the company is "Google" and the location is "CA" unless otherwise specified in the user request.`,
        messages: anthropicMessages,
      });

      const content = response.content[0];
      const text = content.type === 'text' ? content.text : '';
      
      if (!text.trim()) {
        throw new Error('Empty response from Claude');
      }

      return { content: text.trim() };
    }

    // Default response for unclear input
    return {
      content: "I'm not sure if you're confirming or not. Please respond with 'Yes' if I understood correctly, or 'No' if I need to clarify something."
    };

  } catch (error) {
    console.error('Error generating absence conversation response:', error);
    return { 
      content: 'I apologize, but I encountered an error while processing your response. Please try again.' 
    };
  }
}