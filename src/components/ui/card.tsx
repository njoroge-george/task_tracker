"use client";
import * as React from "react";
import MuiCard, { type CardProps as MuiCardProps } from "@mui/material/Card";
import MuiCardContent, {
  type CardContentProps as MuiCardContentProps,
} from "@mui/material/CardContent";
import MuiCardActions, {
  type CardActionsProps as MuiCardActionsProps,
} from "@mui/material/CardActions";
import Box, { type BoxProps } from "@mui/material/Box";
import Typography, {
  type TypographyProps,
} from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";

const mergeSx = (
  base: SxProps<Theme>,
  extra?: SxProps<Theme>
): SxProps<Theme> => {
  const baseArray = Array.isArray(base) ? base : [base];
  const extraArray = extra
    ? Array.isArray(extra)
      ? extra
      : [extra]
    : [];
  return [...baseArray, ...extraArray];
};

export type CardProps = MuiCardProps;

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevation, variant, ...props }, ref) => (
    <MuiCard
      ref={ref}
      className={className}
      elevation={elevation ?? 0}
      variant={variant ?? "outlined"}
      {...props}
    />
  )
);
Card.displayName = "Card";

type HeaderProps = BoxProps<"div">;

const CardHeader = React.forwardRef<HTMLDivElement, HeaderProps>(
  ({ className, sx, ...props }, ref) => (
    <Box
      ref={ref}
      className={className}
      sx={mergeSx(
        (theme) => ({
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing(1),
          padding: theme.spacing(3),
          paddingBottom: theme.spacing(2),
        }),
        sx
      )}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

type TitleProps = TypographyProps<"h3">;

const CardTitle = React.forwardRef<HTMLHeadingElement, TitleProps>(
  ({ className, sx, ...props }, ref) => (
    <Typography
      ref={ref}
      className={className}
      variant="h6"
      component="h3"
      sx={mergeSx(
        {
          fontWeight: 600,
        },
        sx
      )}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

type DescriptionProps = TypographyProps<"p">;

const CardDescription = React.forwardRef<HTMLParagraphElement, DescriptionProps>(
  ({ className, sx, color, ...props }, ref) => (
    <Typography
      ref={ref}
      className={className}
      variant="body2"
      color={color ?? "text.secondary"}
      sx={sx}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

type ContentProps = MuiCardContentProps;

const CardContent = React.forwardRef<HTMLDivElement, ContentProps>(
  ({ className, sx, ...props }, ref) => (
    <MuiCardContent
      ref={ref}
      className={className}
      sx={mergeSx(
        (theme) => ({
          padding: theme.spacing(3),
          paddingTop: 0,
          "&:last-child": {
            paddingBottom: theme.spacing(3),
          },
        }),
        sx
      )}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

type FooterProps = MuiCardActionsProps;

const CardFooter = React.forwardRef<HTMLDivElement, FooterProps>(
  ({ className, sx, ...props }, ref) => (
    <MuiCardActions
      ref={ref}
      className={className}
      sx={mergeSx(
        (theme) => ({
          padding: theme.spacing(3),
          paddingTop: 0,
          display: "flex",
          alignItems: "center",
          gap: theme.spacing(2),
        }),
        sx
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
