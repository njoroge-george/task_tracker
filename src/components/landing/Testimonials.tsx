"use client";

import { Box, Card, CardContent, Typography, Avatar } from "@mui/material";
import Image from "next/image";

const testimonials = [
  { 
    text: "TaskFlow has completely transformed how our team manages projects. The AI suggestions are incredibly accurate!", 
    author: "Mark Thompson",
    role: "Product Manager",
    company: "TechCorp",
    avatar: "https://i.pravatar.cc/150?img=12",
    rating: 5
  },
  { 
    text: "The best project management tool I've used this year! The interface is intuitive and the features are powerful.", 
    author: "Sarah Chen",
    role: "Engineering Lead",
    company: "StartupXYZ",
    avatar: "https://i.pravatar.cc/150?img=45",
    rating: 5
  },
  { 
    text: "Clean UI, powerful features, and excellent team collaboration tools. Highly recommended!", 
    author: "Daniel Rodriguez",
    role: "CTO",
    company: "InnovateLabs",
    avatar: "https://i.pravatar.cc/150?img=33",
    rating: 5
  },
  { 
    text: "I recommend TaskFlow to all my colleagues. It's made remote work so much more efficient.", 
    author: "Martha Williams",
    role: "Operations Director",
    company: "GlobalTech",
    avatar: "https://i.pravatar.cc/150?img=47",
    rating: 5
  },
  { 
    text: "A must-have for productivity. The Kanban boards and analytics are game-changers!", 
    author: "Kevin Patel",
    role: "Scrum Master",
    company: "AgileWorks",
    avatar: "https://i.pravatar.cc/150?img=52",
    rating: 5
  },
  { 
    text: "Very smooth, powerful, and the customer support is outstanding. Worth every penny!", 
    author: "Alicia Johnson",
    role: "Project Coordinator",
    company: "CreativeStudio",
    avatar: "https://i.pravatar.cc/150?img=38",
    rating: 5
  },
];

export default function TestimonialCarousel() {
  const radius = 400; // distance from center (3D depth)
  const itemCount = testimonials.length;
  const angleStep = 360 / itemCount;

  return (
    <Box
      sx={{
        perspective: "1200px",
        width: "100%",
        height: 450,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: 350,
          height: 280,
          transformStyle: "preserve-3d",
          animation: "spin 25s linear infinite",
          "@keyframes spin": {
            from: { transform: "rotateY(0deg)" },
            to: { transform: "rotateY(360deg)" },
          },
          "&:hover": {
            animationPlayState: "paused",
            cursor: "pointer",
          },
        }}
      >
        {testimonials.map((testimonial, i) => (
          <Card
            key={i}
            sx={{
              position: "absolute",
              width: 320,
              height: 240,
              top: "50%",
              left: "50%",
              transformStyle: "preserve-3d",
              transform: `
                rotateY(${i * angleStep}deg)
                translateZ(${radius}px)
                translate(-50%, -50%)
              `,
              borderRadius: 3,
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "background.paper",
              p: 3,
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 15px 50px rgba(0,0,0,0.3)",
                transform: `
                  rotateY(${i * angleStep}deg)
                  translateZ(${radius + 20}px)
                  translate(-50%, -50%)
                  scale(1.05)
                `,
              },
            }}
          >
            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
              {/* Rating Stars */}
              <Box sx={{ display: "flex", gap: 0.5, mb: 2 }}>
                {[...Array(testimonial.rating)].map((_, index) => (
                  <Box
                    key={index}
                    component="span"
                    sx={{ color: "#FFD700", fontSize: "18px" }}
                  >
                    ★
                  </Box>
                ))}
              </Box>

              {/* Testimonial Text */}
              <Typography 
                variant="body2" 
                fontStyle="italic"
                sx={{ 
                  mb: 2,
                  lineHeight: 1.6,
                  color: "text.secondary",
                  fontSize: "0.9rem",
                }}
              >
                "{testimonial.text}"
              </Typography>

              {/* Author Info */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: "auto" }}>
                <Avatar
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  sx={{ 
                    width: 48, 
                    height: 48,
                    border: "2px solid",
                    borderColor: "primary.main",
                  }}
                />
                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    sx={{ color: "text.primary", lineHeight: 1.2 }}
                  >
                    {testimonial.author}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", display: "block" }}
                  >
                    {testimonial.role}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "primary.main", fontWeight: 500 }}
                  >
                    {testimonial.company}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
