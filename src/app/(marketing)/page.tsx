'use client';

import NextLink from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  CircleDot,
  Globe,
  Infinity,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Shield,
  Sparkles,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ThemeToggle from "@/components/ThemeToggle";
import Testimonials from "@/components/landing/Testimonials";

type FeatureItem = {
  title: string;
  description: string;
  icon: typeof Zap;
  details?: string[];
};

type PricingPlan = {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  ctaVariant: "contained" | "outlined";
  highlighted?: boolean;
  highlightLabel?: string;
};

type Metric = {
  value: string;
  label: string;
};

type ValueStatement = {
  title: string;
  description: string;
};

type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

type Pillar = {
  badge: string;
  title: string;
  description: string;
  icon: typeof Zap;
};

type WorkflowStage = {
  badge: string;
  title: string;
  description: string;
  metric: string;
  icon: typeof Zap;
};

type AutomationHighlight = {
  title: string;
  description: string;
  signal: string;
  icon: typeof Zap;
};

type FAQItem = {
  question: string;
  answer: string;
};

type PainPoint = {
  problem: string;
  solution: string;
  icon: typeof Zap;
};

type UseCase = {
  persona: string;
  title: string;
  description: string;
  benefits: string[];
  gradient: string;
};

type SocialBadge = {
  label: string;
  sublabel: string;
};

type ComfortHighlight = {
  title: string;
  description: string;
  badge: string;
};

type TrustAssurance = {
  title: string;
  description: string;
  icon: typeof Zap;
  detail: string;
};

type KanbanTask = {
  title: string;
  meta: string;
  accent: string;
};

type KanbanColumn = {
  title: string;
  tasks: KanbanTask[];
};

type CalendarEvent = {
  day: string;
  label: string;
  time: string;
  color: string;
};

type MessageBubble = {
  author: string;
  role: string;
  message: string;
  alignment: "left" | "right";
};

type ShowcaseCard = {
  label: string;
  description: string;
  type: "kanban" | "calendar" | "messaging";
};

const navLinks = [
  { label: "Why TaskFlow", href: "#why-taskflow" },
  { label: "Features", href: "#features" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Demo", href: "#demo" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const iconGradients = [
  "linear-gradient(135deg, #6366f1, #a855f7)",
  "linear-gradient(135deg, #0ea5e9, #38bdf8)",
  "linear-gradient(135deg, #ec4899, #f472b6)",
  "linear-gradient(135deg, #22c55e, #0d9488)",
  "linear-gradient(135deg, #f97316, #facc15)",
];

const iconAccentColors = ["#a78bfa", "#22d3ee", "#fb7185", "#10b981", "#fbbf24"];

const heroHighlights = [
  { label: "High-performing teams", value: "10K+" },
  { label: "Automations weekly", value: "2.4M" },
  { label: "Hours saved / team", value: "14" },
];

const productPillars: Pillar[] = [
  {
    badge: "Command",
    title: "Mission Control",
    description:
      "Monitor every initiative from one slate-inspired console. Build live dashboards, layer workflows, and see blockers in real time.",
    icon: LayoutDashboard,
  },
  {
    badge: "Execution",
    title: "Precision Sprints",
    description:
      "Guide teams with orchestrated sprint rituals, velocity insights, and rituals that sync to calendars automatically.",
    icon: CalendarCheck,
  },
  {
    badge: "Intelligence",
    title: "Predictive Insights",
    description:
      "Surface risks with predictive analytics, anomaly alerts, and automated postmortems generated for every launch.",
    icon: BarChart3,
  },
];

const featureItems: FeatureItem[] = [
  {
    title: "Adaptive Kanban",
    description:
      "Immersive boards with swimlanes, WIP alerts, and slate-depth layering so complex programs stay readable.",
    icon: LayoutDashboard,
    details: ["Drag + drop automations", "Persona-based views"],
  },
  {
    title: "Collaborative HQ",
    description:
      "Rich comments, live presence, and async decisions keep remote squads aligned without endless meetings.",
    icon: Users,
    details: ["Contextual mentions", "Focus-ready notifications"],
  },
  {
    title: "Enterprise Guard",
    description:
      "SOC2-ready controls, SSO, audit trails, and encryption on every workspace for peace of mind.",
    icon: Shield,
    details: ["Fine-grained roles", "Geo-aware redundancy"],
  },
  {
    title: "Automation Studio",
    description:
      "No-code triggers connect commits, calendars, and CRMs. Chain actions with branching logic in minutes.",
    icon: Workflow,
    details: ["100+ native integrations", "AI suggestions"],
  },
  {
    title: "Insight Engine",
    description:
      "Executive-ready reports, burndown diagnostics, and forecasted delivery confidence levels.",
    icon: BarChart3,
    details: ["Custom data warehouse", "KPI alerts"],
  },
  {
    title: "Developer Mode",
    description:
      "Two-way sync with GitHub, Linear, and Jira plus CLI-powered updates for makers who live in the terminal.",
    icon: Zap,
    details: ["Merge-aware automations", "Smart release notes"],
  },
];

const workflowStages: WorkflowStage[] = [
  {
    badge: "01",
    title: "Capture",
    description:
      "Ingest ideas from forms, chat, and integrations. AI clustering groups related initiatives automatically.",
    metric: "+37% signal clarity",
    icon: Sparkles,
  },
  {
    badge: "02",
    title: "Plan",
    description:
      "Design roadmaps, allocate capacity, and lock priorities across teams with lightning-fast approvals.",
    metric: "Hours saved weekly",
    icon: Layers,
  },
  {
    badge: "03",
    title: "Execute",
    description:
      "Automations move tasks, update stakeholders, and keep dependencies in sync as statuses change.",
    metric: "99.9% sync accuracy",
    icon: Workflow,
  },
  {
    badge: "04",
    title: "Learn",
    description:
      "Retro insights, velocity trends, and AI-authored recaps push straight to leadership and clients.",
    metric: "4.9/5 satisfaction",
    icon: MessageSquare,
  },
];

const automationHighlights: AutomationHighlight[] = [
  {
    title: "Release orchestration",
    description:
      "Deploy pipelines trigger approvals, QA tasks, and customer notes instantly.",
    signal: "Triggered by GitHub push",
    icon: Infinity,
  },
  {
    title: "Client-ready digests",
    description:
      "Every Friday, TaskFlow assembles wins, deltas, and blockers per account.",
    signal: "Friday • 7:00 AM",
    icon: Globe,
  },
  {
    title: "Escalation shield",
    description:
      "If SLAs slip, owners are reassigned, chats spin up, and leadership gets context.",
    signal: "Latency > 4h",
    icon: Shield,
  },
];

const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    description: "Solo makers",
    features: [
      "3 workspaces",
      "Unlimited tasks",
      "Core automation",
      "Community support",
    ],
    ctaLabel: "Launch for Free",
    ctaHref: "/auth/signin",
    ctaVariant: "outlined",
  },
  {
    name: "Pro",
    price: "$18",
    period: "/user",
    description: "Scaling teams",
    features: [
      "Unlimited workspaces",
      "Advanced permissions",
      "Intelligence suite",
      "Priority success partner",
    ],
    ctaLabel: "Start 14-day Trial",
    ctaHref: "/auth/signin",
    ctaVariant: "contained",
    highlighted: true,
    highlightLabel: "Most Adopted",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Global programs",
    features: [
      "Dedicated pods",
      "On-prem or hybrid",
      "Security reviews",
      "Guaranteed SLAs",
    ],
    ctaLabel: "Talk to Sales",
    ctaHref: "/auth/signin",
    ctaVariant: "outlined",
  },
];

const metrics: Metric[] = [
  { value: "10,000+", label: "Teams in flight" },
  { value: "50M+", label: "Tasks orchestrated" },
  { value: "2.5M", label: "Automations / week" },
  { value: "99.9%", label: "Uptime" },
];

const values: ValueStatement[] = [
  {
    title: "Craft",
    description:
      "We obsess over motion, typography, and micro-interactions so your team experiences pure focus.",
  },
  {
    title: "Trust",
    description:
      "Security, auditability, and transparency aren’t add-ons—they’re the architecture.",
  },
  {
    title: "Progress",
    description:
      "Every launch should feel better than the last. We ship weekly and listen relentlessly.",
  },
];

const automationLogos = ["Linear", "Figma", "Slack", "Jira", "HubSpot", "Notion"];

const painPoints: PainPoint[] = [
  {
    problem: "Scattered tools, scattered focus",
    solution: "One unified command center replaces the chaos of 5+ disconnected apps.",
    icon: LayoutDashboard,
  },
  {
    problem: "Endless status meetings",
    solution: "Real-time dashboards and async updates eliminate 70% of check-in calls.",
    icon: MessageSquare,
  },
  {
    problem: "Manual busywork drains energy",
    solution: "Automations handle the grunt work so your team focuses on creative impact.",
    icon: Workflow,
  },
  {
    problem: "Deadlines slip through cracks",
    solution: "Predictive alerts and dependency tracking surface risks before they escalate.",
    icon: CalendarCheck,
  },
];

const useCases: UseCase[] = [
  {
    persona: "Product Teams",
    title: "Ship features faster with clarity",
    description: "Roadmap to release in one view. Stakeholders stay aligned, engineers stay unblocked.",
    benefits: ["Sprint rituals", "Burndown insights", "Release automation"],
    gradient: "linear-gradient(135deg, #6366f1, #a855f7)",
  },
  {
    persona: "Agencies",
    title: "Delight clients without the chaos",
    description: "Multi-client dashboards, time tracking, and white-label reports that impress.",
    benefits: ["Client portals", "Billable hours", "Brand-ready exports"],
    gradient: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
  },
  {
    persona: "Operations",
    title: "Orchestrate complex programs",
    description: "Cross-functional dependencies, approvals, and compliance flows in one place.",
    benefits: ["Workflow builder", "Audit trails", "Escalation rules"],
    gradient: "linear-gradient(135deg, #22c55e, #0d9488)",
  },
  {
    persona: "Remote Teams",
    title: "Stay connected across time zones",
    description: "Async-first design with presence indicators, threaded discussions, and smart notifications.",
    benefits: ["Time zone views", "Async decisions", "Focus modes"],
    gradient: "linear-gradient(135deg, #f97316, #facc15)",
  },
];

const socialBadges: SocialBadge[] = [
  { label: "G2 Leader", sublabel: "Winter 2025" },
  { label: "SOC 2 Type II", sublabel: "Certified" },
  { label: "GDPR", sublabel: "Compliant" },
  { label: "99.9% Uptime", sublabel: "SLA Guaranteed" },
  { label: "4.9★ Rating", sublabel: "1,200+ Reviews" },
];

const comparisonPoints = [
  { feature: "AI-powered insights", taskflow: true, others: false },
  { feature: "No-code automations", taskflow: true, others: "Limited" },
  { feature: "Real-time collaboration", taskflow: true, others: true },
  { feature: "Custom workflows", taskflow: true, others: "Limited" },
  { feature: "Enterprise security", taskflow: true, others: "Add-on" },
  { feature: "White-label options", taskflow: true, others: false },
  { feature: "Dedicated success partner", taskflow: true, others: "Enterprise only" },
];

const faqItems: FAQItem[] = [
  {
    question: "How customizable is TaskFlow?",
    answer:
      "Every workspace can tailor workflows, fields, automations, and permissions. Templates accelerate setup, but anything can be reworked.",
  },
  {
    question: "Do you offer migrations?",
    answer:
      "Yes. Our concierge team migrates data from tools like Asana, Jira, ClickUp, Airtable, and custom spreadsheets with no downtime.",
  },
  {
    question: "Is there an on-prem option?",
    answer:
      "Enterprise plans support dedicated VPC or hybrid deployments with enterprise key management and audit tooling.",
  },
  {
    question: "Can I try pro features first?",
    answer:
      "The Pro trial unlocks the full automation studio, reporting suite, and integrations for 14 days—no credit card required.",
  },
];

const comfortHighlights: ComfortHighlight[] = [
  {
    badge: "Human touch",
    title: "Guided onboarding",
    description:
      "Every customer gets a success partner who runs workshops, async office hours, and migration playbooks tuned to your pace.",
  },
  {
    badge: "Calm work",
    title: "Focus-first UI",
    description:
      "Soft indigo gradients, adaptive themes, and distraction-free layouts keep long sessions comfortable on any device.",
  },
  {
    badge: "Care",
    title: "Always-on support",
    description:
      "Weekday + weekend coverage, proactive check-ins, and a thriving community ensure you never feel stuck.",
  },
];

const trustAssurances: TrustAssurance[] = [
  {
    title: "End-to-end encryption",
    detail: "AES-256 + TLS 1.3",
    description:
      "Data is locked down in transit and at rest, with customer-managed keys available for enterprise teams.",
    icon: Shield,
  },
  {
    title: "Compliance ready",
    detail: "SOC2 • GDPR • HIPAA (BAA)",
    description:
      "Independent audits, granular logging, and optional BAAs keep regulated industries in good standing.",
    icon: BarChart3,
  },
  {
    title: "Granular access",
    detail: "Role + field level",
    description:
      "Craft roles, approval flows, and residency rules so every stakeholder has precise visibility.",
    icon: Layers,
  },
  {
    title: "Resilient uptime",
    detail: "Multi-region failover",
    description:
      "Geo-redundant infrastructure, hourly backups, and live status pages keep your work reachable.",
    icon: Globe,
  },
];

const kanbanColumns: KanbanColumn[] = [
  {
    title: "Backlog",
    tasks: [
      { title: "Adaptive dashboard visuals", meta: "Design • Due Wed", accent: "#a78bfa" },
      { title: "UX research playback", meta: "Research • 2 hrs", accent: "#22d3ee" },
    ],
  },
  {
    title: "In progress",
    tasks: [
      { title: "Billing revamp build", meta: "Dev • Sprint 9", accent: "#fb7185" },
      { title: "Integrations QA", meta: "QA • 6 checks", accent: "#facc15" },
    ],
  },
  {
    title: "Review",
    tasks: [
      { title: "Multi-workspace rollout", meta: "Ops • Needs approval", accent: "#10b981" },
      { title: "Launch narrative", meta: "Marketing • Draft v2", accent: "#0ea5e9" },
    ],
  },
];

const calendarEvents: CalendarEvent[] = [
  { day: "Mon", label: "Roadmap sync", time: "09:00", color: "#a78bfa" },
  { day: "Tue", label: "Design studio", time: "13:00", color: "#fb7185" },
  { day: "Wed", label: "Client review", time: "11:30", color: "#22d3ee" },
  { day: "Thu", label: "Release standup", time: "10:00", color: "#10b981" },
  { day: "Fri", label: "Launch retro", time: "15:00", color: "#fbbf24" },
];

const messageThread: MessageBubble[] = [
  {
    author: "Ravi",
    role: "PM",
    message: "Latest sprint feels lighter—automation closed 14 follow-ups overnight.",
    alignment: "left",
  },
  {
    author: "Maya",
    role: "Ops",
    message: "Love the new calendar view. Can we pin the client reviews by region?",
    alignment: "right",
  },
  {
    author: "Jonas",
    role: "Support",
    message: "Pinned + automation ready. Also added the status digest for APAC accounts.",
    alignment: "left",
  },
];

const showcaseCards: ShowcaseCard[] = [
  {
    label: "Kanban board",
    description: "Swimlanes, WIP limits, and automation cues keep large programs readable.",
    type: "kanban",
  },
  {
    label: "Team calendar",
    description: "Color-coded rituals line up every craft so planning feels effortless.",
    type: "calendar",
  },
  {
    label: "Messaging",
    description: "Context-rich chat keeps decisions friendly, transparent, and secure.",
    type: "messaging",
  },
];

const footerColumns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "#overview" },
      { label: "Pricing", href: "#pricing" },
      { label: "Integrations", href: "#automation" },
      { label: "Security", href: "#about" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
];

export default function LandingPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const slateBase = isDark ? "#020617" : "#eef2ff";
  const slateAccent = isDark ? "#0f172a" : "#c7d2fe";
  const landingBackground = isDark
    ? "linear-gradient(180deg, #020617 0%, #040c1b 40%, #0f172a 100%)"
    : "linear-gradient(180deg, #ffffff 0%, #eef2ff 40%, #e0e7ff 100%)";
  const heroAura = isDark
    ? "radial-gradient(circle at 20% 20%, rgba(76, 81, 191, 0.4), transparent 55%)"
    : "radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.18), transparent 60%)";
  const glassBackground = alpha(isDark ? "#0f172a" : "#ffffff", isDark ? 0.62 : 0.85);
  const borderColor = alpha(isDark ? "#475569" : "#a5b4fc", 0.4);
  const surfaceSoft = alpha(isDark ? "#1e293b" : "#e0e7ff", isDark ? 0.75 : 0.7);
  const accentMain = theme.palette.mode === "dark" ? "#a5b4fc" : theme.palette.primary.main;
  const cardBackground = alpha(isDark ? "#0f172a" : "#ffffff", isDark ? 0.9 : 0.95);
  const dividerColor = alpha(theme.palette.divider, 0.4);
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const gradientHeadline = isDark
    ? "linear-gradient(120deg, #94a3b8, #c7d2fe, #e0f2fe)"
    : "linear-gradient(120deg, #1e3a8a, #6366f1, #06b6d4)";
  const gradientSectionTitle = isDark
    ? "linear-gradient(120deg, #c7d2fe, #a5b4fc, #f1f5f9)"
    : "linear-gradient(120deg, #1e1b4b, #4338ca, #0ea5e9)";
  const gradientTitleStyles = {
    backgroundImage: gradientSectionTitle,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
  };
  const getIconGradient = (index: number) =>
    iconGradients[index % iconGradients.length];
  const getIconAccent = (index: number) =>
    iconAccentColors[index % iconAccentColors.length];
  const renderShowcaseContent = (type: ShowcaseCard["type"]) => {
    if (type === "kanban") {
      return (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          {kanbanColumns.map((column) => (
            <Box
              key={column.title}
              sx={{
                p: 2,
                borderRadius: 3,
                backgroundColor: alpha(cardBackground, 0.9),
                border: `1px solid ${alpha(borderColor, 0.6)}`,
              }}
            >
              <Typography sx={{ fontWeight: 700, mb: 1 }}>{column.title}</Typography>
              <Stack spacing={1.5}>
                {column.tasks.map((task) => (
                  <Box
                    key={task.title}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: alpha(task.accent, 0.12),
                    }}
                  >
                    <Typography sx={{ fontWeight: 600 }}>{task.title}</Typography>
                    <Typography sx={{ color: textSecondary, fontSize: "0.85rem" }}>
                      {task.meta}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>
      );
    }
    if (type === "calendar") {
      return (
        <Stack spacing={1.5}>
          {calendarEvents.map((event) => (
            <Stack
              key={event.label}
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{
                p: 1.5,
                borderRadius: 3,
                backgroundColor: alpha(cardBackground, 0.95),
                border: `1px solid ${alpha(borderColor, 0.7)}`,
              }}
            >
              <Stack spacing={0.5} alignItems="center">
                <Typography sx={{ fontWeight: 600 }}>{event.day}</Typography>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: event.color,
                  }}
                />
              </Stack>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 600 }}>{event.label}</Typography>
                <Typography sx={{ color: textSecondary, fontSize: "0.85rem" }}>
                  {event.time}
                </Typography>
              </Box>
              <Chip
                label="Scheduled"
                size="small"
                sx={{
                  backgroundColor: alpha(event.color, 0.15),
                  color: event.color,
                  fontWeight: 600,
                }}
              />
            </Stack>
          ))}
        </Stack>
      );
    }
    return (
      <Stack spacing={1.5}>
        {messageThread.map((bubble) => (
          <Box
            key={bubble.message}
            sx={{
              alignSelf: bubble.alignment === "right" ? "flex-end" : "flex-start",
              maxWidth: "90%",
              p: 2,
              borderRadius: 3,
              borderTopRightRadius: bubble.alignment === "right" ? 0 : 12,
              borderTopLeftRadius: bubble.alignment === "right" ? 12 : 0,
              backgroundColor:
                bubble.alignment === "right"
                  ? alpha("#38bdf8", 0.2)
                  : alpha(cardBackground, 0.9),
              border: `1px solid ${alpha(borderColor, 0.8)}`,
            }}
          >
            <Stack spacing={0.5}>
              <Typography sx={{ fontWeight: 600 }}>
                {bubble.author} • {bubble.role}
              </Typography>
              <Typography sx={{ color: textSecondary }}>{bubble.message}</Typography>
            </Stack>
          </Box>
        ))}
      </Stack>
    );
  };
  const heroHighlightMotion = {
    animation: "floatStat 9s ease-in-out infinite",
    "@keyframes floatStat": {
      "0%": { transform: "translateY(0px)" },
      "50%": { transform: "translateY(-8px)" },
      "100%": { transform: "translateY(0px)" },
    },
  };

  // Motion variants for subtle, professional animations
  const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const sectionTitle = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `${landingBackground}, ${heroAura}`,
        color: textPrimary,
      }}
    >
      <Box
        component="nav"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          borderBottom: `1px solid ${dividerColor}`,
          backgroundColor: alpha(slateBase, 0.85),
          backdropFilter: "blur(18px)",
          zIndex: 1100,
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 68,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Sparkles size={28} color={accentMain} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              TaskFlow
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={3}
            alignItems="center"
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            {navLinks.map((link) => (
              <MuiLink
                key={link.label}
                href={link.href}
                underline="none"
                sx={{
                  color: textPrimary,
                  fontWeight: 500,
                  letterSpacing: 0.2,
                  transition: "color 0.2s ease",
                  "&:hover": { color: accentMain },
                }}
              >
                {link.label}
              </MuiLink>
            ))}
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <ThemeToggle />
            <Button
              component={NextLink}
              href="/auth/signin"
              variant="text"
              sx={{
                display: { xs: "none", sm: "inline-flex" },
                color: textSecondary,
                fontWeight: 600,
                letterSpacing: 0.2,
                "&:hover": { color: accentMain },
              }}
            >
              Sign In
            </Button>
            <Button
              component={NextLink}
              href="/auth/signin"
              size="small"
              variant="contained"
              endIcon={<ArrowRight size={18} />}
              sx={{
                px: 3,
                boxShadow: "0 20px 40px rgba(15,23,42,0.25)",
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 600,
                background: `linear-gradient(120deg, ${accentMain}, ${theme.palette.primary.dark})`,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 30px 45px rgba(15,23,42,0.35)",
                },
              }}
            >
              Get started
            </Button>
          </Stack>
        </Container>
      </Box>

      <Box component="main" sx={{ pt: { xs: 16, md: 20 } }}>
        <Box
          component="section"
          sx={{
            py: { xs: 12, md: 16 },
            backgroundImage: heroAura,
          }}
        >
          <Container maxWidth="lg">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <Stack spacing={5} textAlign="center" alignItems="center">
              <motion.div variants={fadeInUp}>
                <Chip
                  icon={<Sparkles size={16} />}
                  label="New: automation studio + predictive insights"
                  sx={{
                    borderRadius: 999,
                    px: 2,
                    backgroundColor: alpha(accentMain, 0.15),
                    color: accentMain,
                    fontWeight: 600,
                  }}
                />
              </motion.div>
              <motion.div variants={fadeInUp}>
              <Typography
                component="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "2.75rem", md: "4.25rem" },
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  backgroundImage: gradientHeadline,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Run every project, sprint, and launch from one indigo-slate HQ
              </Typography>
              </motion.div>
              <motion.div variants={fadeInUp}>
              <Typography
                component="p"
                variant="h6"
                sx={{
                  color: textSecondary,
                  maxWidth: 760,
                  lineHeight: 1.6,
                }}
              >
                TaskFlow is the end-to-end operating system for ambitious product teams.
                Plan in white space, execute with slate depth, and deliver with the polish clients expect.
              </Typography>
              </motion.div>
              <motion.div variants={fadeInUp}>
              <Typography
                component="p"
                sx={{ color: textSecondary, maxWidth: 640 }}
              >
                Every rollout includes human onboarding, cozy UI themes, and proactive support so everyone feels confident and secure on day one.
              </Typography>
              </motion.div>
              <motion.div variants={fadeInUp}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="center"
              >
                <Button
                  component={NextLink}
                  href="/auth/signin"
                  size="large"
                  variant="contained"
                  endIcon={<ArrowRight size={20} />}
                  sx={{
                    px: 5,
                    py: 2.5,
                    fontSize: "1.05rem",
                    borderRadius: 999,
                    boxShadow: "0 30px 60px rgba(15,23,42,0.35)",
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    "&:hover": {
                      transform: "translateY(-4px) scale(1.01)",
                    },
                  }}
                >
                  Book a live tour
                </Button>
                <Button
                  size="large"
                  variant="outlined"
                  sx={{
                    px: 5,
                    py: 2.5,
                    borderRadius: 999,
                    borderWidth: 2,
                    borderColor: alpha(accentMain, 0.4),
                    color: textPrimary,
                    "&:hover": {
                      backgroundColor: alpha(accentMain, 0.08),
                      borderColor: accentMain,
                      borderWidth: 2,
                    },
                  }}
                >
                  Watch the product film
                </Button>
              </Stack>
              </motion.div>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={4}
                sx={{ width: "100%", justifyContent: "center" }}
              >
                {heroHighlights.map((item) => (
                  <motion.div
                    key={item.label}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.015 }}
                    transition={{ type: "spring", stiffness: 250, damping: 20 }}
                  >
                    <Stack
                      spacing={1}
                      sx={{
                        flex: 1,
                        minWidth: 200,
                        p: 3,
                        borderRadius: 3,
                        backgroundColor: glassBackground,
                        border: `1px solid ${borderColor}`,
                        backdropFilter: "blur(14px)",
                        ...heroHighlightMotion,
                      }}
                    >
                      <Typography sx={{ color: textSecondary }}>{item.label}</Typography>
                      <Typography sx={{ fontSize: "2.2rem", fontWeight: 700 }}>
                        {item.value}
                      </Typography>
                    </Stack>
                  </motion.div>
                ))}
              </Stack>
            </Stack>
            </motion.div>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ pb: { xs: 12, md: 14 } }}>
          <Stack spacing={2} textAlign="center" mb={6}>
            <Typography sx={{ color: textSecondary, textTransform: "uppercase", letterSpacing: 2 }}>
              Trusted by product orgs worldwide
            </Typography>
          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(6, 1fr)",
              },
              gap: 3,
            }}
          >
            {automationLogos.map((logo) => (
              <Box
                key={logo}
                sx={{
                  py: 2,
                  borderRadius: 2,
                  border: `1px solid ${borderColor}`,
                  textAlign: "center",
                  fontWeight: 600,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  backgroundColor: alpha(cardBackground, 0.08),
                }}
              >
                {logo}
              </Box>
            ))}
          </Box>
        </Container>

        {/* Social Proof Badges */}
        <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 10 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            justifyContent="center"
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            {socialBadges.map((badge) => (
              <motion.div
                key={badge.label}
                whileHover={{ scale: 1.05, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 999,
                    border: `1px solid ${borderColor}`,
                    backgroundColor: alpha(cardBackground, 0.9),
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <CheckCircle2 size={18} color={accentMain} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.2 }}>
                      {badge.label}
                    </Typography>
                    <Typography sx={{ color: textSecondary, fontSize: "0.75rem" }}>
                      {badge.sublabel}
                    </Typography>
                  </Box>
                </Stack>
              </motion.div>
            ))}
          </Stack>
        </Container>

        {/* Problem-Solution Section */}
        <Box
          id="why-taskflow"
          component="section"
          sx={{
            py: { xs: 12, md: 16 },
            background: `linear-gradient(180deg, ${alpha(slateAccent, isDark ? 0.4 : 0.5)} 0%, transparent 100%)`,
          }}
        >
          <Container maxWidth="lg">
            <motion.div variants={sectionTitle} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Stack spacing={2} textAlign="center" mb={10}>
                <Typography
                  component="h2"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                    ...gradientTitleStyles,
                  }}
                >
                  Tired of the project management mess?
                </Typography>
                <Typography sx={{ color: textSecondary, maxWidth: 700, mx: "auto", fontSize: "1.15rem" }}>
                  We've been there. TaskFlow was built to solve the real frustrations that slow teams down every day.
                </Typography>
              </Stack>
            </motion.div>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 4,
              }}
            >
              {painPoints.map((point, index) => {
                const Icon = point.icon;
                const iconBackground = getIconGradient(index);
                const iconColor = getIconAccent(index);
                return (
                  <motion.div
                    key={point.problem}
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                  >
                    <Card
                      sx={{
                        borderRadius: 4,
                        border: `1px solid ${borderColor}`,
                        backgroundColor: alpha(cardBackground, 0.95),
                        height: "100%",
                        transition: "transform 0.35s ease, box-shadow 0.35s ease",
                        "&:hover": {
                          transform: "translateY(-6px)",
                          boxShadow: "0 30px 60px rgba(15,23,42,0.25)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Stack spacing={3}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                              sx={{
                                width: 52,
                                height: 52,
                                borderRadius: 3,
                                background: iconBackground,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Icon size={24} color={iconColor} />
                            </Box>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                fontSize: "1.1rem",
                                textDecoration: "line-through",
                                color: textSecondary,
                                opacity: 0.7,
                              }}
                            >
                              {point.problem}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={2} alignItems="flex-start">
                            <CheckCircle2 size={24} color={accentMain} style={{ marginTop: 2, flexShrink: 0 }} />
                            <Typography sx={{ fontWeight: 600, fontSize: "1.15rem" }}>
                              {point.solution}
                            </Typography>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </Box>
          </Container>
        </Box>

        {/* Use Cases by Persona */}
        <Box
          id="use-cases"
          component="section"
          sx={{ py: { xs: 12, md: 16 } }}
        >
          <Container maxWidth="lg">
            <motion.div variants={sectionTitle} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Stack spacing={2} textAlign="center" mb={10}>
                <Typography
                  component="h2"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                    ...gradientTitleStyles,
                  }}
                >
                  Built for every team that ships
                </Typography>
                <Typography sx={{ color: textSecondary, maxWidth: 650, mx: "auto", fontSize: "1.1rem" }}>
                  Whether you're a product squad, agency, ops team, or distributed crew—TaskFlow adapts to how you work.
                </Typography>
              </Stack>
            </motion.div>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
                gap: 4,
              }}
            >
              {useCases.map((useCase, index) => (
                <motion.div
                  key={useCase.persona}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card
                    sx={{
                      borderRadius: 4,
                      height: "100%",
                      border: `1px solid ${borderColor}`,
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        height: 6,
                        background: useCase.gradient,
                      }}
                    />
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2.5}>
                        <Chip
                          label={useCase.persona}
                          size="small"
                          sx={{
                            alignSelf: "flex-start",
                            background: useCase.gradient,
                            color: "#fff",
                            fontWeight: 700,
                          }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {useCase.title}
                        </Typography>
                        <Typography sx={{ color: textSecondary, fontSize: "0.95rem" }}>
                          {useCase.description}
                        </Typography>
                        <Stack spacing={1}>
                          {useCase.benefits.map((benefit) => (
                            <Stack key={benefit} direction="row" spacing={1} alignItems="center">
                              <CheckCircle2 size={16} color={getIconAccent(index)} />
                              <Typography sx={{ fontSize: "0.9rem", color: textSecondary }}>
                                {benefit}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </Container>
        </Box>

        {/* Video/Demo Section */}
        <Box
          id="demo"
          component="section"
          sx={{
            py: { xs: 12, md: 16 },
            background: `radial-gradient(ellipse at 50% 0%, ${alpha(accentMain, 0.15)}, transparent 60%)`,
          }}
        >
          <Container maxWidth="lg">
            <motion.div variants={sectionTitle} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Stack spacing={3} textAlign="center" mb={6}>
                <Typography
                  component="h2"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                    ...gradientTitleStyles,
                  }}
                >
                  See TaskFlow in action
                </Typography>
                <Typography sx={{ color: textSecondary, maxWidth: 600, mx: "auto", fontSize: "1.1rem" }}>
                  2 minutes to understand why teams love working in TaskFlow.
                </Typography>
              </Stack>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 5,
                  overflow: "hidden",
                  border: `1px solid ${borderColor}`,
                  background: `linear-gradient(135deg, ${alpha(accentMain, 0.1)}, ${alpha(theme.palette.secondary.main, 0.15)})`,
                  aspectRatio: "16/9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 40px 80px rgba(15,23,42,0.3)",
                  cursor: "pointer",
                  transition: "transform 0.4s ease",
                  "&:hover": {
                    transform: "scale(1.01)",
                  },
                }}
              >
                <Stack spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 20px 40px rgba(99,102,241,0.4)",
                      animation: "pulse 2s ease-in-out infinite",
                      "@keyframes pulse": {
                        "0%, 100%": { transform: "scale(1)", boxShadow: "0 20px 40px rgba(99,102,241,0.4)" },
                        "50%": { transform: "scale(1.05)", boxShadow: "0 30px 60px rgba(99,102,241,0.5)" },
                      },
                    }}
                  >
                    <ArrowRight size={36} color="#fff" />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
                    Watch the product tour
                  </Typography>
                  <Typography sx={{ color: textSecondary }}>
                    2:34 min • No signup required
                  </Typography>
                </Stack>
              </Box>
            </motion.div>
          </Container>
        </Box>

        <Box id="comfort" component="section" sx={{ py: { xs: 12, md: 16 } }}>
          <Container maxWidth="lg">
            <Stack spacing={2} textAlign="center" mb={8}>
              <Typography
                component="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "2.5rem", md: "3rem" },
                  backgroundImage: gradientSectionTitle,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Built to feel friendly, calm, and secure
              </Typography>
              <Typography sx={{ color: textSecondary }}>
                Warm color stories, thoughtful motion, and real humans on standby so adopting TaskFlow feels effortless.
              </Typography>
            </Stack>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 4,
              }}
            >
              {comfortHighlights.map((comfort, index) => (
                <Card
                  key={comfort.title}
                  sx={{
                    borderRadius: 4,
                    border: `1px solid ${borderColor}`,
                    backgroundColor: alpha(cardBackground, 0.96),
                    position: "relative",
                    overflow: "hidden",
                    transition: "transform 0.35s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(135deg, ${alpha(accentMain, 0.08)}, transparent)`,
                      opacity: 0,
                      transition: "opacity 0.35s ease",
                    },
                    "&:hover::after": {
                      opacity: 1,
                    },
                    animation: `comfortFloat${index} 11s ease-in-out infinite`,
                    [`@keyframes comfortFloat${index}`]: {
                      "0%": { transform: "translateY(0px)" },
                      "50%": { transform: "translateY(-5px)" },
                      "100%": { transform: "translateY(0px)" },
                    },
                  }}
                >
                  <CardContent>
                    <Chip
                      label={comfort.badge}
                      size="small"
                      sx={{
                        mb: 2,
                        backgroundColor: alpha(accentMain, 0.15),
                        color: accentMain,
                        fontWeight: 600,
                      }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      {comfort.title}
                    </Typography>
                    <Typography sx={{ color: textSecondary }}>{comfort.description}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Container>
        </Box>

        <Box id="overview" component="section" sx={{ py: { xs: 12, md: 16 } }}>
          <Container maxWidth="lg">
            <motion.div variants={sectionTitle} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Stack spacing={2} textAlign="center" mb={8}>
                <Typography component="h2" sx={{ fontWeight: 700, fontSize: { xs: "2.5rem", md: "3rem" }, ...gradientTitleStyles }}>
                  A full studio designed for modern operators
                </Typography>
                <Typography sx={{ color: textSecondary }}>
                  Seamless layers from briefing to billing that keep momentum high and context intact.
                </Typography>
              </Stack>
            </motion.div>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 4,
              }}
            >
              {productPillars.map((pillar, index) => {
                const Icon = pillar.icon;
                const iconBackground = getIconGradient(index);
                const iconColor = getIconAccent(index);
                return (
                  <Card
                    key={pillar.title}
                    sx={{
                      borderRadius: 4,
                      backgroundColor: cardBackground,
                      border: `1px solid ${borderColor}`,
                      transition: "transform 0.3s ease",
                      "&:hover": { transform: "translateY(-8px)" },
                    }}
                  >
                    <CardContent>
                      <Chip
                        label={pillar.badge}
                        size="small"
                        sx={{
                          mb: 2,
                          backgroundColor: alpha(iconColor, 0.15),
                          color: iconColor,
                          fontWeight: 600,
                        }}
                      />
                      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            background: iconBackground,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon size={22} color={iconColor} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {pillar.title}
                        </Typography>
                      </Stack>
                      <Typography sx={{ color: textSecondary }}>{pillar.description}</Typography>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Container>
        </Box>

        <Box
          id="features"
          component="section"
          sx={{
            py: { xs: 12, md: 16 },
            backgroundColor: alpha(slateAccent, isDark ? 0.35 : 0.6),
          }}
        >
          <Container maxWidth="lg">
            <motion.div variants={sectionTitle} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Stack spacing={2} textAlign="center" mb={8}>
                <Typography component="h2" sx={{ fontWeight: 700, fontSize: { xs: "2.5rem", md: "3rem" }, ...gradientTitleStyles }}>
                  Features built for pro-tier delivery
                </Typography>
                <Typography sx={{ color: textSecondary }}>
                  Modular, motion-forward blocks that feel as premium as the launches you lead.
                </Typography>
              </Stack>
            </motion.div>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },
                gap: 4,
              }}
            >
              {featureItems.map((feature, index) => {
                const Icon = feature.icon;
                const iconBackground = getIconGradient(index);
                const iconColor = getIconAccent(index);
                return (
                  <Card
                    key={feature.title}
                    sx={{
                      borderRadius: 4,
                      height: "100%",
                      border: `1px solid ${borderColor}`,
                      backgroundColor: alpha(cardBackground, 0.95),
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 30px 60px rgba(15,23,42,0.25)",
                      },
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={2} mb={3} alignItems="center">
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 3,
                            background: iconBackground,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon size={24} color={iconColor} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {feature.title}
                        </Typography>
                      </Stack>
                      <Typography sx={{ color: textSecondary, mb: 3 }}>
                        {feature.description}
                      </Typography>
                      {feature.details && (
                        <Stack spacing={1.5}>
                          {feature.details.map((detail) => (
                            <Stack direction="row" spacing={1.5} key={detail} alignItems="center">
                              <CircleDot size={16} color={iconColor} />
                              <Typography sx={{ color: textSecondary }}>{detail}</Typography>
                            </Stack>
                          ))}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Container>
        </Box>

        <Box
          id="workflow"
          component="section"
          sx={{
            py: { xs: 12, md: 16 },
            backgroundImage: `linear-gradient(120deg, ${alpha(slateAccent, 0.35)}, ${alpha(slateBase, 0.8)})`,
          }}
        >
          <Container maxWidth="lg">
            <motion.div variants={sectionTitle} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Stack spacing={3} textAlign="center" mb={8}>
                <Typography component="h2" sx={{ fontWeight: 700, fontSize: { xs: "2.5rem", md: "3rem" }, ...gradientTitleStyles }}>
                  A cinematic workflow from brief to celebration
                </Typography>
                <Typography sx={{ color: textSecondary }}>
                  Every stage carries animations, guardrails, and insights so nothing slips.
                </Typography>
              </Stack>
            </motion.div>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 4,
              }}
            >
              {workflowStages.map((stage, index) => {
                const Icon = stage.icon;
                const iconColor = getIconAccent(index);
                const iconBackground = getIconGradient(index);
                return (
                  <Card
                    key={stage.title}
                    sx={{
                      borderRadius: 4,
                      border: `1px solid ${borderColor}`,
                      backgroundColor: alpha(cardBackground, 0.9),
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <Chip
                          label={stage.badge}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            backgroundColor: alpha(iconColor, 0.25),
                            color: iconColor,
                          }}
                        />
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: iconBackground,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon size={18} color="#0f172a" />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {stage.title}
                        </Typography>
                      </Stack>
                      <Typography sx={{ color: textSecondary, mb: 3 }}>
                        {stage.description}
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }}>{stage.metric}</Typography>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Container>
        </Box>

        <Box id="automation" component="section" sx={{ py: { xs: 12, md: 16 } }}>
          <Container maxWidth="lg">
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={6}
              alignItems="center"
            >
              <Stack spacing={3} sx={{ flex: 1 }}>
                <Typography
                  component="h2"
                  sx={{ fontWeight: 700, fontSize: { xs: "2.5rem", md: "3rem" }, ...gradientTitleStyles }}
                >
                  Automations that feel bespoke
                </Typography>
                <Typography sx={{ color: textSecondary }}>
                  Blend triggers, approvals, and AI assistance with smooth motion. Every recipe previews in real time so stakeholders see exactly what happens next.
                </Typography>
                <Stack spacing={2}>
                  {automationHighlights.map((highlight, index) => {
                    const Icon = highlight.icon;
                    const iconColor = getIconAccent(index);
                    const iconBackground = getIconGradient(index);
                    return (
                      <Box
                        key={highlight.title}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          border: `1px solid ${borderColor}`,
                          backgroundColor: alpha(cardBackground, 0.95),
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center" mb={1.5}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              background: iconBackground,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Icon size={20} color={iconColor} />
                          </Box>
                          <Typography sx={{ fontWeight: 600 }}>{highlight.title}</Typography>
                        </Stack>
                        <Typography sx={{ color: textSecondary }}>{highlight.description}</Typography>
                        <Typography sx={{ mt: 1.5, fontSize: "0.85rem", color: textSecondary }}>
                          {highlight.signal}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Stack>
              <Card
                sx={{
                  flex: 1,
                  borderRadius: 4,
                  border: `1px solid ${borderColor}`,
                  background: `linear-gradient(135deg, ${alpha(accentMain, 0.25)}, ${alpha(theme.palette.secondary.main, 0.3)})`,
                  boxShadow: "0 45px 80px rgba(15,23,42,0.35)",
                }}
              >
                <CardContent>
                  <Stack spacing={3}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Live blueprint
                    </Typography>
                    <Typography sx={{ color: textSecondary }}>
                      Drag nodes, preview emails, and watch statuses animate between systems.
                    </Typography>
                    <Stack spacing={2}>
                      {["Trigger", "Logic", "Delivery"].map((step, index) => (
                        <Stack
                          key={step}
                          direction="row"
                          spacing={2}
                          alignItems="center"
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            backgroundColor: alpha(cardBackground, 0.8),
                          }}
                        >
                          <Chip
                            label={`0${index + 1}`}
                            size="small"
                            sx={{ backgroundColor: alpha(accentMain, 0.2), color: accentMain }}
                          />
                          <Typography sx={{ fontWeight: 600 }}>{step}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Container>
        </Box>

        {/* Showcase section */}
        <Box
          id="showcase"
          component="section"
          sx={{
            py: { xs: 14, md: 20 },
            position: "relative",
            overflow: "hidden",
            background: isDark
              ? `linear-gradient(180deg, ${alpha("#0f172a", 0.95)} 0%, ${alpha("#020617", 0.98)} 100%)`
              : `linear-gradient(180deg, ${alpha("#e0e7ff", 0.6)} 0%, ${alpha("#eef2ff", 0.8)} 100%)`,
          }}
        >
          {/* Background decorative grid pattern */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: isDark
                ? `radial-gradient(circle at 1px 1px, ${alpha("#475569", 0.15)} 1px, transparent 0)`
                : `radial-gradient(circle at 1px 1px, ${alpha("#6366f1", 0.08)} 1px, transparent 0)`,
              backgroundSize: "40px 40px",
              opacity: 0.8,
            }}
          />
          {/* Glowing orbs */}
          <Box
            sx={{
              position: "absolute",
              top: "10%",
              left: "5%",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha(accentMain, 0.15)}, transparent 70%)`,
              filter: "blur(60px)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: "15%",
              right: "10%",
              width: 250,
              height: 250,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.12)}, transparent 70%)`,
              filter: "blur(50px)",
            }}
          />
          <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
            <motion.div variants={sectionTitle} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Stack spacing={3} textAlign="center" mb={10}>
                <Chip
                  icon={<Sparkles size={16} />}
                  label="Product Preview"
                  sx={{
                    alignSelf: "center",
                    backgroundColor: alpha(accentMain, 0.15),
                    color: accentMain,
                    fontWeight: 600,
                    px: 2,
                  }}
                />
                <Typography
                  component="h2"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                    ...gradientTitleStyles,
                  }}
                >
                  A quick look at the craft
                </Typography>
                <Typography sx={{ color: textSecondary, maxWidth: 600, mx: "auto", fontSize: "1.1rem" }}>
                  Beautiful interfaces designed for focus. Explore our Kanban boards, team calendar, and real-time messaging.
                </Typography>
              </Stack>
            </motion.div>

            {/* Bento Grid Layout */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                gridTemplateRows: { xs: "auto", lg: "auto auto" },
                gap: 3,
              }}
            >
              {/* Kanban - Large card spanning full width on mobile, left column on desktop */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                style={{ gridColumn: "1 / -1" }}
              >
                <Box
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 5,
                    border: `1px solid ${alpha(borderColor, 0.5)}`,
                    background: isDark
                      ? `linear-gradient(145deg, ${alpha("#1e293b", 0.9)}, ${alpha("#0f172a", 0.95)})`
                      : `linear-gradient(145deg, ${alpha("#ffffff", 0.98)}, ${alpha("#f1f5f9", 0.95)})`,
                    boxShadow: isDark
                      ? "0 25px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)"
                      : "0 25px 80px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.8)",
                    position: "relative",
                    overflow: "hidden",
                    transition: "transform 0.4s ease, box-shadow 0.4s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: isDark
                        ? "0 35px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)"
                        : "0 35px 100px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.9)",
                    },
                  }}
                >
                  {/* Header */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 3,
                          background: getIconGradient(0),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <LayoutDashboard size={22} color="#fff" />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          Kanban Board
                        </Typography>
                        <Typography sx={{ color: textSecondary, fontSize: "0.9rem" }}>
                          Swimlanes, WIP limits, and automation cues
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label="Live"
                        size="small"
                        sx={{
                          backgroundColor: alpha("#22c55e", 0.15),
                          color: "#22c55e",
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        label="3 columns"
                        size="small"
                        sx={{
                          backgroundColor: alpha(accentMain, 0.1),
                          color: accentMain,
                          fontWeight: 500,
                        }}
                      />
                    </Stack>
                  </Stack>
                  {/* Kanban Grid */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                      gap: 2.5,
                    }}
                  >
                    {kanbanColumns.map((column, colIndex) => (
                      <Box
                        key={column.title}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          backgroundColor: alpha(isDark ? "#1e293b" : "#f8fafc", isDark ? 0.6 : 0.8),
                          border: `1px solid ${alpha(borderColor, 0.4)}`,
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                            {column.title}
                          </Typography>
                          <Chip
                            label={column.tasks.length}
                            size="small"
                            sx={{
                              minWidth: 28,
                              height: 24,
                              backgroundColor: alpha(getIconAccent(colIndex), 0.15),
                              color: getIconAccent(colIndex),
                              fontWeight: 700,
                              fontSize: "0.8rem",
                            }}
                          />
                        </Stack>
                        <Stack spacing={1.5}>
                          {column.tasks.map((task) => (
                            <motion.div
                              key={task.title}
                              whileHover={{ scale: 1.02, y: -2 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: 2.5,
                                  backgroundColor: alpha(isDark ? "#0f172a" : "#ffffff", isDark ? 0.8 : 1),
                                  border: `1px solid ${alpha(task.accent, 0.3)}`,
                                  borderLeft: `4px solid ${task.accent}`,
                                  boxShadow: `0 4px 12px ${alpha(task.accent, 0.1)}`,
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    borderColor: alpha(task.accent, 0.5),
                                    boxShadow: `0 8px 20px ${alpha(task.accent, 0.15)}`,
                                  },
                                }}
                              >
                                <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", mb: 0.5 }}>
                                  {task.title}
                                </Typography>
                                <Typography sx={{ color: textSecondary, fontSize: "0.8rem" }}>
                                  {task.meta}
                                </Typography>
                              </Box>
                            </motion.div>
                          ))}
                        </Stack>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </motion.div>

              {/* Calendar Card */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <Box
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 5,
                    height: "100%",
                    border: `1px solid ${alpha(borderColor, 0.5)}`,
                    background: isDark
                      ? `linear-gradient(145deg, ${alpha("#1e293b", 0.9)}, ${alpha("#0f172a", 0.95)})`
                      : `linear-gradient(145deg, ${alpha("#ffffff", 0.98)}, ${alpha("#f1f5f9", 0.95)})`,
                    boxShadow: isDark
                      ? "0 20px 60px rgba(0,0,0,0.4)"
                      : "0 20px 60px rgba(99,102,241,0.12)",
                    transition: "transform 0.4s ease, box-shadow 0.4s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: isDark
                        ? "0 30px 80px rgba(0,0,0,0.5)"
                        : "0 30px 80px rgba(99,102,241,0.18)",
                    },
                  }}
                >
                  {/* Header */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2.5,
                          background: getIconGradient(1),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CalendarCheck size={20} color="#fff" />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Team Calendar
                      </Typography>
                    </Stack>
                    <Chip
                      label="This week"
                      size="small"
                      sx={{
                        backgroundColor: alpha(getIconAccent(1), 0.15),
                        color: getIconAccent(1),
                        fontWeight: 600,
                      }}
                    />
                  </Stack>
                  {/* Calendar Events */}
                  <Stack spacing={1.5}>
                    {calendarEvents.map((event) => (
                      <motion.div
                        key={event.label}
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="center"
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            backgroundColor: alpha(isDark ? "#0f172a" : "#ffffff", isDark ? 0.6 : 0.9),
                            border: `1px solid ${alpha(event.color, 0.25)}`,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: alpha(event.color, 0.08),
                              borderColor: alpha(event.color, 0.4),
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 48,
                              textAlign: "center",
                              p: 1,
                              borderRadius: 2,
                              backgroundColor: alpha(event.color, 0.12),
                            }}
                          >
                            <Typography sx={{ fontWeight: 700, color: event.color, fontSize: "0.85rem" }}>
                              {event.day}
                            </Typography>
                            <Typography sx={{ fontSize: "0.75rem", color: textSecondary }}>
                              {event.time}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                              {event.label}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              backgroundColor: event.color,
                              boxShadow: `0 0 8px ${alpha(event.color, 0.5)}`,
                            }}
                          />
                        </Stack>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
              </motion.div>

              {/* Messaging Card */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <Box
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 5,
                    height: "100%",
                    border: `1px solid ${alpha(borderColor, 0.5)}`,
                    background: isDark
                      ? `linear-gradient(145deg, ${alpha("#1e293b", 0.9)}, ${alpha("#0f172a", 0.95)})`
                      : `linear-gradient(145deg, ${alpha("#ffffff", 0.98)}, ${alpha("#f1f5f9", 0.95)})`,
                    boxShadow: isDark
                      ? "0 20px 60px rgba(0,0,0,0.4)"
                      : "0 20px 60px rgba(99,102,241,0.12)",
                    transition: "transform 0.4s ease, box-shadow 0.4s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: isDark
                        ? "0 30px 80px rgba(0,0,0,0.5)"
                        : "0 30px 80px rgba(99,102,241,0.18)",
                    },
                  }}
                >
                  {/* Header */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2.5,
                          background: getIconGradient(2),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <MessageSquare size={20} color="#fff" />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Messaging
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5}>
                      {["R", "M", "J"].map((initial, i) => (
                        <Box
                          key={initial}
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: getIconGradient(i),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: "#fff",
                            border: `2px solid ${isDark ? "#0f172a" : "#fff"}`,
                            marginLeft: i > 0 ? "-8px" : 0,
                          }}
                        >
                          {initial}
                        </Box>
                      ))}
                    </Stack>
                  </Stack>
                  {/* Messages */}
                  <Stack spacing={2} sx={{ display: "flex", flexDirection: "column" }}>
                    {messageThread.map((bubble, index) => (
                      <motion.div
                        key={bubble.message}
                        initial={{ opacity: 0, x: bubble.alignment === "right" ? 20 : -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        viewport={{ once: true }}
                        style={{
                          alignSelf: bubble.alignment === "right" ? "flex-end" : "flex-start",
                          maxWidth: "85%",
                        }}
                      >
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            borderTopRightRadius: bubble.alignment === "right" ? 4 : 12,
                            borderTopLeftRadius: bubble.alignment === "right" ? 12 : 4,
                            background:
                              bubble.alignment === "right"
                                ? getIconGradient(1)
                                : alpha(isDark ? "#1e293b" : "#f1f5f9", isDark ? 0.8 : 1),
                            color: bubble.alignment === "right" ? "#fff" : textPrimary,
                            boxShadow: bubble.alignment === "right"
                              ? "0 4px 15px rgba(14,165,233,0.3)"
                              : "0 2px 8px rgba(0,0,0,0.08)",
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                            <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
                              {bubble.author}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                opacity: 0.7,
                              }}
                            >
                              {bubble.role}
                            </Typography>
                          </Stack>
                          <Typography sx={{ fontSize: "0.9rem", lineHeight: 1.5 }}>
                            {bubble.message}
                          </Typography>
                        </Box>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
              </motion.div>
            </Box>
          </Container>
        </Box>
        {/* Security section */}
        <Box id="security" component="section" sx={{ py: { xs: 12, md: 16 } }}>
          <Container maxWidth="lg">
            <motion.div variants={sectionTitle} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Stack spacing={2} textAlign="center" mb={8}>
                <Typography component="h2" sx={{ fontWeight: 700, fontSize: { xs: "2.5rem", md: "3rem" }, ...gradientTitleStyles }}>
                  Security and compliance, built-in
                </Typography>
                <Typography sx={{ color: textSecondary }}>
                  Encryption, audit trails, and enterprise features standard—no surprises.
                </Typography>
              </Stack>
            </motion.div>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 4,
              }}
            >
              {[
                { title: "SOC2-ready controls", icon: Shield, desc: "Rigorous policies and continuous monitoring." },
                { title: "SSO + SCIM", icon: Users, desc: "Provision and manage users at scale securely." },
                { title: "Encryption everywhere", icon: Shield, desc: "Data in transit and at rest, per-workspace keys." },
                { title: "Audit trails", icon: Layers, desc: "Every change tracked and exportable for reviews." },
              ].map((item, index) => {
                const Icon = item.icon;
                const iconBackground = getIconGradient(index);
                const iconColor = getIconAccent(index);
                return (
                  <Card key={item.title} sx={{ borderRadius: 4, border: `1px solid ${borderColor}`, backgroundColor: cardBackground }}>
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center" mb={1.5}>
                        <Box sx={{ width: 44, height: 44, borderRadius: 2, background: iconBackground, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon size={22} color={iconColor} />
                        </Box>
                        <Typography sx={{ fontWeight: 700 }}>{item.title}</Typography>
                      </Stack>
                      <Typography sx={{ color: textSecondary }}>{item.desc}</Typography>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Container>
        </Box>

        <Box
          id="trust"
          component="section"
          sx={{
            py: { xs: 12, md: 16 },
            backgroundColor: alpha(slateAccent, isDark ? 0.45 : 0.3),
          }}
        >
          <Container maxWidth="lg">
            <Stack spacing={2} textAlign="center" mb={8}>
              <Typography component="h2" sx={{ fontWeight: 700, fontSize: { xs: "2.5rem", md: "3rem" }, ...gradientTitleStyles }}>
                Security that feels reassuring
              </Typography>
              <Typography sx={{ color: textSecondary }}>
                Enterprise-grade controls with transparent status updates, so stakeholders sleep easy.
              </Typography>
            </Stack>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 4,
              }}
            >
              {trustAssurances.map((trust, index) => {
                const Icon = trust.icon;
                const iconBackground = getIconGradient(index);
                const iconColor = getIconAccent(index);
                return (
                  <Card
                    key={trust.title}
                    sx={{
                      borderRadius: 4,
                      border: `1px solid ${borderColor}`,
                      backgroundColor: alpha(cardBackground, 0.95),
                      boxShadow: "0 25px 60px rgba(15,23,42,0.25)",
                      p: 1,
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 3,
                            background: iconBackground,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon size={24} color={iconColor} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {trust.title}
                          </Typography>
                          <Typography sx={{ color: iconColor, fontSize: "0.9rem" }}>
                            {trust.detail}
                          </Typography>
                        </Box>
                      </Stack>
                      <Typography sx={{ color: textSecondary }}>{trust.description}</Typography>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Container>
        </Box>

        {/* Comparison Section */}
        <Box
          id="comparison"
          component="section"
          sx={{
            py: { xs: 12, md: 16 },
            background: `linear-gradient(180deg, transparent 0%, ${alpha(slateAccent, isDark ? 0.3 : 0.4)} 50%, transparent 100%)`,
          }}
        >
          <Container maxWidth="md">
            <motion.div variants={sectionTitle} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Stack spacing={2} textAlign="center" mb={8}>
                <Typography
                  component="h2"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "2.5rem", md: "3rem" },
                    ...gradientTitleStyles,
                  }}
                >
                  Why teams choose TaskFlow
                </Typography>
                <Typography sx={{ color: textSecondary, maxWidth: 550, mx: "auto" }}>
                  See how we stack up against traditional project management tools.
                </Typography>
              </Stack>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Card
                sx={{
                  borderRadius: 4,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: alpha(cardBackground, 0.95),
                  overflow: "hidden",
                }}
              >
                <Box sx={{ overflowX: "auto" }}>
                  <Box sx={{ minWidth: 500 }}>
                    {/* Header */}
                    <Stack
                      direction="row"
                      sx={{
                        borderBottom: `1px solid ${borderColor}`,
                        backgroundColor: alpha(slateAccent, isDark ? 0.5 : 0.3),
                      }}
                    >
                      <Box sx={{ flex: 2, p: 2.5 }}>
                        <Typography sx={{ fontWeight: 700 }}>Feature</Typography>
                      </Box>
                      <Box sx={{ flex: 1, p: 2.5, textAlign: "center" }}>
                        <Stack spacing={0.5} alignItems="center">
                          <Sparkles size={20} color={accentMain} />
                          <Typography sx={{ fontWeight: 700, color: accentMain }}>TaskFlow</Typography>
                        </Stack>
                      </Box>
                      <Box sx={{ flex: 1, p: 2.5, textAlign: "center" }}>
                        <Typography sx={{ fontWeight: 600, color: textSecondary }}>Others</Typography>
                      </Box>
                    </Stack>
                    {/* Rows */}
                    {comparisonPoints.map((row, index) => (
                      <Stack
                        key={row.feature}
                        direction="row"
                        sx={{
                          borderBottom: index < comparisonPoints.length - 1 ? `1px solid ${alpha(borderColor, 0.5)}` : "none",
                          "&:hover": { backgroundColor: alpha(accentMain, 0.03) },
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <Box sx={{ flex: 2, p: 2.5 }}>
                          <Typography sx={{ fontWeight: 500 }}>{row.feature}</Typography>
                        </Box>
                        <Box sx={{ flex: 1, p: 2.5, display: "flex", justifyContent: "center", alignItems: "center" }}>
                          {row.taskflow === true ? (
                            <CheckCircle2 size={22} color="#22c55e" />
                          ) : (
                            <Typography sx={{ color: textSecondary }}>{String(row.taskflow)}</Typography>
                          )}
                        </Box>
                        <Box sx={{ flex: 1, p: 2.5, display: "flex", justifyContent: "center", alignItems: "center" }}>
                          {row.others === true ? (
                            <CheckCircle2 size={22} color={textSecondary} />
                          ) : row.others === false ? (
                            <Box
                              sx={{
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                border: `2px solid ${alpha(textSecondary, 0.3)}`,
                              }}
                            />
                          ) : (
                            <Typography sx={{ color: textSecondary, fontSize: "0.9rem" }}>{row.others}</Typography>
                          )}
                        </Box>
                      </Stack>
                    ))}
                  </Box>
                </Box>
              </Card>
            </motion.div>
            <Stack alignItems="center" sx={{ mt: 5 }}>
              <Button
                component={NextLink}
                href="/auth/signin"
                size="large"
                variant="contained"
                endIcon={<ArrowRight size={20} />}
                sx={{
                  px: 5,
                  py: 2,
                  borderRadius: 999,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  boxShadow: "0 20px 40px rgba(99,102,241,0.3)",
                  "&:hover": { transform: "translateY(-3px)" },
                }}
              >
                Start your free trial
              </Button>
            </Stack>
          </Container>
        </Box>

        <Box id="pricing" component="section" sx={{ py: { xs: 12, md: 16 }, backgroundColor: surfaceSoft }}>
          <Container maxWidth="lg">
            <Stack spacing={2} textAlign="center" mb={8}>
              <Typography component="h2" sx={{ fontWeight: 700, fontSize: { xs: "2.5rem", md: "3rem" }, ...gradientTitleStyles }}>
                Pricing designed for every stage
              </Typography>
              <Typography sx={{ color: textSecondary }}>
                Simple terms, premium experience, upgrade whenever you are ready.
              </Typography>
            </Stack>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 4,
              }}
            >
              {pricingPlans.map((plan) => (
                <Card
                  key={plan.name}
                  sx={{
                    borderRadius: 4,
                    position: "relative",
                    border: `1px solid ${plan.highlighted ? accentMain : borderColor}`,
                    backgroundColor: plan.highlighted ? alpha(cardBackground, 0.98) : cardBackground,
                    boxShadow: plan.highlighted
                      ? "0 35px 75px rgba(15,23,42,0.35)"
                      : "none",
                    transform: plan.highlighted ? "translateY(-8px)" : "none",
                  }}
                >
                  {plan.highlighted && plan.highlightLabel && (
                    <Chip
                      label={plan.highlightLabel}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        backgroundColor: alpha(accentMain, 0.2),
                        color: accentMain,
                        fontWeight: 600,
                      }}
                    />
                  )}
                  <CardContent>
                    <Stack spacing={2}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {plan.name}
                      </Typography>
                      <Typography sx={{ color: textSecondary }}>{plan.description}</Typography>
                      <Box>
                        <Typography sx={{ fontSize: "2.5rem", fontWeight: 700 }}>
                          {plan.price}
                          {plan.period && (
                            <Typography component="span" sx={{ fontSize: "1rem", ml: 1, color: textSecondary }}>
                              {plan.period}
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                      <Button
                        component={NextLink}
                        href={plan.ctaHref}
                        variant={plan.ctaVariant}
                        fullWidth
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          background: plan.ctaVariant === "contained"
                            ? `linear-gradient(135deg, ${accentMain}, ${theme.palette.primary.dark})`
                            : "transparent",
                          borderWidth: plan.ctaVariant === "outlined" ? 2 : undefined,
                          color: plan.ctaVariant === "contained" ? theme.palette.common.white : textPrimary,
                        }}
                      >
                        {plan.ctaLabel}
                      </Button>
                      <Stack spacing={1.5}>
                        {plan.features.map((feature) => (
                          <Stack direction="row" spacing={1} key={feature}>
                            <CheckCircle2 size={18} color={accentMain} />
                            <Typography sx={{ color: textSecondary }}>{feature}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Container>
        </Box>

        <Box id="testimonials" component="section" sx={{ py: { xs: 12, md: 16 } }}>
          <Container maxWidth="lg">
            <Stack spacing={2} textAlign="center" mb={4}>
              <Typography component="h2" sx={{ fontWeight: 700, fontSize: { xs: "2.5rem", md: "3rem" }, ...gradientTitleStyles }}>
                Loved by operations, product, and agency leaders
              </Typography>
              <Typography sx={{ color: textSecondary }}>
                Hear how teams orchestrate entire portfolios from a single slate.
              </Typography>
            </Stack>
            <Testimonials />
          </Container>
        </Box>

        <Box id="about" component="section" sx={{ py: { xs: 12, md: 16 } }}>
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 6,
              }}
            >
              <Stack spacing={3}>
                <Typography component="h2" sx={{ fontWeight: 700, fontSize: { xs: "2.5rem", md: "3rem" }, ...gradientTitleStyles }}>
                  Built by product leaders for product leaders
                </Typography>
                <Typography sx={{ color: textSecondary }}>
                  TaskFlow launched in 2023 with a mission to give teams a calmer command center. We believe the best work happens when clarity and craft collide.
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(2, 1fr)" },
                    gap: 3,
                  }}
                >
                  {metrics.map((metric) => (
                    <Box key={metric.label}>
                      <Typography sx={{ fontSize: "2rem", fontWeight: 700, color: accentMain }}>
                        {metric.value}
                      </Typography>
                      <Typography sx={{ color: textSecondary }}>{metric.label}</Typography>
                    </Box>
                  ))}
                </Box>
              </Stack>
              <Card
                sx={{
                  borderRadius: 4,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: cardBackground,
                }}
              >
                <CardContent>
                  <Stack spacing={3}>
                    {values.map((value) => (
                      <Box key={value.title}>
                        <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                          <Sparkles size={18} color={accentMain} />
                          <Typography sx={{ fontWeight: 600 }}>{value.title}</Typography>
                        </Stack>
                        <Typography sx={{ color: textSecondary }}>{value.description}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Container>
        </Box>

        <Box id="faq" component="section" sx={{ py: { xs: 12, md: 16 }, backgroundColor: alpha(cardBackground, 0.35) }}>
          <Container maxWidth="lg">
            <Stack spacing={2} textAlign="center" mb={6}>
              <Typography component="h2" sx={{ fontWeight: 700, fontSize: { xs: "2.5rem", md: "3rem" } }}>
                Frequently asked
              </Typography>
              <Typography sx={{ color: textSecondary }}>
                Everything you need to know about onboarding, security, and scale.
              </Typography>
            </Stack>
            <Stack spacing={3}>
              {faqItems.map((item) => (
                <Box
                  key={item.question}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${borderColor}`,
                    backgroundColor: alpha(cardBackground, 0.95),
                  }}
                >
                  <Typography sx={{ fontWeight: 600, mb: 1 }}>{item.question}</Typography>
                  <Typography sx={{ color: textSecondary }}>{item.answer}</Typography>
                </Box>
              ))}
            </Stack>
          </Container>
        </Box>

        {/* Enhanced Final CTA Section */}
        <Box
          component="section"
          sx={{
            py: { xs: 16, md: 20 },
            position: "relative",
            overflow: "hidden",
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${accentMain} 100%)`,
            color: theme.palette.common.white,
          }}
        >
          {/* Floating decorative elements */}
          <Box
            sx={{
              position: "absolute",
              top: "10%",
              left: "5%",
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: alpha(theme.palette.common.white, 0.1),
              animation: "float1 8s ease-in-out infinite",
              "@keyframes float1": {
                "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
                "50%": { transform: "translate(30px, -20px) rotate(180deg)" },
              },
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: "60%",
              right: "10%",
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: alpha(theme.palette.common.white, 0.08),
              animation: "float2 10s ease-in-out infinite",
              "@keyframes float2": {
                "0%, 100%": { transform: "translate(0, 0)" },
                "50%": { transform: "translate(-20px, 30px)" },
              },
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: "20%",
              left: "15%",
              width: 60,
              height: 60,
              borderRadius: 3,
              background: alpha(theme.palette.common.white, 0.06),
              animation: "float3 12s ease-in-out infinite",
              "@keyframes float3": {
                "0%, 100%": { transform: "rotate(0deg)" },
                "50%": { transform: "rotate(45deg) translateY(-15px)" },
              },
            }}
          />
          <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Stack spacing={4} textAlign="center" alignItems="center">
                <motion.div variants={fadeInUp}>
                  <Chip
                    icon={<Sparkles size={16} color="#fff" />}
                    label="14-day free trial • No credit card"
                    sx={{
                      backgroundColor: alpha(theme.palette.common.white, 0.2),
                      color: theme.palette.common.white,
                      fontWeight: 600,
                      px: 2,
                      backdropFilter: "blur(8px)",
                    }}
                  />
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <Typography
                    component="h2"
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: "2.5rem", md: "3.5rem" },
                      lineHeight: 1.1,
                      textShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    }}
                  >
                    Ready to feel the difference?
                  </Typography>
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <Typography
                    sx={{
                      opacity: 0.95,
                      fontSize: "1.25rem",
                      maxWidth: 600,
                      lineHeight: 1.6,
                    }}
                  >
                    Join 10,000+ teams who've traded chaos for clarity. Your first project is free, forever.
                  </Typography>
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                    <Button
                      component={NextLink}
                      href="/auth/signin"
                      size="large"
                      variant="contained"
                      endIcon={<ArrowRight size={22} />}
                      sx={{
                        px: 6,
                        py: 2.5,
                        fontSize: "1.1rem",
                        borderRadius: 999,
                        backgroundColor: theme.palette.common.white,
                        color: theme.palette.primary.main,
                        fontWeight: 700,
                        boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                        "&:hover": {
                          backgroundColor: theme.palette.common.white,
                          transform: "translateY(-4px) scale(1.02)",
                          boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
                        },
                      }}
                    >
                      Start building for free
                    </Button>
                    <Button
                      size="large"
                      variant="outlined"
                      sx={{
                        px: 5,
                        py: 2,
                        borderRadius: 999,
                        borderWidth: 2,
                        color: theme.palette.common.white,
                        borderColor: alpha(theme.palette.common.white, 0.6),
                        fontWeight: 600,
                        "&:hover": {
                          borderColor: theme.palette.common.white,
                          backgroundColor: alpha(theme.palette.common.white, 0.1),
                          borderWidth: 2,
                        },
                      }}
                    >
                      Schedule a demo
                    </Button>
                  </Stack>
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <Stack direction="row" spacing={3} sx={{ mt: 2, opacity: 0.85 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CheckCircle2 size={18} />
                      <Typography sx={{ fontSize: "0.95rem" }}>Free forever plan</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CheckCircle2 size={18} />
                      <Typography sx={{ fontSize: "0.95rem" }}>Setup in 5 minutes</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CheckCircle2 size={18} />
                      <Typography sx={{ fontSize: "0.95rem" }}>Cancel anytime</Typography>
                    </Stack>
                  </Stack>
                </motion.div>
              </Stack>
            </motion.div>
          </Container>
        </Box>
      </Box>

      <Box
        component="footer"
        sx={{
          backgroundColor: cardBackground,
          color: textPrimary,
          py: { xs: 10, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
              gap: 6,
            }}
          >
            <Box>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Sparkles size={26} color={accentMain} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    TaskFlow
                  </Typography>
                </Stack>
                <Typography sx={{ color: textSecondary }}>
                  The slate-inspired operating system for product, operations, and agency teams.
                </Typography>
              </Stack>
            </Box>
            {footerColumns.map((column) => (
              <Box key={column.title}>
                <Typography sx={{ fontWeight: 600, mb: 2 }}>{column.title}</Typography>
                <Stack spacing={1.5}>
                  {column.links.map((link) => (
                    <MuiLink
                      key={link.label}
                      href={link.href}
                      underline="none"
                      sx={{ color: textSecondary, "&:hover": { color: accentMain } }}
                    >
                      {link.label}
                    </MuiLink>
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
          <Divider sx={{ my: 4, borderColor: dividerColor }} />
          <Typography align="center" sx={{ color: textSecondary }}>
            © {new Date().getFullYear()} TaskFlow. Built worldwide.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
