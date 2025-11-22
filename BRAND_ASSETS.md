# TaskFlow™ - Brand Assets

## 🎨 Logo Files

### Available Formats

1. **logo.svg** - Standard logo (200x200px)
   - Use for: Web, documentation, general purpose
   - Scalable vector format

2. **logo-512.svg** - High resolution (512x512px)
   - Use for: App icons, large displays, marketing
   - Full detail version with shadows

3. **favicon.svg** - Compact favicon (64x64px)
   - Use for: Browser tabs, bookmarks
   - Simplified design for small sizes

---

## 🎨 Color Palette

### Primary Colors
```css
--primary-blue: #3B82F6    /* Main brand color */
--primary-purple: #8B5CF6  /* Accent gradient */
--primary-indigo: #6366F1  /* Gradient middle */
```

### Gradient
```css
background: linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%);
```

### Status Colors
```css
--success: #3B82F6     /* Completed tasks */
--warning: #F59E0B     /* In progress */
--neutral: #9CA3AF     /* Pending */
```

### Background Colors
```css
--bg-completed: #F0F9FF   /* Light blue */
--bg-progress: #FEF3C7    /* Light amber */
--bg-pending: #F3F4F6     /* Light gray */
```

---

## 📐 Logo Usage Guidelines

### ✅ Do's
- Maintain aspect ratio when scaling
- Use on white or light backgrounds
- Keep adequate white space around logo
- Use SVG format for web
- Export to PNG for non-web uses

### ❌ Don'ts
- Don't stretch or distort
- Don't change colors (use original gradient)
- Don't add effects or shadows (already built-in)
- Don't place on busy backgrounds
- Don't use low-resolution versions

---

## 🔤 Typography

### Logo Font Recommendation
```
Primary: Inter, SF Pro Display, -apple-system
Weight: 700 (Bold) for "TaskFlow"
Weight: 400 (Regular) for taglines
```

### App Typography
```
Headings: Inter Bold (700)
Body: Inter Regular (400)
Code: 'Fira Code', 'JetBrains Mono', monospace
```

---

## 🎯 Logo Meanings

### Design Elements

1. **Gradient Circle** - Represents completeness and continuous progress
2. **Three Tasks** - Shows workflow: Done → In Progress → Pending
3. **Checkmarks** - Completed achievements
4. **Dots** - Active work in progress
5. **AI Sparkles** - Smart AI-powered assistance
6. **Rounded Corners** - Modern, friendly, approachable

### Color Psychology
- **Blue** (#3B82F6) - Trust, productivity, professionalism
- **Purple** (#8B5CF6) - Innovation, creativity, AI intelligence
- **Gradient** - Progress, growth, transformation

---

## 📱 Platform Specifications

### Web Favicon
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/logo-512.svg" />
```

### Social Media
- **Open Graph**: Use logo-512.svg (convert to PNG 1200x630)
- **Twitter Card**: Use logo-512.svg (convert to PNG 800x418)
- **LinkedIn**: Use logo-512.svg (convert to PNG 1200x627)

### App Icons (if building mobile app)
- **iOS**: Export logo-512.svg to PNG at various sizes (20-1024px)
- **Android**: Export logo-512.svg to PNG (48-512px)
- **PWA**: Use logo-512.svg for manifest.json

---

## 🎨 Exporting to PNG/JPG

### Using Inkscape (Command Line)
```bash
# Standard logo
inkscape public/logo.svg --export-filename=public/logo.png --export-width=200

# High-res for social media
inkscape public/logo-512.svg --export-filename=public/logo-1200.png --export-width=1200

# Favicon
inkscape public/favicon.svg --export-filename=public/favicon.png --export-width=64
```

### Using ImageMagick
```bash
convert public/logo.svg public/logo.png
convert public/logo-512.svg -resize 1200x1200 public/logo-1200.png
```

### Online Tools
- [Vectr](https://vectr.com/) - Free SVG editor
- [SVGOMG](https://jakearchibald.github.io/svgomg/) - SVG optimizer
- [CloudConvert](https://cloudconvert.com/svg-to-png) - SVG to PNG converter

---

## 📦 Asset Checklist

- ✅ logo.svg (200x200) - Standard logo
- ✅ logo-512.svg (512x512) - High-resolution
- ✅ favicon.svg (64x64) - Browser favicon
- ⬜ logo.png (export for email signatures)
- ⬜ logo-1200.png (export for social media)
- ⬜ logo-white.svg (create white version for dark backgrounds)
- ⬜ logo-horizontal.svg (create with text "TaskFlow")

---

## 🚀 Quick Start

### Add Logo to Your App

1. **Update favicon in layout.tsx:**
```tsx
export const metadata = {
  title: 'TaskFlow™',
  description: 'AI-powered task management',
  icons: {
    icon: '/favicon.svg',
    apple: '/logo-512.svg',
  },
}
```

2. **Use in navigation:**
```tsx
<img src="/logo.svg" alt="TaskFlow" width="40" height="40" />
```

3. **Add to README.md:**
```markdown
<img src="public/logo-512.svg" alt="TaskFlow Logo" width="200" />
```

---

## 🎭 Variations to Create

### Dark Mode Version
- Invert colors or use white/light version
- Adjust opacity for dark backgrounds

### Monochrome Version
- Single color for print/documents
- Use primary blue #3B82F6

### Horizontal Lockup
- Logo + "TaskFlow™" text side by side
- For headers and navigation

---

## ™ Trademark Notice

**TaskFlow™** is a trademark of your company/name.

Usage:
- First mention: TaskFlow™
- Subsequent mentions: TaskFlow
- Never modify the trademark
- Always capitalize: "TaskFlow" not "taskflow"

---

## 📞 Contact

For logo usage questions or custom variations:
- Email: your-email@example.com
- GitHub: github.com/yourusername/task-tracker

---

**All logos created and ready to use!** 🎉
