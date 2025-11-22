import OpenAI from 'openai';

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Check if AI is enabled
const isAIEnabled = () => !!process.env.OPENAI_API_KEY;

export interface TaskSuggestion {
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedMinutes: number;
  tags: string[];
  suggestedDueDate?: Date;
}

export interface NaturalLanguageTask {
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: Date;
  tags?: string[];
}

/**
 * Generate smart suggestions for a task based on its title
 */
export async function generateTaskSuggestions(
  title: string,
  context?: {
    projectName?: string;
    existingTasks?: string[];
  }
): Promise<TaskSuggestion> {
  // Return mock suggestions if API key is not configured
  if (!isAIEnabled()) {
    console.warn('⚠️ OpenAI API key not configured. Using mock suggestions. Add OPENAI_API_KEY to .env file.');
    return generateMockSuggestions(title, context);
  }

  try {
    const prompt = `You are a helpful task management assistant. Given a task title, provide intelligent suggestions.

Task Title: "${title}"
${context?.projectName ? `Project: ${context.projectName}` : ''}
${context?.existingTasks?.length ? `Related Tasks: ${context.existingTasks.join(', ')}` : ''}

Provide suggestions in JSON format:
{
  "description": "A clear, concise description (2-3 sentences)",
  "priority": "LOW|MEDIUM|HIGH|URGENT",
  "estimatedMinutes": <number>,
  "tags": ["tag1", "tag2"],
  "suggestedDueDate": "YYYY-MM-DD or null"
}

Rules:
- Priority based on urgency keywords (urgent, asap, critical = HIGH/URGENT)
- Estimate time realistically (simple tasks: 15-60 min, complex: 120-480 min)
- Suggest 2-4 relevant tags
- Only suggest due date if implied in title
- Description should expand on the title with actionable details`;

    const completion = await openai!.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a task management AI that provides structured suggestions in JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    return {
      description: result.description || '',
      priority: result.priority || 'MEDIUM',
      estimatedMinutes: result.estimatedMinutes || 60,
      tags: result.tags || [],
      suggestedDueDate: result.suggestedDueDate ? new Date(result.suggestedDueDate) : undefined,
    };
  } catch (error) {
    console.error('Error generating task suggestions:', error);
    // Fallback to mock suggestions on error
    return generateMockSuggestions(title, context);
  }
}

/**
 * Parse natural language input into structured task data
 */
export async function parseNaturalLanguageTask(input: string): Promise<NaturalLanguageTask> {
  try {
    const prompt = `Parse this natural language task input into structured data:

Input: "${input}"

Extract and return JSON:
{
  "title": "Clear, concise task title",
  "description": "Optional expanded description",
  "priority": "LOW|MEDIUM|HIGH|URGENT",
  "dueDate": "YYYY-MM-DD or null",
  "tags": ["tag1", "tag2"]
}

Examples:
- "Fix login bug urgently by tomorrow" → HIGH priority, due tomorrow
- "Add dark mode feature next week" → MEDIUM priority, due in 7 days
- "Review documentation when you have time" → LOW priority, no due date
- "Critical: deploy to production by Friday" → URGENT priority, due Friday

Extract priority from keywords: urgent/asap/critical=URGENT, important/high=HIGH, normal=MEDIUM, low/later=LOW
Extract dates from: today, tomorrow, Friday, next week, Jan 15, etc.`;

    const completion = await openai!.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a natural language parser for task management. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 400,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    return {
      title: result.title || input,
      description: result.description,
      priority: result.priority || 'MEDIUM',
      dueDate: result.dueDate ? new Date(result.dueDate) : undefined,
      tags: result.tags || [],
    };
  } catch (error) {
    console.error('Error parsing natural language task:', error);
    // Return input as title on error
    return {
      title: input,
      priority: 'MEDIUM',
    };
  }
}

/**
 * Enhance a task title to make it more clear and actionable
 */
export async function enhanceTaskTitle(title: string): Promise<string> {
  try {
    const prompt = `Improve this task title to be clear, concise, and actionable:

Original: "${title}"

Rules:
- Start with an action verb (Fix, Add, Update, Create, Review, etc.)
- Be specific and clear
- Keep it under 60 characters
- No vague words like "stuff", "things", "something"
- Return ONLY the improved title, no explanation

Examples:
- "bug" → "Fix critical bug in login system"
- "thing" → "Review and update documentation"
- "work on feature" → "Implement user profile feature"`;

    const completion = await openai!.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You improve task titles. Return only the improved title, nothing else.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 50,
    });

    const enhanced = completion.choices[0].message.content?.trim() || title;
    return enhanced.replace(/^["']|["']$/g, ''); // Remove quotes if present
  } catch (error) {
    console.error('Error enhancing task title:', error);
    return title;
  }
}

/**
 * Find similar or duplicate tasks
 */
export async function findSimilarTasks(
  title: string,
  existingTasks: Array<{ id: string; title: string; description?: string }>
): Promise<Array<{ id: string; similarity: number; reason: string }>> {
  try {
    const prompt = `Compare this task with existing tasks and identify similar or duplicate ones:

New Task: "${title}"

Existing Tasks:
${existingTasks.map((t, i) => `${i + 1}. [${t.id}] ${t.title}${t.description ? ` - ${t.description}` : ''}`).join('\n')}

Return JSON array of similar tasks (similarity > 60%):
[
  {
    "id": "task-id",
    "similarity": <0-100>,
    "reason": "Brief explanation of similarity"
  }
]

Return empty array [] if no similar tasks found.`;

    const completion = await openai!.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You detect duplicate or similar tasks. Return only valid JSON array.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 500,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{"tasks":[]}');
    return result.tasks || result || [];
  } catch (error) {
    console.error('Error finding similar tasks:', error);
    return [];
  }
}

/**
 * Generate a daily summary of tasks
 */
export async function generateDailySummary(tasks: Array<{
  title: string;
  status: string;
  priority: string;
  dueDate?: Date;
}>): Promise<string> {
  try {
    const prompt = `Generate a concise daily summary for these tasks:

${tasks.map((t, i) => `${i + 1}. [${t.status}] ${t.title} (${t.priority})${t.dueDate ? ` - Due: ${t.dueDate.toLocaleDateString()}` : ''}`).join('\n')}

Create a brief summary (3-5 sentences) highlighting:
- Tasks completed today
- Urgent tasks needing attention
- Overdue items
- Overall progress

Keep it motivating and actionable.`;

    const completion = await openai!.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You create motivating daily task summaries.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return completion.choices[0].message.content || 'No summary available.';
  } catch (error) {
    console.error('Error generating daily summary:', error);
    return 'Unable to generate summary at this time.';
  }
}

/**
 * Smart tag suggestions based on task content
 */
export async function suggestTags(
  title: string,
  description?: string,
  projectName?: string
): Promise<string[]> {
  try {
    const prompt = `Suggest 3-5 relevant tags for this task:

Title: "${title}"
${description ? `Description: "${description}"` : ''}
${projectName ? `Project: "${projectName}"` : ''}

Return JSON array of lowercase tags:
["tag1", "tag2", "tag3"]

Use categories like: frontend, backend, bug, feature, urgent, documentation, testing, design, api, database, security, performance, etc.`;

    const completion = await openai!.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You suggest relevant tags for tasks. Return only JSON array of strings.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
      max_tokens: 100,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{"tags":[]}');
    return result.tags || result || [];
  } catch (error) {
    console.error('Error suggesting tags:', error);
    return [];
  }
}

export const aiService = {
  generateTaskSuggestions,
  parseNaturalLanguageTask,
  enhanceTaskTitle,
  findSimilarTasks,
  generateDailySummary,
  suggestTags,
};

/**
 * Generate mock suggestions when API key is not configured
 */
function generateMockSuggestions(
  title: string,
  context?: {
    projectName?: string;
    existingTasks?: string[];
  }
): TaskSuggestion {
  const lowerTitle = title.toLowerCase();
  
  // Determine priority based on keywords
  let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';
  let suggestedDueDate: Date | undefined = undefined;
  
  if (lowerTitle.includes('urgent') || lowerTitle.includes('asap') || lowerTitle.includes('critical') || lowerTitle.includes('hotfix')) {
    priority = 'URGENT';
    suggestedDueDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
  } else if (lowerTitle.includes('high') || lowerTitle.includes('important') || lowerTitle.includes('priority')) {
    priority = 'HIGH';
    suggestedDueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
  } else if (lowerTitle.includes('low') || lowerTitle.includes('minor') || lowerTitle.includes('someday') || lowerTitle.includes('nice to have')) {
    priority = 'LOW';
  }
  
  // Generate description
  let description = `Complete the task: ${title}.`;
  if (context?.projectName) {
    description += ` This is part of the ${context.projectName} project.`;
  }
  description += ' Review requirements and implement necessary changes.';
  
  // Estimate time based on keywords
  let estimatedMinutes = 60;
  if (lowerTitle.includes('quick') || lowerTitle.includes('small') || lowerTitle.includes('minor')) {
    estimatedMinutes = 30;
  } else if (lowerTitle.includes('large') || lowerTitle.includes('complex') || lowerTitle.includes('major') || lowerTitle.includes('implement')) {
    estimatedMinutes = 240;
  }
  
  // Generate tags based on keywords
  const tags: string[] = [];
  if (lowerTitle.includes('bug') || lowerTitle.includes('fix') || lowerTitle.includes('error')) tags.push('bug');
  if (lowerTitle.includes('feature') || lowerTitle.includes('add') || lowerTitle.includes('new')) tags.push('feature');
  if (lowerTitle.includes('test')) tags.push('testing');
  if (lowerTitle.includes('doc')) tags.push('documentation');
  if (lowerTitle.includes('design') || lowerTitle.includes('ui') || lowerTitle.includes('ux')) tags.push('design');
  if (lowerTitle.includes('refactor')) tags.push('refactoring');
  if (lowerTitle.includes('api')) tags.push('api');
  if (lowerTitle.includes('database') || lowerTitle.includes('db')) tags.push('database');
  if (lowerTitle.includes('frontend') || lowerTitle.includes('ui')) tags.push('frontend');
  if (lowerTitle.includes('backend') || lowerTitle.includes('server')) tags.push('backend');
  if (lowerTitle.includes('performance') || lowerTitle.includes('optimize')) tags.push('performance');
  if (lowerTitle.includes('security')) tags.push('security');
  
  // If no tags matched, add generic ones
  if (tags.length === 0) {
    tags.push('task');
    if (context?.projectName) {
      tags.push(context.projectName.toLowerCase().replace(/\s+/g, '-'));
    }
  }
  
  return {
    description,
    priority,
    estimatedMinutes,
    tags: tags.slice(0, 4), // Max 4 tags
    suggestedDueDate,
  };
}
