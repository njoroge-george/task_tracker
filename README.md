<div align="center">This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

  <img src="public/logo-512.svg" alt="TaskFlow Logo" width="200" />

  ## Getting Started

  # TaskFlow™

  First, run the development server:

  ### AI-Powered Task Management System

  ```bash

  *Smart task tracking with intelligent automation*npm run dev

  # or

  [![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)yarn dev

  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)# or

  [![Prisma](https://img.shields.io/badge/Prisma-Latest-2D3748?logo=prisma)](https://www.prisma.io/)pnpm dev

  [![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai)](https://openai.com/)# or

  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)bun dev

  ```

</div>

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## ✨ Features

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### 🤖 **AI-Powered Intelligence**

- **Smart Suggestions** - Auto-generate task descriptions, priorities, and tags## Learn More

- **Natural Language Processing** - Parse complex task descriptions

- **Duplicate Detection** - Prevent redundant tasks with semantic analysisTo learn more about Next.js, take a look at the following resources:

- **Title Enhancement** - AI improves vague task titles

- **Daily Summaries** - Get AI-generated productivity insights- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

### 📋 **Complete Task Management**

- **Kanban Boards** - Drag-and-drop task organizationYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

- **Projects & Workspaces** - Multi-level organization

- **Calendar View** - Visualize tasks by date## Deploy on Vercel

- **Task Details** - Rich descriptions, subtasks, attachments, comments

- **Priority & Status** - Customizable workflow statesThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.



### 👥 **Collaboration**Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

- **Team Workspaces** - Collaborate with team members
- **Task Assignment** - Delegate work efficiently
- **Real-time Updates** - Socket.IO powered live sync
- **Comments & Activity** - Track all task interactions
- **Notifications** - Stay updated on task changes

### 📊 **Analytics & Insights**
- **Performance Metrics** - Track completion rates and productivity
- **Time Tracking** - Estimated vs actual time
- **Project Analytics** - Visualize project progress
- **Team Productivity** - Monitor team performance

### 🎨 **Modern UI/UX**
- **Dark/Light Mode** - Customizable theme
- **Responsive Design** - Mobile-first approach
- **Material-UI Components** - Beautiful, accessible interface
- **Keyboard Shortcuts** - Power-user features
- **Command Palette** - Quick navigation (Cmd/Ctrl + K)

### 💳 **Payments & Billing**
- **Stripe Integration** - Secure one-time payments
- **Three Plans** - Basic (Free), Pro ($29), Team ($99)
- **Payment Verification** - Automated plan upgrades
- **Pricing Page** - Clear, transparent pricing

### 📧 **Email Integration**
- **Nodemailer** - SMTP email support
- **Gmail Integration** - App password ready
- **Email Notifications** - Task assignments, updates
- **Test UI** - Built-in email testing dashboard

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key (optional, has mock fallback)
- Stripe account (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and configure:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/taskflow"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OpenAI (optional - works without it)
OPENAI_API_KEY="sk-..."

# Stripe (optional)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
npx prisma db seed  # Optional: Add sample data
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
```
http://localhost:3000
```

---

## 📁 Project Structure

```
taskflow/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── public/
│   ├── logo.svg               # Standard logo
│   ├── logo-512.svg           # High-res logo
│   └── favicon.svg            # Browser favicon
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── (marketing)/       # Public landing page
│   │   └── api/               # API routes
│   │       ├── ai/            # AI endpoints
│   │       ├── tasks/         # Task CRUD
│   │       ├── projects/      # Project management
│   │       └── stripe/        # Payment processing
│   ├── components/
│   │   ├── board/             # Kanban board
│   │   ├── calendar/          # Calendar view
│   │   ├── dashboard/         # Dashboard components
│   │   ├── tasks/             # Task components
│   │   └── ui/                # shadcn/ui components
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom React hooks
│   ├── lib/
│   │   ├── ai.ts              # AI service (6 functions)
│   │   ├── auth.ts            # NextAuth config
│   │   ├── email.ts           # Email service
│   │   ├── prisma.ts          # Prisma client
│   │   └── stripe.ts          # Stripe integration
│   ├── providers/             # Context providers
│   └── types/                 # TypeScript types
└── package.json
```

---

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Material-UI** - Component library
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible components

### **Backend**
- **Next.js API Routes** - RESTful API
- **Prisma** - ORM for database
- **PostgreSQL** - Relational database
- **NextAuth** - Authentication
- **Socket.IO** - Real-time features

### **AI & Integrations**
- **OpenAI GPT-4o-mini** - AI task suggestions
- **Stripe** - Payment processing
- **Nodemailer** - Email service
- **Resend** - Alternative email provider

### **DevOps**
- **Vercel** - Deployment (recommended)
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## 🤖 AI Features

### Mock Mode (No API Key Required)
TaskFlow works perfectly without an OpenAI API key! The built-in mock system uses intelligent keyword detection:

- **Priority Detection**: urgent, critical, asap → HIGH priority
- **Time Estimation**: Simple tasks: 30 min, Complex: 240 min
- **Smart Tagging**: Contextual tags based on keywords
- **Free Forever**: No API costs in mock mode

### With OpenAI API Key
Unlock advanced AI features:

- **Semantic Understanding**: Deep task analysis
- **Context-Aware Suggestions**: Better recommendations
- **Natural Language**: Parse complex descriptions
- **Duplicate Detection**: Semantic similarity matching
- **Daily Summaries**: AI-generated insights

**Cost**: ~$0.0001 per task (10,000 tasks = ~$1)

See [AI_TESTING_GUIDE.md](AI_TESTING_GUIDE.md) for detailed testing instructions.

---

## 📊 Database Schema

Key models:
- **User** - Authentication and profiles
- **Workspace** - Multi-tenant organization
- **Project** - Task grouping
- **Task** - Core task entity
- **Comment** - Task discussions
- **Attachment** - File uploads
- **Tag** - Task categorization
- **Notification** - User alerts
- **ActivityLog** - Audit trail
- **Message** - Team communication
- **Rating** - Task/project ratings

See [prisma/schema.prisma](prisma/schema.prisma) for full schema.

---

## 🎨 Branding

### Logo Usage
- See [BRAND_ASSETS.md](BRAND_ASSETS.md) for complete brand guidelines
- Logo files: `logo.svg`, `logo-512.svg`, `favicon.svg`
- Colors: Blue (#3B82F6), Purple (#8B5CF6), Indigo (#6366F1)

### Trademark
**TaskFlow™** is a trademark. Please respect trademark guidelines when forking.

---

## 🧪 Testing

### Email Testing
```bash
# Visit the built-in email test page
http://localhost:3000/dashboard/email-test
```

### AI Testing
```bash
# Create a task with AI suggestions
http://localhost:3000/dashboard/tasks
```

### Payment Testing (Stripe)
Use test card: `4242 4242 4242 4242`
```bash
http://localhost:3000/dashboard/pricing
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Import to Vercel**
- Visit [vercel.com](https://vercel.com)
- Import your repository
- Add environment variables
- Deploy!

3. **Configure Database**
- Use Vercel Postgres or external PostgreSQL
- Update `DATABASE_URL` in environment variables

4. **Set up Prisma**
```bash
npx prisma generate
npx prisma db push
```

### Environment Variables
Add all `.env` variables to Vercel dashboard.

---

## 📝 API Endpoints

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### AI
- `POST /api/ai/task-suggestions` - Generate suggestions
- `POST /api/ai/parse-task` - Parse natural language
- `POST /api/ai/enhance-title` - Improve title
- `POST /api/ai/find-similar` - Find duplicates
- `GET /api/ai/daily-summary` - Get AI summary

### Payments
- `POST /api/checkout` - Create checkout session
- `POST /api/verify-payment` - Verify payment

See API documentation in code comments.

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [OpenAI](https://openai.com/) - AI capabilities
- [Prisma](https://www.prisma.io/) - Database ORM
- [Material-UI](https://mui.com/) - UI components
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Stripe](https://stripe.com/) - Payment processing

---

## 📞 Support

- **Documentation**: See guides in project root
- **Issues**: [GitHub Issues](https://github.com/yourusername/taskflow/issues)
- **Email**: your-email@example.com

---

## 🗺️ Roadmap

### Coming Soon
- [ ] Mobile app (React Native)
- [ ] GitHub integration
- [ ] Slack notifications
- [ ] Advanced reporting
- [ ] Team analytics
- [ ] API webhooks
- [ ] Custom themes

---

<div align="center">
  
  **Built with ❤️ by Nick**
  
  ⭐ Star this repo if you find it helpful!
  
  [Report Bug](https://github.com/yourusername/taskflow/issues) • [Request Feature](https://github.com/yourusername/taskflow/issues)
  
</div>
