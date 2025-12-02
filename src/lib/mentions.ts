/**
 * Extract mentioned users from comment content
 * Mentions format: @username or @[User Name](userId)
 */
export function extractMentions(content: string): string[] {
  const mentions: string[] = [];
  
  // Pattern 1: @[Display Name](userId)
  const markdownMentions = content.matchAll(/@\[([^\]]+)\]\(([^)]+)\)/g);
  for (const match of markdownMentions) {
    mentions.push(match[2]); // userId
  }
  
  // Pattern 2: Simple @username (for backward compatibility)
  // This would need to be resolved to userId via database lookup
  
  return [...new Set(mentions)]; // Remove duplicates
}

/**
 * Parse mentions and convert to rich text format
 */
export function formatMentions(content: string, users: Array<{ id: string; name: string | null; email: string }>): string {
  let formatted = content;
  
  // Replace @username with clickable mentions
  for (const user of users) {
    const name = user.name || user.email.split('@')[0];
    const patterns = [
      new RegExp(`@${name}(?!\\])`, 'gi'),
      new RegExp(`@${user.email.split('@')[0]}(?!\\])`, 'gi'),
    ];
    
    for (const pattern of patterns) {
      formatted = formatted.replace(pattern, `@[${name}](${user.id})`);
    }
  }
  
  return formatted;
}

/**
 * Get user IDs from mention suggestions
 */
export function getUsernamesFromText(text: string): string[] {
  const words = text.split(/\s+/);
  const lastWord = words[words.length - 1];
  
  if (lastWord && lastWord.startsWith('@') && lastWord.length > 1) {
    return [lastWord.slice(1).toLowerCase()];
  }
  
  return [];
}
