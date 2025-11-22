# AI Features Testing Guide 🤖

## ✅ Setup Complete!

All AI features are now installed and configured:
- ✅ OpenAI package installed (`openai` v4.x)
- ✅ API key configured in `.env`
- ✅ Model updated to `gpt-4o-mini` (latest, faster, cheaper)
- ✅ Mock fallback system ready (works without API key)

---

## 🧪 How to Test AI Features

### 1. **Task Suggestions** (Auto-generate task details)

**Where:** `/dashboard/tasks` → Click "+ New Task"

**How to test:**
1. Type a task title like: "Build user authentication system"
2. Wait 1 second
3. See AI suggestions appear in a blue banner
4. Click **"Apply"** to auto-fill the form

**What AI generates:**
- Description (detailed explanation)
- Priority (based on keywords: urgent, critical, etc.)
- Estimated time (in minutes)
- Due date (if mentioned in title)
- Tags (relevant keywords)

**Test cases:**
```
✓ "Fix critical login bug ASAP" → HIGH priority, urgent tag
✓ "Design homepage mockup" → MEDIUM priority, design tag
✓ "Update documentation" → LOW priority, docs tag
✓ "Team meeting tomorrow at 2pm" → Due date auto-filled
```

---

### 2. **Natural Language Parsing** (Parse complex task descriptions)

**API:** `POST /api/ai/parse-task`

**Test via CreateTaskDialog:**
- Type complex sentences and see how AI extracts:
  - Title
  - Description
  - Priority
  - Due date
  - Assignee

**Example:**
```
Input: "Need to fix the critical payment bug by Friday, assign to John, high priority"

Output:
- Title: Fix critical payment bug
- Priority: HIGH
- Due date: Next Friday
- Assignee: John
```

---

### 3. **Title Enhancement** (Improve task titles)

**Where:** CreateTaskDialog → Click lightbulb icon 💡

**How to test:**
1. Type a vague title: "fix stuff"
2. Click the enhance button
3. See improved title like: "Debug and resolve system issues"

**Test cases:**
```
✓ "fix stuff" → "Debug and resolve system issues"
✓ "meeting" → "Schedule team coordination meeting"
✓ "bug" → "Investigate and fix reported bug"
```

---

### 4. **Duplicate Detection** (Find similar tasks)

**Where:** Automatic when creating tasks

**How to test:**
1. Create a task: "Implement user authentication"
2. Try to create another: "Build authentication system"
3. See warning: ⚠️ "Similar task exists: Implement user authentication"

**What AI does:**
- Compares semantic meaning (not just keywords)
- Prevents duplicate work
- Shows existing similar tasks

---

### 5. **Daily Summary** (AI-generated productivity report)

**API:** `GET /api/ai/daily-summary?userId=<id>`

**Test in browser console:**
```javascript
fetch('/api/ai/daily-summary?userId=YOUR_USER_ID')
  .then(r => r.json())
  .then(console.log)
```

**What AI generates:**
- Summary of tasks completed today
- Progress analysis
- Suggestions for tomorrow
- Productivity insights

---

### 6. **Smart Tagging** (Auto-suggest relevant tags)

**API:** `POST /api/ai/suggest-tags`

**Integrated in CreateTaskDialog:**
- Type task title/description
- AI suggests relevant tags
- Click to apply

**Examples:**
```
"Fix login API bug" → ["backend", "api", "bug", "authentication"]
"Design landing page" → ["frontend", "design", "ui", "marketing"]
"Write unit tests" → ["testing", "development", "quality"]
```

---

## 🎭 Mock Mode (No API Key Required)

If `OPENAI_API_KEY` is not set, AI features fall back to **smart keyword detection**:

- **HIGH priority**: urgent, critical, asap, emergency, blocker
- **MEDIUM priority**: important, should, need
- **Design tags**: design, ui, ux, mockup, wireframe
- **Dev tags**: code, implement, build, develop, create
- **Bug tags**: fix, bug, issue, error, problem
- **Time estimates**: Simple: 30 min, Medium: 120 min, Complex: 240 min

**Mock mode is perfect for:**
- Development without API costs
- Demos and testing
- Offline work

---

## 📊 Expected Behavior

### ✅ Success Indicators:
- Blue suggestion banner appears within 1-2 seconds
- "Apply" button fills form fields correctly
- Similar tasks warning shows relevant matches
- Enhanced titles are more specific and actionable

### ⚠️ If AI Fails:
- Mock fallback activates automatically
- You'll see keyword-based suggestions
- No errors, just simpler suggestions

---

## 🔑 API Key Notes

Your current key: `sk-proj-X2Tr...1uAA` (configured ✅)

**Model used:** `gpt-4o-mini`
- Faster than GPT-4 Turbo
- 60% cheaper
- Perfect for task suggestions
- Better structured output

**Cost estimate:**
- ~$0.0001 per task suggestion
- 10,000 tasks = ~$1
- Very affordable for production use

---

## 🐛 Troubleshooting

### AI suggestions not appearing?
1. Check browser console for errors
2. Verify API key in `.env`: `OPENAI_API_KEY=sk-...`
3. Restart dev server: `npm run dev`
4. Test mock mode by removing API key temporarily

### "Model not found" errors?
✅ **FIXED!** Updated from `gpt-4-turbo-preview` → `gpt-4o-mini`

### Slow responses?
- Normal: AI takes 1-3 seconds
- Use mock mode for instant responses
- Consider caching common suggestions

---

## 🚀 Next Steps

1. **Test each feature** using the guide above
2. **Try edge cases** (empty titles, very long descriptions, special characters)
3. **Check mock fallback** (temporarily remove API key)
4. **Monitor costs** in OpenAI dashboard
5. **Customize prompts** in `src/lib/ai.ts` for your use case

---

## 📝 Files Modified

- ✅ `src/lib/ai.ts` - Core AI service with 6 functions
- ✅ `src/app/api/ai/*/route.ts` - 5 API endpoints
- ✅ `src/components/tasks/CreateTaskDialog.tsx` - UI integration
- ✅ `.env` - API key configuration
- ✅ `package.json` - OpenAI dependency added

---

## 💡 Pro Tips

1. **Use descriptive titles** - AI works better with context
2. **Include keywords** - Priority words, time estimates, dates
3. **Test mock mode first** - Verify UI before using API
4. **Customize prompts** - Edit `src/lib/ai.ts` to match your workflow
5. **Monitor usage** - Check OpenAI dashboard regularly

---

**All AI features are ready! Start testing at:** `/dashboard/tasks` 🎉
