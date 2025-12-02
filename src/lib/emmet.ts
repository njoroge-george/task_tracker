/**
 * Emmet-style abbreviation expansion for HTML and CSS
 * Supports shortcuts like: div>h2>p*3, ul>li*5, .class#id, etc.
 */

interface EmmetExpansion {
  pattern: RegExp;
  expand: (match: RegExpMatchArray) => string;
}

// HTML Emmet abbreviations
export const htmlEmmetAbbreviations: EmmetExpansion[] = [
  // Basic structure: div>p>span
  {
    pattern: /^([a-z0-9]+)>([a-z0-9]+)>([a-z0-9]+)$/,
    expand: (m) => `<${m[1]}>\n  <${m[2]}>\n    <${m[3]}></${m[3]}>\n  </${m[2]}>\n</${m[1]}>`,
  },
  
  // Two levels: div>p
  {
    pattern: /^([a-z0-9]+)>([a-z0-9]+)$/,
    expand: (m) => `<${m[1]}>\n  <${m[2]}></${m[2]}>\n</${m[1]}>`,
  },
  
  // Multiplication: p*3
  {
    pattern: /^([a-z0-9]+)\*(\d+)$/,
    expand: (m) => {
      const tag = m[1];
      const count = parseInt(m[2]);
      return Array(count).fill(0).map((_, i) => `<${tag}></${tag}>`).join('\n');
    },
  },
  
  // Complex: div>h2+p*3
  {
    pattern: /^([a-z0-9]+)>([a-z0-9]+)\+([a-z0-9]+)\*(\d+)$/,
    expand: (m) => {
      const parent = m[1];
      const first = m[2];
      const repeated = m[3];
      const count = parseInt(m[4]);
      const items = Array(count).fill(0).map(() => `  <${repeated}></${repeated}>`).join('\n');
      return `<${parent}>\n  <${first}></${first}>\n${items}\n</${parent}>`;
    },
  },
  
  // List with items: ul>li*5
  {
    pattern: /^(ul|ol)>li\*(\d+)$/,
    expand: (m) => {
      const list = m[1];
      const count = parseInt(m[2]);
      const items = Array(count).fill(0).map((_, i) => `  <li>Item ${i + 1}</li>`).join('\n');
      return `<${list}>\n${items}\n</${list}>`;
    },
  },
  
  // Class and ID: div.container#main
  {
    pattern: /^([a-z0-9]+)\.([a-z0-9-_]+)#([a-z0-9-_]+)$/,
    expand: (m) => `<${m[1]} class="${m[2]}" id="${m[3]}"></${m[1]}>`,
  },
  
  // Just class: div.container
  {
    pattern: /^([a-z0-9]+)\.([a-z0-9-_]+)$/,
    expand: (m) => `<${m[1]} class="${m[2]}"></${m[1]}>`,
  },
  
  // Just ID: div#main
  {
    pattern: /^([a-z0-9]+)#([a-z0-9-_]+)$/,
    expand: (m) => `<${m[1]} id="${m[2]}"></${m[1]}>`,
  },
  
  // HTML5 boilerplate
  {
    pattern: /^!$/,
    expand: () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  
</body>
</html>`,
  },
  
  // Link tag: link:css
  {
    pattern: /^link:css$/,
    expand: () => `<link rel="stylesheet" href="style.css">`,
  },
  
  // Script tag: script:src
  {
    pattern: /^script:src$/,
    expand: () => `<script src="script.js"></script>`,
  },
  
  // Script defer: script:defer
  {
    pattern: /^script:defer$/,
    expand: () => `<script defer src="script.js"></script>`,
  },
  
  // Input types
  {
    pattern: /^input:text$/,
    expand: () => `<input type="text" name="" id="">`,
  },
  {
    pattern: /^input:email$/,
    expand: () => `<input type="email" name="" id="">`,
  },
  {
    pattern: /^input:password$/,
    expand: () => `<input type="password" name="" id="">`,
  },
  {
    pattern: /^input:submit$/,
    expand: () => `<input type="submit" value="Submit">`,
  },
  
  // Button
  {
    pattern: /^btn$/,
    expand: () => `<button type="button">Button</button>`,
  },
  
  // Form
  {
    pattern: /^form:post$/,
    expand: () => `<form action="" method="post">\n  \n</form>`,
  },
  
  // Table: table>tr*3>td*4
  {
    pattern: /^table>tr\*(\d+)>td\*(\d+)$/,
    expand: (m) => {
      const rows = parseInt(m[1]);
      const cols = parseInt(m[2]);
      const tableRows = Array(rows).fill(0).map(() => {
        const cells = Array(cols).fill(0).map(() => '    <td></td>').join('\n');
        return `  <tr>\n${cells}\n  </tr>`;
      }).join('\n');
      return `<table>\n${tableRows}\n</table>`;
    },
  },
];

// CSS Emmet abbreviations
export const cssEmmetAbbreviations: EmmetExpansion[] = [
  // Display
  { pattern: /^df$/, expand: () => 'display: flex;' },
  { pattern: /^dg$/, expand: () => 'display: grid;' },
  { pattern: /^db$/, expand: () => 'display: block;' },
  { pattern: /^di$/, expand: () => 'display: inline;' },
  { pattern: /^dib$/, expand: () => 'display: inline-block;' },
  { pattern: /^dn$/, expand: () => 'display: none;' },
  
  // Flexbox
  { pattern: /^jcc$/, expand: () => 'justify-content: center;' },
  { pattern: /^jcs$/, expand: () => 'justify-content: flex-start;' },
  { pattern: /^jce$/, expand: () => 'justify-content: flex-end;' },
  { pattern: /^jcsb$/, expand: () => 'justify-content: space-between;' },
  { pattern: /^jcsa$/, expand: () => 'justify-content: space-around;' },
  { pattern: /^aic$/, expand: () => 'align-items: center;' },
  { pattern: /^ais$/, expand: () => 'align-items: flex-start;' },
  { pattern: /^aie$/, expand: () => 'align-items: flex-end;' },
  { pattern: /^fdr$/, expand: () => 'flex-direction: row;' },
  { pattern: /^fdc$/, expand: () => 'flex-direction: column;' },
  
  // Gap with number: g10 -> gap: 10px
  { 
    pattern: /^g(\d+)$/, 
    expand: (m) => `gap: ${m[1]}px;` 
  },
  
  // Padding: p10 -> padding: 10px
  { 
    pattern: /^p(\d+)$/, 
    expand: (m) => `padding: ${m[1]}px;` 
  },
  // Padding top: pt10
  { 
    pattern: /^pt(\d+)$/, 
    expand: (m) => `padding-top: ${m[1]}px;` 
  },
  // Padding right: pr10
  { 
    pattern: /^pr(\d+)$/, 
    expand: (m) => `padding-right: ${m[1]}px;` 
  },
  // Padding bottom: pb10
  { 
    pattern: /^pb(\d+)$/, 
    expand: (m) => `padding-bottom: ${m[1]}px;` 
  },
  // Padding left: pl10
  { 
    pattern: /^pl(\d+)$/, 
    expand: (m) => `padding-left: ${m[1]}px;` 
  },
  
  // Margin: m10 -> margin: 10px
  { 
    pattern: /^m(\d+)$/, 
    expand: (m) => `margin: ${m[1]}px;` 
  },
  // Margin auto
  { pattern: /^ma$/, expand: () => 'margin: auto;' },
  // Margin top: mt10
  { 
    pattern: /^mt(\d+)$/, 
    expand: (m) => `margin-top: ${m[1]}px;` 
  },
  // Margin right: mr10
  { 
    pattern: /^mr(\d+)$/, 
    expand: (m) => `margin-right: ${m[1]}px;` 
  },
  // Margin bottom: mb10
  { 
    pattern: /^mb(\d+)$/, 
    expand: (m) => `margin-bottom: ${m[1]}px;` 
  },
  // Margin left: ml10
  { 
    pattern: /^ml(\d+)$/, 
    expand: (m) => `margin-left: ${m[1]}px;` 
  },
  
  // Width: w100 -> width: 100px
  { 
    pattern: /^w(\d+)$/, 
    expand: (m) => `width: ${m[1]}px;` 
  },
  // Width percentage: w100p -> width: 100%
  { 
    pattern: /^w(\d+)p$/, 
    expand: (m) => `width: ${m[1]}%;` 
  },
  // Width viewport: w100vw
  { 
    pattern: /^w(\d+)vw$/, 
    expand: (m) => `width: ${m[1]}vw;` 
  },
  
  // Height: h100 -> height: 100px
  { 
    pattern: /^h(\d+)$/, 
    expand: (m) => `height: ${m[1]}px;` 
  },
  // Height percentage: h100p
  { 
    pattern: /^h(\d+)p$/, 
    expand: (m) => `height: ${m[1]}%;` 
  },
  // Height viewport: h100vh
  { 
    pattern: /^h(\d+)vh$/, 
    expand: (m) => `height: ${m[1]}vh;` 
  },
  
  // Position
  { pattern: /^posa$/, expand: () => 'position: absolute;' },
  { pattern: /^posr$/, expand: () => 'position: relative;' },
  { pattern: /^posf$/, expand: () => 'position: fixed;' },
  { pattern: /^poss$/, expand: () => 'position: sticky;' },
  
  // Top/Right/Bottom/Left: t10, r10, b10, l10
  { pattern: /^t(\d+)$/, expand: (m) => `top: ${m[1]}px;` },
  { pattern: /^r(\d+)$/, expand: (m) => `right: ${m[1]}px;` },
  { pattern: /^b(\d+)$/, expand: (m) => `bottom: ${m[1]}px;` },
  { pattern: /^l(\d+)$/, expand: (m) => `left: ${m[1]}px;` },
  
  // Font size: fz16 -> font-size: 16px
  { 
    pattern: /^fz(\d+)$/, 
    expand: (m) => `font-size: ${m[1]}px;` 
  },
  
  // Font weight: fw700
  { 
    pattern: /^fw(\d+)$/, 
    expand: (m) => `font-weight: ${m[1]};` 
  },
  { pattern: /^fwb$/, expand: () => 'font-weight: bold;' },
  { pattern: /^fwn$/, expand: () => 'font-weight: normal;' },
  
  // Text align
  { pattern: /^tac$/, expand: () => 'text-align: center;' },
  { pattern: /^tal$/, expand: () => 'text-align: left;' },
  { pattern: /^tar$/, expand: () => 'text-align: right;' },
  
  // Colors: c#fff -> color: #fff
  { 
    pattern: /^c#([0-9a-fA-F]{3,6})$/, 
    expand: (m) => `color: #${m[1]};` 
  },
  { 
    pattern: /^bg#([0-9a-fA-F]{3,6})$/, 
    expand: (m) => `background-color: #${m[1]};` 
  },
  
  // Border radius: br10
  { 
    pattern: /^br(\d+)$/, 
    expand: (m) => `border-radius: ${m[1]}px;` 
  },
  
  // Opacity: op50 -> opacity: 0.5
  { 
    pattern: /^op(\d+)$/, 
    expand: (m) => `opacity: 0.${m[1]};` 
  },
  
  // Z-index: z10
  { 
    pattern: /^z(\d+)$/, 
    expand: (m) => `z-index: ${m[1]};` 
  },
  
  // Overflow
  { pattern: /^ovh$/, expand: () => 'overflow: hidden;' },
  { pattern: /^ova$/, expand: () => 'overflow: auto;' },
  { pattern: /^ovs$/, expand: () => 'overflow: scroll;' },
  
  // Cursor
  { pattern: /^cup$/, expand: () => 'cursor: pointer;' },
  { pattern: /^cud$/, expand: () => 'cursor: default;' },
];

// JavaScript/TypeScript abbreviations
export const jsEmmetAbbreviations: EmmetExpansion[] = [
  // Console log: cl -> console.log()
  { 
    pattern: /^cl$/, 
    expand: () => "console.log();" 
  },
  
  // Console error: ce
  { 
    pattern: /^ce$/, 
    expand: () => "console.error();" 
  },
  
  // Console warn: cw
  { 
    pattern: /^cw$/, 
    expand: () => "console.warn();" 
  },
  
  // Function: fn
  { 
    pattern: /^fn$/, 
    expand: () => "function name() {\n  \n}" 
  },
  
  // Arrow function: afn
  { 
    pattern: /^afn$/, 
    expand: () => "const name = () => {\n  \n};" 
  },
  
  // Async function: async
  { 
    pattern: /^async$/, 
    expand: () => "async function name() {\n  \n}" 
  },
  
  // Try catch: try
  { 
    pattern: /^try$/, 
    expand: () => "try {\n  \n} catch (error) {\n  console.error(error);\n}" 
  },
  
  // For loop: for
  { 
    pattern: /^for$/, 
    expand: () => "for (let i = 0; i < length; i++) {\n  \n}" 
  },
  
  // ForEach: foreach
  { 
    pattern: /^foreach$/, 
    expand: () => "array.forEach((item) => {\n  \n});" 
  },
  
  // Map: map
  { 
    pattern: /^map$/, 
    expand: () => "array.map((item) => {\n  return item;\n});" 
  },
  
  // Filter: filter
  { 
    pattern: /^filter$/, 
    expand: () => "array.filter((item) => {\n  return condition;\n});" 
  },
  
  // Import: imp
  { 
    pattern: /^imp$/, 
    expand: () => "import { } from '';" 
  },
  
  // Export: exp
  { 
    pattern: /^exp$/, 
    expand: () => "export const  = ;" 
  },
  
  // setTimeout: timeout
  { 
    pattern: /^timeout$/, 
    expand: () => "setTimeout(() => {\n  \n}, 1000);" 
  },
  
  // setInterval: interval
  { 
    pattern: /^interval$/, 
    expand: () => "setInterval(() => {\n  \n}, 1000);" 
  },
];

// Python abbreviations
export const pythonEmmetAbbreviations: EmmetExpansion[] = [
  // Print: pr
  { 
    pattern: /^pr$/, 
    expand: () => "print()" 
  },
  
  // Function: def
  { 
    pattern: /^def$/, 
    expand: () => "def function_name():\n    pass" 
  },
  
  // Class: class
  { 
    pattern: /^class$/, 
    expand: () => "class ClassName:\n    def __init__(self):\n        pass" 
  },
  
  // If main: ifmain
  { 
    pattern: /^ifmain$/, 
    expand: () => "if __name__ == \"__main__\":\n    " 
  },
  
  // Try except: try
  { 
    pattern: /^try$/, 
    expand: () => "try:\n    \nexcept Exception as e:\n    print(e)" 
  },
  
  // For loop: for
  { 
    pattern: /^for$/, 
    expand: () => "for item in items:\n    " 
  },
  
  // While: while
  { 
    pattern: /^while$/, 
    expand: () => "while condition:\n    " 
  },
  
  // Import: imp
  { 
    pattern: /^imp$/, 
    expand: () => "import " 
  },
  
  // From import: from
  { 
    pattern: /^from$/, 
    expand: () => "from  import " 
  },
  
  // List comprehension: lc
  { 
    pattern: /^lc$/, 
    expand: () => "[x for x in items]" 
  },
  
  // Dictionary comprehension: dc
  { 
    pattern: /^dc$/, 
    expand: () => "{k: v for k, v in items}" 
  },
];

/**
 * Expand Emmet abbreviation based on language
 */
export function expandEmmet(text: string, language: 'html' | 'css' | 'js' | 'py'): string | null {
  const abbreviations = {
    html: htmlEmmetAbbreviations,
    css: cssEmmetAbbreviations,
    js: jsEmmetAbbreviations,
    py: pythonEmmetAbbreviations,
  }[language];

  for (const abbr of abbreviations) {
    const match = text.match(abbr.pattern);
    if (match) {
      return abbr.expand(match);
    }
  }

  return null;
}
