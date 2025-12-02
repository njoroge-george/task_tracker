# Quick Start Guide - Enhanced Task Tracker

## 🚀 Getting Started

### 1. Install Dependencies (if not done)
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
```
http://localhost:3000
```

## ✨ What's New

### Enhanced Sidebar
- **Colored Icons**: Each menu item has its own color
- **Logout Button**: Located at the bottom of sidebar
- **Collapsible**: Click arrow button to collapse/expand (desktop)
- **Mobile Support**: Floating menu button on mobile

### Playground Features

#### 1. Templates (📚)
**Click "📚 Templates" button to access:**
- **Beginner**: Loops, Functions, Arrays, Objects
- **API**: Fetch GET/POST, Axios examples
- **Logic**: Map, Filter, Reduce, Sorting
- **HTML/CSS**: Cards, Navbar, Forms, Grid

#### 2. Emmet Shortcuts
**Type and press Tab:**

**HTML:**
```
div>h2>p*3        → Full nested structure
!                 → HTML5 skeleton
link:css          → Stylesheet link
btn               → Button element
```

**CSS:**
```
df                → display: flex;
dg                → display: grid;
jcc               → justify-content: center;
aic               → align-items: center;
p20               → padding: 20px;
m10               → margin: 10px;
w100              → width: 100px;
```

**JavaScript:**
```
cl                → console.log()
fn                → function name() {}
afn               → const name = () => {}
try               → try-catch block
```

**Python:**
```
pr                → print()
def               → def function():
ifmain            → if __name__ == "__main__":
```

#### 3. AI Helper (🤖)
**Click "🤖 AI Helper" for:**
- **Generate**: Create code from description
- **Explain**: Understand your code
- **Fix**: Find and fix errors
- **Optimize**: Improve performance

**Works WITHOUT API key!** (Uses smart mocks)
**Want real AI?** Add `OPENAI_API_KEY` to `.env`

#### 4. Security Features 🔒
**Automatic Protection:**
- ⚡ 5-second timeout for JavaScript
- ⚡ 10-second timeout for Python
- 🛡️ Blocks dangerous code: `eval()`, `setTimeout()`, etc.
- 🛡️ Warns about infinite loops
- 🛡️ Rate limiting (10 executions/minute)

**Try it yourself:**
```javascript
// This will be blocked:
eval('alert("test")');

// This will timeout:
while(true) { }

// This will warn you:
while(true) {
  // no break statement
}
```

#### 5. Version History (📜)
- Auto-saves every change
- Restore previous versions
- Compare differences

#### 6. Terminal (💻)
- Real-time console output
- Error highlighting
- Warning messages
- Clear console button

## 📝 Common Tasks

### Create New Snippet
1. Click "New" button
2. Write your code
3. Click "Save" or press Cmd/Ctrl+S
4. Auto-saves as you type

### Use a Template
1. Click "📚 Templates"
2. Select category tab
3. Click template to load it

### Get AI Help
1. Write some code
2. Click "🤖 AI Helper"
3. Choose mode (Generate/Explain/Fix/Optimize)
4. Type prompt or use quick prompts
5. Click "Apply Code" to use suggestion

### Use Emmet
1. Type abbreviation: `div>h2>p*3`
2. Press **Tab** (not Enter!)
3. Expands to full HTML

### Share Your Work
1. Make sure snippet is saved
2. Toggle "Public" switch ON
3. Click "Share" button
4. Link copied to clipboard

## 🎨 Dashboard Features

### Header
- Personalized greeting
- Current date
- Quick action buttons

### KPI Metrics
- Total Tasks
- In Progress
- Completed
- Overdue
- To Do
- In Review

### Quick Actions
- Add Task button
- New Project button
- Global search (coming soon)
- Notifications icon

### Task Overview
- Today's tasks
- Overdue tasks
- Tasks due this week
- Recently completed
- Recently created

## 🖥️ Screen Sharing

### Access Screen Sharing
- **Global**: Floating button (bottom right)
- **Discussions**: Built-in controls
- **Tasks**: Detail view has sharing
- **Everywhere**: Universal access

### Start Sharing
1. Click screen share button
2. Select window/screen
3. Share with team
4. Stop when done

## ⌨️ Keyboard Shortcuts

### Global
- `Cmd/Ctrl + S` - Save
- `Cmd/Ctrl + Shift + H` - Show help
- `Cmd/Ctrl + Shift + Enter` - Apply AI suggestion

### Editor
- `Cmd/Ctrl + F` - Search
- `Cmd/Ctrl + D` - Select next occurrence
- `Cmd/Ctrl + G` - Go to line
- `Cmd/Ctrl + /` - Toggle comment
- `Shift + Alt + ↓` - Duplicate line down
- `Shift + Alt + ↑` - Duplicate line up
- `Cmd/Ctrl + Shift + K` - Delete line
- `Tab` - Expand Emmet or indent

## 🔧 Configuration

### Optional Environment Variables
Create `.env.local` file:
```env
# Real AI (optional)
OPENAI_API_KEY=sk-...

# Playground settings (optional)
PLAYGROUND_TRIAL_DAYS=7
```

### No API Key Needed!
- Playground works without API key
- AI Helper uses smart mock responses
- Templates always available
- Security always active

## 🐛 Troubleshooting

### Emmet not working?
- Press **Tab**, not Enter
- Cursor must be right after abbreviation
- No spaces before abbreviation
- Works in HTML, CSS, JS, Python tabs

### Templates not showing?
- Click "📚 Templates" button
- Select category tab at top
- Refresh page if needed

### AI giving generic responses?
- This is normal without API key
- Responses are still helpful
- Add OPENAI_API_KEY for real AI

### Code execution stopped?
- This is the 5-second timeout protection
- Check for infinite loops
- Optimize your code
- Timeout can be adjusted in security settings

### Security blocking my code?
- Check console for specific error
- Blocked patterns are for safety
- Use alternative approaches
- Contact admin if legitimate code is blocked

## 📊 Dashboard Tips

### Quick Navigate
- Use sidebar for main navigation
- Collapse sidebar for more space
- Mobile: Floating menu button

### Task Management
- Click task to open details
- Checkbox to mark complete
- Color-coded by status
- Priority indicators

### Project Tracking
- View active projects
- See task counts
- Click to open project
- Track progress %

## 🎯 Best Practices

### Code Organization
1. Save frequently (auto-saves enabled)
2. Use descriptive titles
3. Make snippets public to share
4. Use version history to track changes

### Security
1. Don't disable security features
2. Test code in playground first
3. Review warnings and errors
4. Keep dependencies updated

### Collaboration
1. Share screen for live debugging
2. Use discussions for async communication
3. Comment on tasks for context
4. @mention team members

## 🆘 Need Help?

### In-App Help
- Press `Cmd/Ctrl + Shift + H` for shortcuts
- Click "?" button in editor
- Check console for errors

### Documentation
- Read IMPLEMENTATION_SUMMARY_NEW.md
- Check component files for details
- Review security documentation

### Community
- Create GitHub issue
- Check discussions
- Contact support

## 🎉 Have Fun!

Explore all the features:
- Try different templates
- Experiment with Emmet
- Use AI to learn
- Build something awesome!

Remember: **The playground is safe and sandboxed. Experiment freely!**
