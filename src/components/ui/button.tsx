"use client";
import * as React from "react";
import MuiButton, {
  type ButtonProps as MuiButtonProps,
} from "@mui/material/Button";
import type { SxProps, Theme } from "@mui/material/styles";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

type ButtonSize = "default" | "sm" | "lg" | "icon";

type VariantConfig = {
  muiVariant: MuiButtonProps["variant"];
  color: MuiButtonProps["color"];
  sx?: SxProps<Theme>;
};

type SizeConfig = {
  muiSize: NonNullable<MuiButtonProps["size"]>;
  sx?: SxProps<Theme>;
};

const variantConfig: Record<ButtonVariant, VariantConfig> = {
  default: {
    muiVariant: "contained",
    color: "primary",
  },
  destructive: {
    muiVariant: "contained",
    color: "error",
  },
  outline: {
    muiVariant: "outlined",
    color: "primary",
  },
  secondary: {
    muiVariant: "contained",
    color: "secondary",
  },
  ghost: {
    muiVariant: "text",
    color: "primary",
    sx: (theme) => ({
      backgroundColor: "transparent",
      "&:hover": {
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.08)"
            : "rgba(15, 23, 42, 0.05)",
      },
    }),
  },
  link: {
    muiVariant: "text",
    color: "primary",
    sx: {
      textDecoration: "underline",
      textUnderlineOffset: 4,
      fontWeight: 500,
      "&:hover": {
        textDecoration: "underline",
      },
    },
  },
};

const sizeConfig: Record<ButtonSize, SizeConfig> = {
  default: {
    muiSize: "medium",
  },
  sm: {
    muiSize: "small",
    sx: (theme) => ({
      fontSize: theme.typography.pxToRem(12),
      paddingInline: theme.spacing(1.5),
      minHeight: 32,
    }),
  },
  lg: {
    muiSize: "large",
    sx: (theme) => ({
      fontSize: theme.typography.pxToRem(16),
      paddingInline: theme.spacing(3),
      minHeight: 40,
    }),
  },
  icon: {
    muiSize: "medium",
    sx: (theme) => ({
      minWidth: 0,
      width: theme.spacing(4.5),
      height: theme.spacing(4.5),
      padding: 0,
      borderRadius: "50%",
    }),
  },
};

const toArray = (value?: SxProps<Theme>): SxProps<Theme>[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

export interface ButtonProps
  extends Omit<MuiButtonProps, "variant" | "color" | "size"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "default",
      size = "default",
      className,
      sx,
      ...props
    },
    ref
  ) => {
    const selectedVariant = variantConfig[variant];
    const selectedSize = sizeConfig[size];

    const combinedSx: SxProps<Theme> | undefined = (() => {
      const merged = [
        ...toArray(selectedVariant.sx),
        ...toArray(selectedSize.sx),
        ...toArray(sx),
      ];
      return merged.length > 0 ? (merged as unknown as SxProps<Theme>) : undefined;
    })();

    const muiSize =
      size === "icon" ? selectedSize.muiSize : selectedSize.muiSize;

    return (
      <MuiButton
        ref={ref}
        className={className}
        variant={selectedVariant.muiVariant}
        color={selectedVariant.color}
        size={muiSize}
        sx={combinedSx}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
