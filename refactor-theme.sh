#!/bin/bash

# Theme Refactoring Script
# This script replaces hardcoded Tailwind color classes with theme-aware classes

echo "🎨 Starting theme refactoring..."

# Define the source directory
SRC_DIR="./src"

# Background colors
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-white dark:bg-gray-800/bg-primary/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-white dark:bg-gray-900/bg-primary/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-gray-50 dark:bg-gray-800/bg-secondary/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-gray-100 dark:bg-gray-700/bg-secondary/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/dark:bg-gray-800/bg-card/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/dark:bg-gray-900/bg-primary/g'

# Text colors
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-gray-900 dark:text-white/text-primary/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-gray-800 dark:text-white/text-primary/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-gray-700 dark:text-gray-300/text-primary/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-gray-600 dark:text-gray-300/text-secondary/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-gray-600 dark:text-gray-400/text-secondary/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-gray-500 dark:text-gray-400/text-secondary/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/dark:text-white/text-primary/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/dark:text-gray-300/text-primary/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/dark:text-gray-400/text-secondary/g'

# Border colors
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/border-gray-200 dark:border-gray-700/border-default/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/border-gray-300 dark:border-gray-600/border-default/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/dark:border-gray-700/border-default/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/dark:border-gray-800/border-default/g'

# Hover colors
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/hover:bg-gray-100 dark:hover:bg-gray-700/hover:bg-secondary/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/hover:bg-gray-50 dark:hover:bg-gray-700/hover:bg-secondary/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/dark:hover:bg-gray-700/hover:bg-secondary/g'

# Accent/primary colors (blue)
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-blue-600/bg-accent/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/hover:bg-blue-700/hover:bg-accent-hover/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-blue-600/text-accent/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/border-blue-500/border-accent/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/focus:ring-blue-500/focus:ring-accent/g'

# Blue secondary (lighter)
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-blue-50 dark:bg-blue-900\/20/bg-accent-secondary/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-blue-100 dark:bg-blue-900/bg-accent-secondary/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-blue-600 dark:text-blue-400/text-accent/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-blue-800 dark:text-blue-200/text-accent/g'

# Status colors
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-green-500/text-status-success/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-green-600/text-status-success/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-red-600 dark:text-red-400/text-status-error/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-yellow-600/text-status-warning/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/hover:bg-red-50 dark:hover:bg-red-900\/20/hover:bg-status-error-light/g'

# Gradients (convert to solid accent color)
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-gradient-to-br from-blue-500 to-purple-600/bg-accent/g'
find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent/text-accent/g'

echo "✅ Theme refactoring complete!"
echo "📝 Please review the changes and test your application."
