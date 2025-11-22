#!/bin/bash

# Theme Refactoring Cleanup Script - Phase 2
# Handles remaining edge cases and duplicates

echo "🎨 Running theme refactoring cleanup..."

SRC_DIR="./src"

# Fix duplicate classes (e.g., "bg-white/80 bg-primary/80" -> "bg-primary/80")
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-white\/80 bg-primary\/80/bg-primary\/80/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/border-gray-200 border-default/border-default/g'

# Fix hover states with dark mode
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/hover:text-gray-900 dark:hover:text-white/hover:text-accent/g'

# Fix text-blue-100 (light blue text)
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-blue-100/text-white opacity-90/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-blue-900 dark:text-blue-300/text-primary/g'

# Fix remaining blue colors
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-accent dark:text-blue-400/text-accent/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-accent dark:text-blue-300/text-accent/g'

# Fix hover backgrounds
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/hover:bg-gray-100/hover:bg-secondary/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-white text-accent hover:bg-gray-100/bg-primary text-accent hover:bg-secondary/g'

# Fix footer and dark backgrounds
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-gray-900 text-white/bg-[rgb(var(--card-background))] text-primary/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-gray-400/text-secondary/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/border-gray-800/border-default/g'

# Fix OAuth buttons (dark bg + text)
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-gray-900 dark:bg-gray-700/bg-[rgb(var(--card-background))]/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/hover:bg-gray-800 dark:hover:bg-gray-600/hover:bg-[rgb(var(--background-tertiary))]/g'

# Fix input fields with dark mode
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/dark:bg-gray-700/bg-card/g'

# Fix ring colors for focus states
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/focus:ring-purple-500/focus:ring-accent/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-purple-600/text-accent/g'

# Fix checkbox/radio colors
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/border-gray-300/border-default/g'

echo "✅ Cleanup complete!"
echo "📋 Remaining items to manually review:"
echo "  - Footer section colors"
echo "  - CTA/Hero section backgrounds"
echo "  - Any custom gradient backgrounds"
