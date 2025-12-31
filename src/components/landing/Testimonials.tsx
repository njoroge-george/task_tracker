"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { keyframes } from "@mui/system";
import { CheckCircle2, Quote } from "lucide-react";
import StarRating from "@/components/ui/star-rating";

type Testimonial = {
  text: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  verified?: boolean;
};

const testimonials: Testimonial[] = [
  {
    text:
      "TaskFlow has completely transformed how our team manages projects. The AI suggestions are incredibly accurate!",
    author: "Mark Thompson",
    role: "Product Manager",
    company: "TechCorp",
    avatar: "https://i.pravatar.cc/150?img=12",
    rating: 5,
    verified: true,
  },
  {
    text:
      "The best project management tool I've used this year! The interface is intuitive and the features are powerful.",
    author: "Sarah Chen",
    role: "Engineering Lead",
    company: "StartupXYZ",
    avatar: "https://i.pravatar.cc/150?img=45",
    rating: 5,
    verified: true,
  },
  {
    text:
      "Clean UI, powerful features, and excellent team collaboration tools. Highly recommended!",
    author: "Daniel Rodriguez",
    role: "CTO",
    company: "InnovateLabs",
    avatar: "https://i.pravatar.cc/150?img=33",
    rating: 5,
  },
  {
    text:
      "I recommend TaskFlow to all my colleagues. It's made remote work so much more efficient.",
    author: "Martha Williams",
    role: "Operations Director",
    company: "GlobalTech",
    avatar: "https://i.pravatar.cc/150?img=47",
    rating: 5,
  },
  {
    text:
      "A must-have for productivity. The Kanban boards and analytics are game-changers!",
    author: "Kevin Patel",
    role: "Scrum Master",
    company: "AgileWorks",
    avatar: "https://i.pravatar.cc/150?img=52",
    rating: 5,
    verified: true,
  },
  {
    text:
      "Very smooth, powerful, and the customer support is outstanding. Worth every penny!",
    author: "Alicia Johnson",
    role: "Project Coordinator",
    company: "CreativeStudio",
    avatar: "https://i.pravatar.cc/150?img=38",
    rating: 5,
  },
];

const scrollLeft = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const scrollRight = keyframes`
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
`;

const glowPulse = keyframes`
  0% { opacity: 0.35; transform: scale(0.9); }
  50% { opacity: 0.65; transform: scale(1.05); }
  100% { opacity: 0.35; transform: scale(0.9); }
`;

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export default function Testimonials() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const accent = isDark ? "#a5b4fc" : theme.palette.primary.main;
  const cardBg = alpha(isDark ? "#081020" : "#ffffff", isDark ? 0.92 : 0.95);
  // card border colors are derived per testimonial from the gradient palette
  const glowPalette = isDark
    ? ["#22d3ee", "#6366f1", "#f472b6", "#facc15"]
    : ["#2563eb", "#06b6d4", "#f43f5e", "#f97316"];
  const gradientBackground = `linear-gradient(120deg, ${glowPalette[0]}, ${glowPalette[1]}, ${glowPalette[2]}, ${glowPalette[3]})`;
  const sliderTestimonials = useMemo(() => [...testimonials, ...testimonials], []);
  const laneColors = glowPalette;
  const lanes = [
    { id: "lane-1", direction: "left" as const, duration: 55, delay: 0 },
    { id: "lane-2", direction: "right" as const, duration: 65, delay: -8 },
  ];

  return (
    <Box sx={{ position: "relative", py: { xs: 4, md: 5 }, overflow: "hidden" }}>
      <Box
        sx={{
          position: "absolute",
          inset: -100,
          borderRadius: "50%",
          background: gradientBackground,
          backgroundSize: "200% 200%",
          filter: "blur(120px)",
          opacity: isDark ? 0.45 : 0.5,
          animation: `${gradientFlow} 22s ease-in-out infinite`,
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: 4,
          background: `radial-gradient(circle at 15% 20%, ${alpha(accent, 0.25)}, transparent 60%)`,
          filter: "blur(70px)",
          animation: `${glowPulse} 16s ease-in-out infinite`,
          pointerEvents: "none",
        }}
      />
      <Stack spacing={4}>
        {lanes.map((lane, laneIndex) => (
          <Box
            key={lane.id}
            sx={{
              position: "relative",
              overflow: "hidden",
              maskImage:
                "linear-gradient(to right, transparent, rgba(0,0,0,0.85) 10%, rgba(0,0,0,0.85) 90%, transparent)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: { xs: 2, md: 3 },
                width: "max-content",
                animation: `${lane.direction === "left" ? scrollLeft : scrollRight} ${lane.duration}s linear infinite`,
                animationDelay: `${lane.delay}s`,
                "&:hover": { animationPlayState: "paused" },
              }}
            >
              {sliderTestimonials.map((t, itemIndex) => {
                const accentColor = laneColors[(itemIndex + laneIndex) % laneColors.length];
                return (
                <motion.div
                  key={`${lane.id}-${itemIndex}-${t.author}`}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.35 }}
                  style={{ minWidth: laneIndex === 0 ? 320 : 280 }}
                >
                  <Card
                    sx={{
                      minWidth: { xs: 260, md: laneIndex === 0 ? 360 : 320 },
                      borderRadius: 4,
                      position: "relative",
                      border: `1px solid ${alpha(accentColor, 0.7)}`,
                      backgroundColor: cardBg,
                      boxShadow: `0 25px 45px ${alpha("#000000", isDark ? 0.6 : 0.2)}, 0 0 25px ${alpha(accentColor, 0.45)}, 0 0 50px ${alpha(accentColor, 0.25)}`,
                      backdropFilter: "blur(16px)",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: -1,
                        borderRadius: "inherit",
                        padding: "1px",
                        background: `linear-gradient(135deg, ${accentColor}, ${
                          laneColors[(itemIndex + laneIndex + 1) % laneColors.length]
                        })`,
                        WebkitMask:
                          "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                        opacity: 0.7,
                      },
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        background: `linear-gradient(135deg, ${alpha(accentColor, 0.15)}, transparent 60%)`,
                        mixBlendMode: "screen",
                      },
                    }}
                  >
                    <CardContent sx={{ position: "relative" }}>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Quote size={18} color={accentColor} />
                          {t.verified && (
                            <Chip
                              label="Verified"
                              size="small"
                              icon={<CheckCircle2 size={14} color={accentColor} />}
                              sx={{
                                backgroundColor: alpha(accentColor, 0.15),
                                color: accentColor,
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </Stack>
                        <Typography
                          variant="body1"
                          sx={{
                            color: theme.palette.text.secondary,
                            lineHeight: 1.7,
                          }}
                        >
                          “{t.text}”
                        </Typography>
                        <StarRating value={t.rating} readonly size="md" />
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                          sx={{ mt: 1 }}
                        >
                          <Avatar
                            src={t.avatar}
                            alt={t.author}
                            sx={{
                              width: 48,
                              height: 48,
                              border: `2px solid ${accentColor}`,
                              boxShadow: `0 0 18px ${alpha(accentColor, 0.5)}`,
                            }}
                          />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {t.author}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: theme.palette.text.secondary, display: "block" }}
                            >
                              {t.role}
                            </Typography>
                            <Typography variant="caption" sx={{ color: accentColor, fontWeight: 600 }}>
                              {t.company}
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              )})}
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
