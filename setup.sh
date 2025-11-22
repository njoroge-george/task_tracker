#!/bin/bash

# TaskTracker Pro - Setup Script
echo "🚀 Setting up TaskTracker Pro..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install \
  next-auth@beta \
  @auth/prisma-adapter \
  bcryptjs \
  @types/bcryptjs \
  zod \
  react-hook-form \
  @hookform/resolvers \
  date-fns \
  @tanstack/react-query \
  zustand \
  sonner \
  lucide-react \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-select \
  @radix-ui/react-tabs \
  @radix-ui/react-toast \
  @radix-ui/react-popover \
  @radix-ui/react-avatar \
  @radix-ui/react-checkbox \
  @radix-ui/react-label \
  @radix-ui/react-slot \
  class-variance-authority \
  clsx \
  tailwind-merge \
  recharts \
  stripe \
  @stripe/stripe-js \
  nodemailer \
  @types/nodemailer

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 2: Setup shadcn/ui
echo -e "${BLUE}🎨 Setting up UI components...${NC}"
npx shadcn@latest init -y

echo -e "${BLUE}📦 Installing shadcn components...${NC}"
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add textarea
npx shadcn@latest add select
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
npx shadcn@latest add toast
npx shadcn@latest add popover
npx shadcn@latest add avatar
npx shadcn@latest add checkbox
npx shadcn@latest add badge
npx shadcn@latest add separator
npx shadcn@latest add calendar
npx shadcn@latest add command
npx shadcn@latest add table

echo -e "${GREEN}✅ UI components installed${NC}"

# Step 3: Generate Prisma Client
echo -e "${BLUE}🗄️  Generating Prisma client...${NC}"
npx prisma generate

echo -e "${GREEN}✅ Prisma client generated${NC}"

# Step 4: Setup environment file
if [ ! -f .env ]; then
  echo -e "${YELLOW}⚠️  .env file not found. Copying from .env.example...${NC}"
  cp .env.example .env
  echo -e "${YELLOW}⚠️  Please update .env with your credentials!${NC}"
else
  echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Step 5: Database setup instructions
echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}🗄️  Database Setup${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""
echo -e "To set up your database, run:"
echo -e "${GREEN}  npx prisma db push${NC}    # Push schema to database"
echo -e "${GREEN}  npx prisma db seed${NC}    # Seed with initial data"
echo ""
echo -e "To view your database:"
echo -e "${GREEN}  npx prisma studio${NC}     # Open Prisma Studio"
echo ""

# Step 6: Final instructions
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}🎉 Setup Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""
echo -e "Next steps:"
echo -e "1. Update ${YELLOW}.env${NC} with your credentials"
echo -e "2. Run ${GREEN}npx prisma db push${NC} to create database tables"
echo -e "3. Run ${GREEN}npx prisma db seed${NC} to add initial data"
echo -e "4. Run ${GREEN}npm run dev${NC} to start the development server"
echo ""
echo -e "📚 Documentation: See ${GREEN}SAAS_README.md${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
