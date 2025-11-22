"use client";

import { Box, Card, CardContent, Typography } from "@mui/material";

const testimonials = [
  { text: "Amazing service! I improved my workflow instantly!", author: "Mark" },
  { text: "The best tool I've used this year!", author: "Sarah" },
  { text: "Clean UI and very intuitive.", author: "Daniel" },
  { text: "I recommend it to all my friends.", author: "Martha" },
  { text: "A must-have for productivity.", author: "Kevin" },
  { text: "Very smooth and powerful.", author: "Alicia" },
];

export default function TestimonialCarousel() {
  const radius = 350; // distance from center (3D depth)
  const itemCount = testimonials.length;
  const angleStep = 360 / itemCount;

  return (
    <Box
      sx={{
        perspective: "1000px",
        width: "100%",
        height: 350,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: 300,
          height: 220,
          transformStyle: "preserve-3d",
          animation: "spin 20s linear infinite",
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
        {testimonials.map((t, i) => (
          <Card
            key={i}
            sx={{
              position: "absolute",
              width: 260,
              height: 160,
              top: "50%",
              left: "50%",
              transformStyle: "preserve-3d",
              transform: `
                rotateY(${i * angleStep}deg)
                translateZ(${radius}px)
                translate(-50%, -50%)
              `,
              borderRadius: 3,
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              backgroundColor: "background.paper",
              p: 2,
            }}
          >
            <CardContent>
              <Typography variant="body1" fontStyle="italic">
                "{t.text}"
              </Typography>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                mt={1}
                color="primary.main"
              >
                — {t.author}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
