"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Stack, Typography, Button, Card, CardContent } from "@mui/material";
import { keyframes } from "@mui/system";
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Product Manager",
    company: "TechCorp Inc",
    content:
      "TaskTracker has completely transformed how our team manages projects. The intuitive interface and powerful features make it indispensable for our daily workflow.",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Engineering Lead",
    company: "StartupXYZ",
    content:
      "The best task management tool we've used. Real-time collaboration and beautiful UI make it a joy to use every day.",
    rating: 5,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Design Director",
    company: "Creative Studios",
    content:
      "Finally, a tool that understands the needs of creative teams. The kanban boards and visual project tracking are phenomenal.",
    rating: 5,
  },
  {
    id: 4,
    name: "David Park",
    role: "CEO",
    company: "Growth Labs",
    content:
      "TaskTracker helped us scale from 5 to 50 people seamlessly. The analytics and reporting features are game-changing.",
    rating: 5,
  },
  {
    id: 5,
    name: "Lisa Anderson",
    role: "Marketing Manager",
    company: "BrandCo",
    content:
      "Our team's productivity increased by 40% after switching to TaskTracker. The notifications and integrations are perfect.",
    rating: 5,
  },
];

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.25); opacity: 0.55; }
  100% { transform: scale(1); opacity: 1; }
`;

export default function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const visibleTestimonials = useMemo(() => {
    const visible = [];
    for (let offset = -1; offset <= 1; offset += 1) {
      const index =
        (currentIndex + offset + testimonials.length) % testimonials.length;
      visible.push({
        ...testimonials[index],
        position: offset,
        isActive: offset === 0,
      });
    }
    return visible;
  }, [currentIndex]);

  const handleGoToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        py: { xs: 8, md: 10 },
        backgroundImage:
          "linear-gradient(to bottom, transparent 0%, rgba(var(--accent-primary), 0.08) 50%, transparent 100%)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{
            px: 2,
            py: 1,
            borderRadius: 999,
            backgroundColor: "rgba(var(--accent-primary), 0.16)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: isAutoPlaying
                ? "rgb(var(--status-success))"
                : "rgba(var(--foreground-muted), 0.6)",
              animation: isAutoPlaying ? `${pulse} 1.6s ease-in-out infinite` : "none",
            }}
          />
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, color: "rgb(var(--foreground))" }}
          >
            {isAutoPlaying ? "Auto-playing" : "Paused"}
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          position: "relative",
          height: { xs: 360, md: 380 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AnimatePresence initial={false}>
          {visibleTestimonials.map((testimonial) => (
            <Box
              key={`${testimonial.id}-${testimonial.position}`}
              component={motion.div}
              initial={{
                x: testimonial.position * 280,
                scale: testimonial.isActive ? 0.9 : 0.75,
                opacity: testimonial.isActive ? 0.8 : 0.2,
                filter: testimonial.isActive ? "none" : "blur(4px)",
              }}
              animate={{
                x: testimonial.position * 280,
                scale: testimonial.isActive ? 1 : 0.8,
                opacity: testimonial.isActive ? 1 : 0.35,
                filter: testimonial.isActive ? "none" : "blur(2px)",
              }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: testimonial.isActive ? 2 : 1,
              }}
            >
              <Card
                sx={{
                  maxWidth: 640,
                  border: testimonial.isActive
                    ? "2px solid rgb(var(--accent-primary))"
                    : "1px solid rgba(var(--border), 0.5)",
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark" ? "#1f2937" : "#fff",
                  boxShadow: (theme) =>
                    testimonial.isActive
                      ? theme.shadows[12]
                      : theme.shadows[4],
                  transition: "box-shadow 0.6s ease",
                }}
              >
                <CardContent sx={{ p: { xs: 4, md: 5 } }}>
                  <Stack spacing={3}>
                    <Stack direction="row" spacing={1}
                      component={motion.div}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                    >
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          size={20}
                          style={{
                            fill:
                              starIndex < testimonial.rating
                                ? "rgb(250, 204, 21)"
                                : "rgba(var(--border), 0.6)",
                            color:
                              starIndex < testimonial.rating
                                ? "rgb(250, 204, 21)"
                                : "rgba(var(--border), 0.6)",
                          }}
                        />
                      ))}
                    </Stack>

                    <Typography
                      component={motion.p}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 }}
                      sx={{
                        color: "rgb(var(--foreground))",
                        fontSize: "1.125rem",
                        fontStyle: "italic",
                        lineHeight: 1.7,
                      }}
                    >
                      “{testimonial.content}”
                    </Typography>

                    <Stack direction="row" spacing={2} alignItems="center"
                      component={motion.div}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18 }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          backgroundColor: "rgb(var(--accent-primary))",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "1.25rem",
                        }}
                      >
                        {testimonial.name.charAt(0)}
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "rgb(var(--foreground))",
                          }}
                        >
                          {testimonial.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "rgb(var(--foreground-secondary))" }}
                        >
                          {testimonial.role} at {testimonial.company}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
        </AnimatePresence>
      </Box>

      <Stack
        direction="row"
        spacing={1.5}
        justifyContent="center"
        alignItems="center"
        sx={{ mt: 6 }}
      >
        {testimonials.map((_, index) => (
          <Box
            key={index}
            component="button"
            type="button"
            onClick={() => handleGoToSlide(index)}
            aria-label={`Go to testimonial ${index + 1}`}
            sx={{
              width: index === currentIndex ? 32 : 12,
              height: 12,
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              backgroundColor:
                index === currentIndex
                  ? "rgb(var(--accent-primary))"
                  : "rgba(var(--foreground-muted), 0.4)",
              "&:hover": {
                backgroundColor: "rgba(var(--accent-primary), 0.65)",
              },
            }}
          />
        ))}
      </Stack>

      <Stack justifyContent="center" alignItems="center" mt={3}>
        <Button
          variant="text"
          size="small"
          onClick={() => setIsAutoPlaying((prev) => !prev)}
          sx={{ color: "rgb(var(--foreground-secondary))" }}
        >
          {isAutoPlaying ? "⏸ Pause" : "▶ Play"}
        </Button>
      </Stack>
    </Box>
  );
}
