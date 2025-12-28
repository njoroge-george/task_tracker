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
import { useTheme, alpha } from "@mui/material/styles";
import ThemeToggle from "@/components/ThemeToggle";
import Testimonials from "@/components/landing/Testimonials";

type FeatureItem = {
  title: string;
  description: string;
  icon: typeof Zap;
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
  },
  {
    title: "Team Collaboration",
    description:
      "Work together seamlessly with comments, mentions, and real-time notifications.",
    icon: Users,
  },
  {
    title: "Analytics & Reports",
    description:
      "Track progress with detailed analytics, charts, and productivity insights.",
    icon: BarChart3,
  },
  {
    title: "Task Management",
    description:
      "Create, assign, and track tasks with priorities, deadlines, and subtasks.",
    icon: CheckCircle2,
  },
  {
    title: "Enterprise Security",
    description:
      "Bank-level encryption, SSO, and advanced permission controls.",
    icon: Shield,
  },
  {
    title: "Integrations",
    description:
      "Connect with Slack, GitHub, Google Drive, and 100+ other tools.",
    icon: Zap,
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
  const theme = useTheme();
  const valuesGradient = `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.main} 100%)`;
  const valuesContrast = theme.palette.getContrastText(theme.palette.primary.dark);
  const ctaGradient = `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.light} 100%)`;
  const ctaContrast = theme.palette.getContrastText(theme.palette.primary.main);
  const heroBodyColor =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.common.white, 0.82)
      : alpha(theme.palette.text.primary, 0.85);
  const heroCaptionColor =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.common.white, 0.7)
      : alpha(theme.palette.text.secondary, 0.75);
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const cardBackground = theme.palette.background.paper;
  const dividerColor = alpha(theme.palette.divider, 0.6);
  const accentMain = theme.palette.primary.main;
  const successColor = theme.palette.success.main;
  const warningColor = theme.palette.warning.main;
  const errorColor = theme.palette.error.main;
  const infoColor = theme.palette.info.main;
  const landingBackground =
    theme.palette.mode === "dark"
      ? "linear-gradient(180deg, #010617 0%, #041233 45%, #071a48 100%)"
      : "linear-gradient(180deg, #ffffff 0%, #f7f8ff 35%, #e6edff 70%, #dae2ff 100%)";
  const heroGlow =
    theme.palette.mode === "dark"
      ? "radial-gradient(circle at top, rgba(79,70,229,0.4), transparent 55%)"
      : "radial-gradient(circle at top, rgba(79,70,229,0.15), rgba(255,255,255,0.9) 60%)";
  const heroGradientText =
    "linear-gradient(110deg, #c084fc, #a5b4fc, #60a5fa)";
  const featuresBackground =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.background.default, 0.75)
      : "rgba(255, 255, 255, 0.9)";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: landingBackground,
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
          backgroundColor: alpha(theme.palette.background.default, 0.9),
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
            <Zap size={32} color={accentMain} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: textPrimary }}
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
                  color: textPrimary,
                  fontWeight: 500,
                  transition: "color 0.2s",
                  "&:hover": {
                    color: accentMain,
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
              sx={{ 
                display: { xs: "none", sm: "inline-flex" },
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  color: accentMain,
                },
              }}
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
                transition: "all 0.3s ease",
                boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 8px 20px 0 rgba(0, 0, 0, 0.2)",
                },
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
          backgroundImage: heroGlow,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Typography
              component="h1"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.02em",
                fontSize: {
                  xs: "2.75rem",
                  sm: "3.5rem",
                  md: "4rem",
                  lg: "4.5rem",
                },
                lineHeight: 1.1,
              }}
            >
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  backgroundImage: heroGradientText,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Manage Your Tasks
              </Box>
              <br />
              <Box
                component="span"
                sx={{
                  color: theme.palette.mode === "dark" ? "#b1c8ff" : accentMain,
                  textShadow: "0 8px 24px rgba(15, 23, 42, 0.35)",
                }}
              >
                Like Never Before
              </Box>
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: heroBodyColor,
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
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
                  background: `linear-gradient(135deg, ${accentMain} 0%, ${theme.palette.primary.dark} 100%)`,
                  "&:hover": {
                    transform: "translateY(-4px) scale(1.02)",
                    boxShadow: "0 20px 35px -5px rgba(0, 0, 0, 0.25)",
                    "& .MuiButton-endIcon": {
                      transform: "translateX(4px)",
                    },
                  },
                  "& .MuiButton-endIcon": {
                    transition: "transform 0.3s ease",
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
                  px: { xs: 4, sm: 5 },
                  py: { xs: 2, sm: 2.5 },
                  fontSize: "1.1rem",
                  transition: "all 0.3s ease",
                  borderWidth: 2,
                  "&:hover": {
                    transform: "translateY(-4px)",
                    borderWidth: 2,
                    backgroundColor: alpha(accentMain, 0.1),
                    boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.15)",
                  },
                }}
              >
                Watch Demo
              </Button>
            </Stack>

            <Typography
              variant="body2"
              sx={{ color: heroCaptionColor }}
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
          backgroundColor: featuresBackground,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3} textAlign="center" mb={8}>
            <Typography
              component="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "2.5rem", md: "3rem" },
                color: textPrimary,
              }}
            >
              Everything You Need to Succeed
            </Typography>
            <Typography
              sx={{
                color: textSecondary,
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
            {featureItems.map((feature, index) => {
              const Icon = feature.icon;
              const paletteColor = [accentMain, successColor, warningColor, infoColor, errorColor][
                index % 5
              ];
              const iconBg = alpha(paletteColor, 0.2);
              return (
                <Card
                  key={feature.title}
                  sx={{
                    height: "100%",
                    borderWidth: 2,
                    borderColor: 'none',
                    backgroundColor: cardBackground,
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: accentMain,
                      transform: "translateY(-12px) scale(1.02)",
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                      "& .feature-icon": {
                        transform: "scale(1.1) rotate(5deg)",
                      },
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      className="feature-icon"
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                        backgroundColor: iconBg,
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      <Icon size={28} color={paletteColor} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, mb: 1.5 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography sx={{ color: textSecondary }}>
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
                color: textPrimary,
              }}
            >
              Simple, Transparent Pricing
            </Typography>
            <Typography sx={{ color: textSecondary }}>
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
                    ? accentMain
                    : 'none',
                  transform: plan.highlighted ? "scale(1.02)" : "none",
                  boxShadow: plan.highlighted
                    ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    : "none",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  "&:hover": {
                    transform: plan.highlighted
                      ? "scale(1.06) translateY(-8px)"
                      : "translateY(-10px) scale(1.02)",
                    boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.25)",
                    borderColor: accentMain,
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
                          color: textPrimary,
                        }}
                      >
                        {plan.name}
                      </Typography>
                      <Typography sx={{ color: textSecondary }}>
                        {plan.description}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "2.5rem",
                          fontWeight: 700,
                          color: textPrimary,
                        }}
                      >
                        {plan.price}
                      </Typography>
                      {plan.period && (
                        <Typography
                          component="span"
                          sx={{
                            ml: 1,
                            color: textSecondary,
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
                      sx={{ 
                        width: "100%",
                        py: 1.5,
                        transition: "all 0.3s ease",
                        ...(plan.ctaVariant === "contained" && {
                          boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.1)",
                          background: `linear-gradient(135deg, ${accentMain} 0%, ${theme.palette.primary.dark} 100%)`,
                        }),
                        "&:hover": {
                          transform: "translateY(-3px)",
                          boxShadow: plan.ctaVariant === "contained" 
                            ? "0 10px 25px 0 rgba(0, 0, 0, 0.2)"
                            : "0 5px 15px 0 rgba(0, 0, 0, 0.1)",
                        },
                      }}
                    >
                      {plan.ctaLabel}
                    </Button>

                    <Stack spacing={2}>
                      {plan.features.map((feature) => (
                        <Stack key={feature} direction="row" spacing={2}>
                          <CheckCircle2
                            size={20}
                            color={successColor}
                          />
                          <Typography
                            sx={{ color: textSecondary }}
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
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2} textAlign="center" mb={6}>
            <Typography
              component="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "2.5rem", md: "3rem" },
                color: textPrimary,
              }}
            >
              Loved by Teams Worldwide
            </Typography>
            <Typography sx={{ color: textSecondary }}>
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
                    color: textPrimary,
                  }}
                >
                  About TaskFlow
                </Typography>
                <Typography sx={{ color: textSecondary }}>
                  Founded in 2023, TaskFlow was born from a simple idea: project
                  management shouldn&apos;t be complicated. We&apos;ve built a
                  platform that combines powerful features with an intuitive
                  interface.
                </Typography>
                <Typography sx={{ color: textSecondary }}>
                  Our mission is to help teams of all sizes work more
                  efficiently, collaborate seamlessly, and deliver projects on
                  time. With over 10,000 teams worldwide trusting TaskFlow,
                  we&apos;re just getting started.
                </Typography>
                <Typography sx={{ color: textSecondary }}>
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
                          color: accentMain,
                        }}
                      >
                        {metric.value}
                      </Typography>
                      <Typography sx={{ color: textSecondary }}>
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
                  color: valuesContrast,
                  backgroundImage: valuesGradient,
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
          backgroundImage: ctaGradient,
          color: ctaContrast,
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
                  px: 5,
                  py: 2,
                  backgroundColor: theme.palette.common.white,
                  color: accentMain,
                  boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.3)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.common.white, 0.95),
                    transform: "translateY(-5px) scale(1.02)",
                    boxShadow: "0 20px 40px -5px rgba(0, 0, 0, 0.4)",
                    "& .MuiButton-endIcon": {
                      transform: "translateX(5px)",
                    },
                  },
                  "& .MuiButton-endIcon": {
                    transition: "transform 0.3s ease",
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
                  px: 5,
                  py: 2,
                  borderWidth: 2,
                  borderColor: alpha(theme.palette.common.white, 0.7),
                  color: theme.palette.common.white,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.common.white, 0.15),
                    borderColor: theme.palette.common.white,
                    borderWidth: 2,
                    transform: "translateY(-5px)",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
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
          backgroundColor: cardBackground,
          color: textPrimary,
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
                  <Zap size={28} color={accentMain} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    TaskFlow
                  </Typography>
                </Stack>
                <Typography sx={{ color: textSecondary }}>
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
                    color: textPrimary,
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
                        color: textSecondary,
                        fontSize: "0.95rem",
                        "&:hover": {
                          color: accentMain,
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
              borderColor: 'none',
            }}
          />

          <Typography
            align="center"
            sx={{ color: textSecondary }}
          >
            &copy; 2025 TaskFlow. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
