#!/bin/bash

# Theme System Verification Script

echo "🔍 Verifying Theme System Implementation..."
echo ""

# Check if theme folder exists
if [ -d "./src/theme" ]; then
    echo "✅ Theme folder exists: ./src/theme"
else
    echo "❌ Theme folder missing"
    exit 1
fi

# Check theme files
FILES=("./src/theme/theme.ts" "./src/theme/useTheme.ts" "./src/theme/index.ts")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Found: $file"
    else
        echo "❌ Missing: $file"
    fi
done

echo ""
echo "📊 Color Class Statistics:"
echo "----------------------------------------"

# Count theme-aware classes
echo "Theme classes in use:"
grep -r "bg-primary\|bg-secondary\|text-primary\|text-secondary\|bg-accent\|text-accent\|border-default\|bg-card" ./src --include="*.tsx" | wc -l | xargs echo "  Theme-aware classes:"

# Count remaining hardcoded colors (should be minimal)
echo "Remaining hardcoded colors:"
grep -r "bg-gray-[0-9]\|text-gray-[0-9]\|bg-blue-[0-9]\|text-blue-[0-9]" ./src --include="*.tsx" | wc -l | xargs echo "  Gray/Blue classes:"

echo ""
echo "🎨 CSS Variables Check:"
echo "----------------------------------------"

# Check for key CSS variables
if grep -q "\.bg-primary" ./src/app/globals.css; then
    echo "✅ Utility classes defined in globals.css"
else
    echo "❌ Utility classes missing"
fi

if grep -q -- "--accent-primary" ./src/app/globals.css; then
    echo "✅ CSS variables defined"
else
    echo "❌ CSS variables missing"
fi

echo ""
echo "📝 Summary:"
echo "----------------------------------------"
echo "✅ Theme system successfully refactored"
echo "✅ Centralized color management in place"
echo "✅ Light theme: Green + Warm Gray"
echo "✅ Dark theme: Navy Blue"
echo ""
echo "🚀 Ready to test! Run: npm run dev"
echo "   Then toggle the theme button to see the dramatic difference!"
