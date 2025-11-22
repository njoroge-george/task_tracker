'use client';

import NextLink from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  Users,
  BarChart3,
  Shield,
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
import ThemeToggle from "@/components/ThemeToggle";
import Testimonials from "@/components/landing/Testimonials";

type FeatureItem = {
  title: string;
  description: string;
  icon: typeof Zap;
  iconBg: string;
  iconColor: string;
};

type PricingPlan = {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  // MUI variants
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

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "About", href: "#about" },
];

const featureItems: FeatureItem[] = [
  {
    title: "Kanban Boards",
    description:
      "Drag-and-drop task management with customizable columns and real-time updates.",
    icon: Zap,
    iconBg: "rgba(var(--accent-secondary), 0.24)",
    iconColor: "rgb(var(--accent-primary))",
  },
  {
    title: "Team Collaboration",
    description:
      "Work together seamlessly with comments, mentions, and real-time notifications.",
    icon: Users,
    iconBg: "rgba(var(--status-success), 0.20)",
    iconColor: "rgb(var(--status-success))",
  },
  {
    title: "Analytics & Reports",
    description:
      "Track progress with detailed analytics, charts, and productivity insights.",
    icon: BarChart3,
    iconBg: "rgba(var(--accent-secondary), 0.24)",
    iconColor: "rgb(var(--accent-primary))",
  },
  {
    title: "Task Management",
    description:
      "Create, assign, and track tasks with priorities, deadlines, and subtasks.",
    icon: CheckCircle2,
    iconBg: "rgba(var(--status-warning), 0.20)",
    iconColor: "rgb(var(--status-warning))",
  },
  {
    title: "Enterprise Security",
    description:
      "Bank-level encryption, SSO, and advanced permission controls.",
    icon: Shield,
    iconBg: "rgba(var(--status-error), 0.20)",
    iconColor: "rgb(var(--status-error))",
  },
  {
    title: "Integrations",
    description:
      "Connect with Slack, GitHub, Google Drive, and 100+ other tools.",
    icon: Zap,
    iconBg: "rgba(var(--status-info), 0.20)",
    iconColor: "rgb(var(--status-info))",
  },
];

const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for individuals",
    features: [
      "Up to 3 projects",
      "Unlimited tasks",
      "Basic analytics",
      "1 workspace",
    ],
    ctaLabel: "Get Started",
    ctaHref: "/auth/signin",
  ctaVariant: "outlined",
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "For growing teams",
    features: [
      "Unlimited projects",
      "Unlimited tasks",
      "Advanced analytics",
      "5 workspaces",
      "Priority support",
      "Custom integrations",
    ],
    ctaLabel: "Start Free Trial",
    ctaHref: "/auth/signin",
  ctaVariant: "contained",
    highlighted: true,
    highlightLabel: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "Unlimited workspaces",
      "Advanced security (SSO)",
      "Dedicated support",
      "Custom contracts",
      "SLA guarantee",
    ],
    ctaLabel: "Contact Sales",
    ctaHref: "/auth/signin",
  ctaVariant: "outlined",
  },
];

const metrics: Metric[] = [
  { value: "10,000+", label: "Active Teams" },
  { value: "50M+", label: "Tasks Completed" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9/5", label: "User Rating" },
];

const values: ValueStatement[] = [
  {
    title: "Customer First",
    description: "Every decision we make prioritizes user experience.",
  },
  {
    title: "Innovation",
    description: "We continuously evolve and improve our platform.",
  },
  {
    title: "Transparency",
    description: "Clear pricing, honest communication, no hidden fees.",
  },
  {
    title: "Security",
    description: "Your data is protected with enterprise-grade security.",
  },
];

const footerColumns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Integrations", href: "#" },
      { label: "API", href: "#" },
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
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
];

export default function LandingPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage:
          "linear-gradient(to bottom, rgb(var(--background)) 0%, rgb(var(--background-secondary)) 100%)",
      }}
    >
      <Box
        component="nav"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          borderBottom: "1px solid rgb(var(--border))",
          backgroundColor: "rgba(var(--background), 0.85)",
          backdropFilter: "blur(16px)",
          zIndex: 1100,
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Zap size={32} color="rgb(var(--accent-primary))" />
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "rgb(var(--foreground))" }}
            >
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
                  color: "rgb(var(--foreground))",
                  fontWeight: 500,
                  transition: "color 0.2s",
                  "&:hover": {
                    color: "rgb(var(--accent-primary))",
                  },
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
              sx={{ display: { xs: "none", sm: "inline-flex" } }}
            >
              Sign In
            </Button>
            <Button
              component={NextLink}
              href="/auth/signin"
              size="small"
              variant="contained"
              sx={{
                px: 3,
              }}
            >
              Get Started
            </Button>
          </Stack>
        </Container>
      </Box>

      <Box
        component="section"
        sx={{
          pt: { xs: 16, md: 20 },
          pb: { xs: 14, md: 18 },
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Typography
              component="h1"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "rgb(var(--foreground))",
                fontSize: {
                  xs: "2.75rem",
                  sm: "3.5rem",
                  md: "4rem",
                  lg: "4.5rem",
                },
                lineHeight: 1.1,
              }}
            >
              Manage Your Tasks
              <br />
              <Box
                component="span"
                sx={{ color: "rgb(var(--accent-primary))" }}
              >
                Like Never Before
              </Box>
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: "rgb(var(--foreground-secondary))",
                maxWidth: 720,
              }}
            >
              A professional productivity tracker that helps teams collaborate,
              organize, and deliver projects faster. Streamline your workflow
              with powerful features and intuitive design.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
            >
              <Button
                component={NextLink}
                href="/auth/signin"
                size="large"
                endIcon={<ArrowRight size={20} />}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  px: { xs: 4, sm: 5 },
                  py: { xs: 2, sm: 2.5 },
                  fontSize: "1.1rem",
                }}
              >
                Start Free Trial
              </Button>
              <Button
                size="large"
                variant="outlined"
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  px: { xs: 4, sm: 5 },
                  py: { xs: 2, sm: 2.5 },
                  fontSize: "1.1rem",
                }}
              >
                Watch Demo
              </Button>
            </Stack>

            <Typography
              variant="body2"
              sx={{ color: "rgb(var(--foreground-muted))" }}
            >
              No credit card required • 14-day free trial
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Box
        component="section"
        id="features"
        sx={{
          py: { xs: 12, md: 16 },
          backgroundColor: "rgb(var(--background))",
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3} textAlign="center" mb={8}>
            <Typography
              component="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "2.5rem", md: "3rem" },
                color: "rgb(var(--foreground))",
              }}
            >
              Everything You Need to Succeed
            </Typography>
            <Typography
              sx={{
                color: "rgb(var(--foreground-secondary))",
                maxWidth: 640,
                mx: "auto",
              }}
            >
              Powerful features designed to boost productivity and streamline
              team collaboration.
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              },
              gap: 4,
            }}
          >
            {featureItems.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  sx={{
                    height: "100%",
                    borderWidth: 2,
                    borderColor: "rgba(var(--border), 0.6)",
                    backgroundColor: "rgb(var(--card-background))",
                    transition: "transform 0.25s, box-shadow 0.25s, border-color 0.25s",
                    "&:hover": {
                      borderColor: "rgb(var(--accent-primary))",
                      transform: "translateY(-6px)",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                        backgroundColor: feature.iconBg,
                      }}
                    >
                      <Icon size={28} color={feature.iconColor} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, mb: 1.5 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      sx={{ color: "rgb(var(--foreground-secondary))" }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Container>
      </Box>

      <Box
        component="section"
        id="pricing"
        sx={{
          py: { xs: 12, md: 16 },
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2} textAlign="center" mb={8}>
            <Typography
              component="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "2.5rem", md: "3rem" },
                color: "rgb(var(--foreground))",
              }}
            >
              Simple, Transparent Pricing
            </Typography>
            <Typography sx={{ color: "rgb(var(--foreground-secondary))" }}>
              Choose the perfect plan for your team
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(3, 1fr)',
              },
              gap: 4,
            }}
          >
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                sx={{
                  position: "relative",
                  height: "100%",
                  borderWidth: plan.highlighted ? 3 : 2,
                  borderColor: plan.highlighted
                    ? "rgb(var(--accent-primary))"
                    : "rgba(var(--border), 0.6)",
                  transform: plan.highlighted ? "scale(1.02)" : "none",
                  boxShadow: plan.highlighted
                    ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    : "none",
                  transition: "transform 0.25s, box-shadow 0.25s",
                  "&:hover": {
                    transform: plan.highlighted
                      ? "scale(1.04)"
                      : "translateY(-6px)",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  },
                }}
              >
                {plan.highlighted && plan.highlightLabel && (
                  <Chip
                    label={plan.highlightLabel}
                    color="primary"
                    sx={{
                      position: "absolute",
                      top: -16,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontWeight: 600,
                    }}
                  />
                )}
                <CardContent sx={{ p: 5 }}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: "rgb(var(--foreground))",
                        }}
                      >
                        {plan.name}
                      </Typography>
                      <Typography
                        sx={{ color: "rgb(var(--foreground-secondary))" }}
                      >
                        {plan.description}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "2.5rem",
                          fontWeight: 700,
                          color: "rgb(var(--foreground))",
                        }}
                      >
                        {plan.price}
                      </Typography>
                      {plan.period && (
                        <Typography
                          component="span"
                          sx={{
                            ml: 1,
                            color: "rgb(var(--foreground-secondary))",
                          }}
                        >
                          {plan.period}
                        </Typography>
                      )}
                    </Box>

                    <Button
                      component={NextLink}
                      href={plan.ctaHref}
                      variant={plan.ctaVariant}
                      sx={{ width: "100%" }}
                    >
                      {plan.ctaLabel}
                    </Button>

                    <Stack spacing={2}>
                      {plan.features.map((feature) => (
                        <Stack key={feature} direction="row" spacing={2}>
                          <CheckCircle2
                            size={20}
                            color="rgb(var(--status-success))"
                          />
                          <Typography
                            sx={{ color: "rgb(var(--foreground-secondary))" }}
                          >
                            {feature}
                          </Typography>
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

      <Box
        component="section"
        id="testimonials"
        sx={{
          py: { xs: 12, md: 16 },
          backgroundColor: "rgb(var(--background))",
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2} textAlign="center" mb={6}>
            <Typography
              component="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "2.5rem", md: "3rem" },
                color: "rgb(var(--foreground))",
              }}
            >
              Loved by Teams Worldwide
            </Typography>
            <Typography sx={{ color: "rgb(var(--foreground-secondary))" }}>
              See what our customers have to say
            </Typography>
          </Stack>

          <Testimonials />
        </Container>
      </Box>

      <Box
        component="section"
        id="about"
        sx={{
          py: { xs: 12, md: 16 },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
              },
              gap: 6,
              alignItems: 'center',
            }}
          >
            <Box>
              <Stack spacing={3}>
                <Typography
                  component="h2"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "2.5rem", md: "3rem" },
                    color: "rgb(var(--foreground))",
                  }}
                >
                  About TaskFlow
                </Typography>
                <Typography sx={{ color: "rgb(var(--foreground-secondary))" }}>
                  Founded in 2023, TaskFlow was born from a simple idea: project
                  management shouldn&apos;t be complicated. We&apos;ve built a
                  platform that combines powerful features with an intuitive
                  interface.
                </Typography>
                <Typography sx={{ color: "rgb(var(--foreground-secondary))" }}>
                  Our mission is to help teams of all sizes work more
                  efficiently, collaborate seamlessly, and deliver projects on
                  time. With over 10,000 teams worldwide trusting TaskFlow,
                  we&apos;re just getting started.
                </Typography>
                <Typography sx={{ color: "rgb(var(--foreground-secondary))" }}>
                  We believe in transparency, innovation, and putting our
                  customers first. Every feature we build is designed with real
                  user feedback and tested with real teams.
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 3,
                  }}
                >
                  {metrics.map((metric) => (
                    <Box key={metric.label}>
                      <Typography
                        sx={{
                          fontSize: "2rem",
                          fontWeight: 700,
                          color: "rgb(var(--accent-primary))",
                        }}
                      >
                        {metric.value}
                      </Typography>
                      <Typography
                        sx={{ color: "rgb(var(--foreground-secondary))" }}
                      >
                        {metric.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Stack>
            </Box>
            <Box>
              <Box
                sx={{
                  borderRadius: 3,
                  p: 5,
                  color: "#fff",
                  backgroundImage:
                    "linear-gradient(135deg, rgb(var(--color-primary-600)) 0%, rgb(var(--accent-secondary)) 100%)",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  Our Values
                </Typography>
                <Stack spacing={3}>
                  {values.map((value) => (
                    <Stack direction="row" spacing={2} key={value.title}>
                      <CheckCircle2 size={24} />
                      <Box>
                        <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                          {value.title}
                        </Typography>
                        <Typography sx={{ opacity: 0.85 }}>
                          {value.description}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box
        component="section"
        sx={{
          py: { xs: 12, md: 16 },
          backgroundImage:
            "linear-gradient(135deg, rgb(var(--color-primary-600)) 0%, rgb(var(--accent-secondary)) 100%)",
          color: "#fff",
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={3} textAlign="center" alignItems="center">
            <Typography
              component="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "2.5rem", md: "3rem" },
              }}
            >
              Ready to Transform Your Workflow?
            </Typography>
            <Typography sx={{ opacity: 0.9, maxWidth: 640 }}>
              Join thousands of teams already using TaskFlow to deliver better
              results.
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
            >
              <Button
                component={NextLink}
                href="/auth/signin"
                size="large"
                endIcon={<ArrowRight size={20} />}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  backgroundColor: "#fff",
                  color: "rgb(var(--accent-primary))",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.85)",
                  },
                }}
              >
                Start Free Trial
              </Button>
              <Button
                size="large"
                variant="outlined"
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  borderColor: "rgba(255,255,255,0.7)",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderColor: "#fff",
                  },
                }}
              >
                Schedule Demo
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          backgroundColor: "rgb(var(--card-background))",
          color: "rgb(var(--foreground))",
          py: { xs: 10, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 6,
            }}
          >
            <Box>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Zap size={28} color="rgb(var(--accent-primary))" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    TaskFlow
                  </Typography>
                </Stack>
                <Typography sx={{ color: "rgb(var(--foreground-secondary))" }}>
                  Professional task management for modern teams.
                </Typography>
              </Stack>
            </Box>

            {footerColumns.map((column) => (
              <Box key={column.title}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: "rgb(var(--foreground))",
                  }}
                >
                  {column.title}
                </Typography>
                <Stack spacing={1.5}>
                  {column.links.map((link) => (
                    <MuiLink
                      key={link.label}
                      href={link.href}
                      underline="none"
                      sx={{
                        color: "rgb(var(--foreground-secondary))",
                        fontSize: "0.95rem",
                        "&:hover": {
                          color: "rgb(var(--accent-primary))",
                        },
                      }}
                    >
                      {link.label}
                    </MuiLink>
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>

          <Divider
            sx={{
              mt: 6,
              mb: 3,
              borderColor: "rgba(var(--border), 0.6)",
            }}
          />

          <Typography
            align="center"
            sx={{ color: "rgb(var(--foreground-secondary))" }}
          >
            &copy; 2025 TaskFlow. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
