# Emmet Shortcuts Guide for Code Playground

The code editor now includes **Emmet-style abbreviations** for super-fast coding! Just type the abbreviation and press **Tab** to expand.

---

## HTML Shortcuts

### Basic Elements

| Shortcut | Expands To | Description |
|----------|-----------|-------------|
| `!` | Full HTML5 boilerplate | Complete HTML structure |
| `div>p` | `<div><p></p></div>` | Nested elements |
| `div>h2>p` | Three levels deep | Deep nesting |
| `ul>li*5` | List with 5 items | Multiplication |
| `p*3` | Three paragraphs | Repeat elements |

### Classes and IDs

| Shortcut | Expands To |
|----------|-----------|
| `div.container` | `<div class="container"></div>` |
| `div#main` | `<div id="main"></div>` |
| `div.container#main` | `<div class="container" id="main"></div>` |

### Complex Structures

| Shortcut | Example Result |
|----------|----------------|
| `div>h2+p*3` | Header + 3 paragraphs |
| `table>tr*3>td*4` | 3x4 table |

### Common Elements

| Shortcut | Expands To |
|----------|-----------|
| `link:css` | `<link rel="stylesheet" href="style.css">` |
| `script:src` | `<script src="script.js"></script>` |
| `script:defer` | `<script defer src="script.js"></script>` |
| `btn` | `<button type="button">Button</button>` |

### Form Elements

| Shortcut | Expands To |
|----------|-----------|
| `input:text` | `<input type="text">` |
| `input:email` | `<input type="email">` |
| `input:password` | `<input type="password">` |
| `input:submit` | `<input type="submit">` |
| `form:post` | `<form method="post"></form>` |

---

## CSS Shortcuts

### Display & Layout

| Shortcut | Expands To |
|----------|-----------|
| `df` | `display: flex;` |
| `dg` | `display: grid;` |
| `db` | `display: block;` |
| `di` | `display: inline;` |
| `dib` | `display: inline-block;` |
| `dn` | `display: none;` |

### Flexbox

| Shortcut | Expands To |
|----------|-----------|
| `jcc` | `justify-content: center;` |
| `jcs` | `justify-content: flex-start;` |
| `jce` | `justify-content: flex-end;` |
| `jcsb` | `justify-content: space-between;` |
| `jcsa` | `justify-content: space-around;` |
| `aic` | `align-items: center;` |
| `ais` | `align-items: flex-start;` |
| `aie` | `align-items: flex-end;` |
| `fdr` | `flex-direction: row;` |
| `fdc` | `flex-direction: column;` |

### Spacing (with numbers)

| Shortcut | Expands To |
|----------|-----------|
| `p10` | `padding: 10px;` |
| `pt20` | `padding-top: 20px;` |
| `pr15` | `padding-right: 15px;` |
| `pb10` | `padding-bottom: 10px;` |
| `pl5` | `padding-left: 5px;` |
| `m10` | `margin: 10px;` |
| `mt20` | `margin-top: 20px;` |
| `mr15` | `margin-right: 15px;` |
| `mb10` | `margin-bottom: 10px;` |
| `ml5` | `margin-left: 5px;` |
| `ma` | `margin: auto;` |
| `g10` | `gap: 10px;` |

### Sizing

| Shortcut | Expands To |
|----------|-----------|
| `w100` | `width: 100px;` |
| `w100p` | `width: 100%;` |
| `w100vw` | `width: 100vw;` |
| `h100` | `height: 100px;` |
| `h100p` | `height: 100%;` |
| `h100vh` | `height: 100vh;` |

### Position

| Shortcut | Expands To |
|----------|-----------|
| `posa` | `position: absolute;` |
| `posr` | `position: relative;` |
| `posf` | `position: fixed;` |
| `poss` | `position: sticky;` |
| `t10` | `top: 10px;` |
| `r10` | `right: 10px;` |
| `b10` | `bottom: 10px;` |
| `l10` | `left: 10px;` |

### Typography

| Shortcut | Expands To |
|----------|-----------|
| `fz16` | `font-size: 16px;` |
| `fw700` | `font-weight: 700;` |
| `fwb` | `font-weight: bold;` |
| `fwn` | `font-weight: normal;` |
| `tac` | `text-align: center;` |
| `tal` | `text-align: left;` |
| `tar` | `text-align: right;` |

### Colors

| Shortcut | Expands To |
|----------|-----------|
| `c#fff` | `color: #fff;` |
| `c#ff0000` | `color: #ff0000;` |
| `bg#333` | `background-color: #333;` |

### Misc

| Shortcut | Expands To |
|----------|-----------|
| `br10` | `border-radius: 10px;` |
| `op50` | `opacity: 0.5;` |
| `z10` | `z-index: 10;` |
| `ovh` | `overflow: hidden;` |
| `ova` | `overflow: auto;` |
| `ovs` | `overflow: scroll;` |
| `cup` | `cursor: pointer;` |
| `cud` | `cursor: default;` |

---

## JavaScript Shortcuts

| Shortcut | Expands To |
|----------|-----------|
| `cl` | `console.log();` |
| `ce` | `console.error();` |
| `cw` | `console.warn();` |
| `fn` | `function name() { }` |
| `afn` | `const name = () => { };` |
| `async` | `async function name() { }` |
| `try` | `try { } catch (error) { }` |
| `for` | `for (let i = 0; i < length; i++) { }` |
| `foreach` | `array.forEach((item) => { });` |
| `map` | `array.map((item) => { return item; });` |
| `filter` | `array.filter((item) => { return condition; });` |
| `imp` | `import { } from '';` |
| `exp` | `export const  = ;` |
| `timeout` | `setTimeout(() => { }, 1000);` |
| `interval` | `setInterval(() => { }, 1000);` |

---

## Python Shortcuts

| Shortcut | Expands To |
|----------|-----------|
| `pr` | `print()` |
| `def` | `def function_name(): pass` |
| `class` | `class ClassName: def __init__(self): pass` |
| `ifmain` | `if __name__ == "__main__":` |
| `try` | `try: except Exception as e: print(e)` |
| `for` | `for item in items:` |
| `while` | `while condition:` |
| `imp` | `import` |
| `from` | `from  import` |
| `lc` | `[x for x in items]` (list comprehension) |
| `dc` | `{k: v for k, v in items}` (dict comprehension) |

---

## How to Use

1. **Type** the abbreviation (e.g., `div>p*3`)
2. **Press Tab** to expand
3. **Magic!** ✨

### Examples:

**HTML:**
```
div>h2>p*3  [Tab]
```
Expands to:
```html
<div>
  <h2>
    <p></p>
    <p></p>
    <p></p>
  </h2>
</div>
```

**CSS:**
```
df jcc aic  [Tab each]
```
Expands to:
```css
display: flex;
justify-content: center;
align-items: center;
```

**JavaScript:**
```
cl  [Tab]
```
Expands to:
```javascript
console.log();
```

---

## Tips & Tricks

1. **Chain shortcuts**: Type one, press Tab, type another
2. **Use numbers**: `p10`, `m20`, `w100` work with any number
3. **Combine classes and IDs**: `div.container#main.wrapper`
4. **Nested structures**: `ul>li*5` creates a list instantly
5. **Full boilerplate**: Type `!` in HTML for complete structure

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Expand abbreviation | `Tab` |
| Toggle comment | `Cmd/Ctrl + /` |
| Save | `Cmd/Ctrl + S` |
| Format code | Format button |
| Search | `Cmd/Ctrl + F` |
| Multi-cursor | `Cmd/Ctrl + D` |

---

## Pro Tips

### Quick Layouts

**Flexbox Center:**
```css
df jcc aic  [Tab each]
```

**Grid Layout:**
```css
dg  [Tab]
```

**Card Component:**
```html
div.card>h2.card-title+p.card-text*2  [Tab]
```

### Responsive Widths

```css
w100p  [Tab]  → width: 100%;
h100vh  [Tab]  → height: 100vh;
```

### Common Patterns

**Navigation:**
```html
nav>ul>li*4>a  [Tab]
```

**Form:**
```html
form:post>input:text+input:email+input:submit  [Tab]
```

---

**Enjoy super-fast coding with Emmet! 🚀**
