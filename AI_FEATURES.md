# AI-Powered Task Assistant

## Overview
The Task Tracker includes AI-powered features to help you manage tasks more efficiently. The AI can:

- 🤖 **Smart Suggestions**: Get intelligent suggestions for task descriptions, priorities, and due dates based on the task title
- 🏷️ **Auto-Tagging**: Automatically suggest relevant tags for tasks
- 🔍 **Duplicate Detection**: Find similar existing tasks to avoid duplicates
- ✨ **Title Enhancement**: Improve vague task titles with action verbs
- 📊 **Daily Summaries**: Get AI-generated summaries of your daily progress
- 💬 **Natural Language**: Create tasks using natural language like "Fix urgent bug by Friday"

## Setup

### Option 1: Full AI Features (with OpenAI)
1. Get an API key from https://platform.openai.com/api-keys
2. Add to your `.env` file:
   ```bash
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Restart your development server

### Option 2: Mock AI (without API key)
The app works perfectly without an OpenAI API key! It will use intelligent keyword-based suggestions:

- **No API key needed** - Works out of the box
- **No API costs** - Completely free
- **Privacy** - No data sent to external services
- **Smart logic** - Uses keyword detection and pattern matching

**Mock features:**
- Priority detection (urgent, high, low keywords)
- Time estimation (quick, complex keywords)
- Tag suggestion (bug, feature, design keywords)
- Due date inference (urgent → tomorrow, high → 3 days)

## How It Works

### Smart Task Suggestions
When you create a task, the AI analyzes the title and provides:

**Example Input:** "Fix critical login bug urgently"

**With OpenAI API:**
```json
{
  "description": "Investigate and resolve the critical bug affecting user login functionality. This requires immediate attention to ensure users can access their accounts.",
  "priority": "URGENT",
  "estimatedMinutes": 120,
  "tags": ["bug", "critical", "backend", "authentication"],
  "suggestedDueDate": "2024-11-23" // Tomorrow
}
```

**Mock Mode (no API key):**
```json
{
  "description": "Complete the task: Fix critical login bug urgently. Review requirements and implement necessary changes.",
  "priority": "URGENT",
  "estimatedMinutes": 60,
  "tags": ["bug", "urgent"],
  "suggestedDueDate": "2024-11-23" // Tomorrow (detected from "urgently")
}
```

### Apply Button
Click the "Apply" button in the suggestions banner to automatically fill:
- Task description
- Priority level
- Estimated due date

### Similar Task Detection
The system checks for duplicate tasks:

**With OpenAI:** Uses semantic similarity (understands meaning)
- "Fix login error" matches "Resolve sign-in issue" (85% similar)

**Mock Mode:** Uses exact title matching
- Finds tasks with identical or very similar titles

## Usage Example

1. **Open Create Task Dialog**
   - Click "New Task" button in the tasks page

2. **Type a Task Title**
   - Example: "Implement user profile page urgently"
   - Wait 1 second (debounced)

3. **Review AI Suggestions**
   - A banner appears with AI-generated suggestions
   - See similar existing tasks (if any)

4. **Apply Suggestions (Optional)**
   - Click "Apply" to auto-fill description, priority, due date
   - Or manually enter your own details

5. **Save Task**
   - Click "Create Task"

## API Endpoints

All AI features are available via REST endpoints:

### POST `/api/ai/task-suggestions`
Generate smart suggestions for a task.
```bash
curl -X POST http://localhost:3000/api/ai/task-suggestions \
  -H "Content-Type: application/json" \
  -d '{"title": "Fix critical bug", "projectId": "123"}'
```

### POST `/api/ai/parse-task`
Parse natural language into structured task data.
```bash
curl -X POST http://localhost:3000/api/ai/parse-task \
  -H "Content-Type: application/json" \
  -d '{"input": "Fix urgent bug by Friday"}'
```

### POST `/api/ai/enhance-title`
Improve a vague task title.
```bash
curl -X POST http://localhost:3000/api/ai/enhance-title \
  -H "Content-Type: application/json" \
  -d '{"title": "do stuff"}'
```

### POST `/api/ai/find-similar`
Find similar existing tasks.
```bash
curl -X POST http://localhost:3000/api/ai/find-similar \
  -H "Content-Type: application/json" \
  -d '{"title": "Fix login error", "projectId": "123"}'
```

### GET `/api/ai/daily-summary`
Get an AI-generated summary of today's tasks.
```bash
curl http://localhost:3000/api/ai/daily-summary
```

## Mock Mode Details

The mock system uses intelligent keyword detection:

### Priority Keywords
- **URGENT**: urgent, asap, critical, hotfix
- **HIGH**: high, important, priority
- **LOW**: low, minor, someday, nice to have
- **MEDIUM**: (default)

### Time Estimation Keywords
- **30 minutes**: quick, small, minor
- **240 minutes**: large, complex, major, implement
- **60 minutes**: (default)

### Tag Keywords
Automatically detects and suggests tags:
- `bug`: bug, fix, error
- `feature`: feature, add, new
- `testing`: test
- `documentation`: doc
- `design`: design, ui, ux
- `refactoring`: refactor
- `api`: api
- `database`: database, db
- `frontend`: frontend, ui
- `backend`: backend, server
- `performance`: performance, optimize
- `security`: security

### Due Date Inference
- **Urgent keywords** → Tomorrow
- **High priority keywords** → 3 days from now
- **No keywords** → No suggested due date

## Cost & Performance

### With OpenAI API
- **Model**: GPT-4 Turbo Preview
- **Average cost**: ~$0.01-0.03 per task creation
- **Response time**: 1-3 seconds
- **Quality**: High-quality, context-aware suggestions

### Mock Mode (No API)
- **Cost**: $0 (completely free)
- **Response time**: Instant (<10ms)
- **Quality**: Good for common use cases

## Best Practices

1. **Use descriptive titles**: Better titles = better suggestions
   - ❌ "do stuff"
   - ✅ "Implement user authentication with OAuth"

2. **Include keywords**: Help the system understand priority
   - "urgent", "high priority", "quick fix"

3. **Review suggestions**: Always review before applying
   - AI suggestions are helpful but not always perfect

4. **Combine manual + AI**: Use AI for inspiration, customize as needed

5. **Try both modes**: Test with and without API key to see what works for you

## Troubleshooting

### AI suggestions not appearing?
1. Check browser console for errors
2. Verify the title is at least 6 characters
3. Wait 1 second after typing (debounced)

### Getting 401 errors in console?
- This is normal without an API key
- The system automatically falls back to mock mode
- Add `OPENAI_API_KEY` to `.env` to enable full AI

### Apply button not working?
1. Open browser console (F12)
2. Click "Apply" button
3. Check for logs showing what's being applied
4. Report the console output if issues persist

### Mock suggestions not helpful?
- Consider adding an OpenAI API key for better suggestions
- Or manually adjust the suggested values

## Future Enhancements

Planned AI features:
- 🎯 **Task Prioritization**: AI-powered task ranking
- 📅 **Smart Scheduling**: Optimal task scheduling suggestions
- 🤝 **Team Insights**: Team productivity analysis
- 🔮 **Predictive Analytics**: Estimate project completion dates
- 💡 **Learning System**: Improve suggestions based on your patterns

## Privacy & Security

### Mock Mode (no API key)
- **No external API calls**: All processing happens locally
- **No data sharing**: Your task data never leaves your server
- **Complete privacy**: Perfect for sensitive projects

### OpenAI Mode (with API key)
- **Data sent to OpenAI**: Task titles and descriptions
- **No storage**: OpenAI doesn't store your data (per their API policy)
- **Encrypted**: All API calls use HTTPS
- **API key security**: Store in `.env`, never commit to git

## Support

For issues or questions:
1. Check browser console for errors
2. Review this documentation
3. Check the `AI_ASSISTANCE_IMPLEMENTATION.md` file for technical details
4. File an issue with console logs if problems persist
