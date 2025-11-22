# 🎨 Theme System Quick Reference Guide

## Color Utility Classes

### Backgrounds
```tsx
<div className="bg-primary">       {/* Main background */}
<div className="bg-secondary">     {/* Hover/secondary background */}
<div className="bg-tertiary">      {/* Tertiary background */}
<div className="bg-card">          {/* Card/elevated surfaces */}
```

### Text
```tsx
<p className="text-primary">       {/* Primary text (high contrast) */}
<p className="text-secondary">     {/* Secondary text (lower contrast) */}
<p className="text-accent">        {/* Accent color text */}
```

### Borders
```tsx
<div className="border-default">   {/* Standard border color */}
```

### Accents & CTAs
```tsx
<button className="bg-accent">                 {/* Primary action */}
<button className="bg-accent hover:bg-accent-hover">  {/* With hover */}
<div className="bg-accent-secondary">          {/* Light accent background */}
```

### Status Colors
```tsx
<span className="text-status-success">         {/* Green - Success */}
<span className="text-status-warning">         {/* Orange - Warning */}
<span className="text-status-error">           {/* Red - Error */}
<span className="text-status-info">            {/* Blue - Info */}

<div className="bg-status-success-light">      {/* Success background */}
<div className="bg-status-warning-light">      {/* Warning background */}
<div className="bg-status-error-light">        {/* Error background */}
<div className="bg-status-info-light">         {/* Info background */}
```

## React Hook Usage

```typescript
import { useTheme } from '@/theme';

function MyComponent() {
  const { colors, isDark, isLight, theme, setTheme } = useTheme();
  
  // Access colors programmatically
  const bgColor = colors.background.primary;
  const textColor = colors.text.primary;
  const accentColor = colors.accent[500];
  
  // Check theme
  if (isDark) {
    // Dark mode specific logic
  }
  
  // Change theme
  setTheme('dark'); // or 'light' or 'system'
  
  return <div style={{ backgroundColor: bgColor }}>...</div>;
}
```

## Common Patterns

### Card Component
```tsx
<div className="bg-card border-default rounded-lg p-6">
  <h3 className="text-primary font-semibold mb-2">
    Card Title
  </h3>
  <p className="text-secondary">
    Card description text
  </p>
</div>
```

### Button Component
```tsx
{/* Primary Action */}
<button className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg">
  Primary Action
</button>

{/* Secondary Action */}
<button className="bg-secondary hover:bg-tertiary text-primary px-4 py-2 rounded-lg">
  Secondary Action
</button>
```

### Input Field
```tsx
<input 
  className="bg-card text-primary border-default focus:ring-accent focus:border-accent rounded-lg px-4 py-2"
  placeholder="Enter text..."
/>
```

### Navigation Link
```tsx
<Link 
  href="/path"
  className={`px-3 py-2 rounded-lg ${
    isActive 
      ? 'bg-accent-secondary text-accent' 
      : 'text-primary hover:bg-secondary'
  }`}
>
  Link Text
</Link>
```

### Status Badge
```tsx
<span className="bg-status-success-light text-status-success px-2 py-1 rounded-full text-xs font-semibold">
  Active
</span>

<span className="bg-status-warning-light text-status-warning px-2 py-1 rounded-full text-xs font-semibold">
  Pending
</span>

<span className="bg-status-error-light text-status-error px-2 py-1 rounded-full text-xs font-semibold">
  Error
</span>
```

## Theme Color Values

### Light Theme
| Variable | Value | Usage |
|----------|-------|-------|
| `--background` | `250 250 249` | Stone 50 - Main BG |
| `--background-secondary` | `245 245 244` | Stone 100 - Secondary BG |
| `--background-tertiary` | `231 229 228` | Stone 200 - Tertiary BG |
| `--text-primary` | `28 25 23` | Stone 900 - Primary Text |
| `--text-secondary` | `120 113 108` | Stone 500 - Secondary Text |
| `--accent-primary` | `34 197 94` | Green 500 - Accent |
| `--card-background` | `255 255 255` | White - Cards |

### Dark Theme
| Variable | Value | Usage |
|----------|-------|-------|
| `--background` | `10 25 41` | Deep Navy - Main BG |
| `--background-secondary` | `15 41 66` | Dark Navy - Secondary BG |
| `--background-tertiary` | `26 58 82` | Medium Navy - Tertiary BG |
| `--text-primary` | `241 245 249` | Slate 100 - Primary Text |
| `--text-secondary` | `148 163 184` | Slate 400 - Secondary Text |
| `--accent-primary` | `14 165 233` | Sky 500 - Accent |
| `--card-background` | `15 41 66` | Dark Navy - Cards |

## Best Practices

1. **Always use utility classes** instead of inline styles when possible
2. **Use semantic names**: `bg-primary` not `bg-white`
3. **Avoid hardcoded colors**: Use theme variables
4. **Test both themes**: Always verify light and dark modes
5. **Use status colors** for user feedback (success, error, etc.)
6. **Keep hover states**: Use `hover:bg-secondary` for interactive elements
7. **Maintain contrast**: Ensure text is readable in both themes

## Migration Guide

If you find old code with hardcoded colors:

```tsx
// ❌ Old (hardcoded)
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">

// ✅ New (theme-aware)
<div className="bg-primary text-primary">
```

```tsx
// ❌ Old (hardcoded)
<button className="bg-blue-600 hover:bg-blue-700">

// ✅ New (theme-aware)
<button className="bg-accent hover:bg-accent-hover">
```

## Troubleshooting

### Theme not changing?
1. Check if `ThemeProvider` wraps your app in `layout.tsx`
2. Verify `next-themes` is properly configured
3. Clear browser cache and reload

### Colors look wrong?
1. Ensure you're using the utility classes from globals.css
2. Check if there are duplicate/conflicting classes
3. Verify the CSS variable format (RGB values)

### Need custom colors?
1. Add to `/src/theme/theme.ts`
2. Add CSS variables to `/src/app/globals.css`
3. Create utility classes if needed

---

**Quick Test**: Toggle the theme button in the navbar. You should see:
- **Light Mode**: Green accents, warm gray backgrounds, dark text
- **Dark Mode**: Navy blue backgrounds, sky blue accents, light text

The difference should be dramatic and immediately visible! 🎨
