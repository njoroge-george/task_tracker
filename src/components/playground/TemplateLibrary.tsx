"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Sparkles, Layout, Zap } from "lucide-react";

export interface Template {
  id: string;
  title: string;
  description: string;
  category: "beginner" | "api" | "logic" | "html-css";
  html?: string;
  css?: string;
  js?: string;
  python?: string;
}

const TEMPLATES: Template[] = [
  // ==================== BEGINNER TEMPLATES ====================
  {
    id: "loop-for",
    title: "For Loop",
    description: "Basic for loop iteration example",
    category: "beginner",
    js: `// For loop - iterating through numbers
for (let i = 0; i < 5; i++) {
  console.log('Iteration:', i);
}

// For loop with array
const fruits = ['apple', 'banana', 'orange'];
for (let i = 0; i < fruits.length; i++) {
  console.log(fruits[i]);
}`,
  },
  {
    id: "loop-while",
    title: "While Loop",
    description: "While loop with condition",
    category: "beginner",
    js: `// While loop example
let count = 0;
while (count < 5) {
  console.log('Count:', count);
  count++;
}

// Do-while loop (runs at least once)
let i = 0;
do {
  console.log('i:', i);
  i++;
} while (i < 3);`,
  },
  {
    id: "function-basic",
    title: "Functions",
    description: "Function declaration, expression, and arrow functions",
    category: "beginner",
    js: `// Function declaration
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Function expression
const add = function(a, b) {
  return a + b;
};

// Arrow function
const multiply = (a, b) => a * b;

// Arrow function with multiple lines
const divide = (a, b) => {
  if (b === 0) return 'Cannot divide by zero';
  return a / b;
};

console.log(greet('World'));
console.log(add(5, 3));
console.log(multiply(4, 2));`,
  },
  {
    id: "arrays-basics",
    title: "Arrays Basics",
    description: "Creating and manipulating arrays",
    category: "beginner",
    js: `// Creating arrays
const fruits = ['apple', 'banana', 'orange'];
const numbers = [1, 2, 3, 4, 5];

// Array methods
fruits.push('grape');        // Add to end
fruits.unshift('mango');     // Add to beginning
fruits.pop();                // Remove from end
fruits.shift();              // Remove from beginning

console.log('Fruits:', fruits);
console.log('First fruit:', fruits[0]);
console.log('Length:', fruits.length);

// Looping through arrays
fruits.forEach((fruit, index) => {
  console.log(\`\${index}: \${fruit}\`);
});

// Check if array includes item
console.log(fruits.includes('banana')); // true`,
  },
  {
    id: "objects-basics",
    title: "Objects Basics",
    description: "Working with JavaScript objects",
    category: "beginner",
    js: `// Creating objects
const person = {
  name: 'John Doe',
  age: 30,
  city: 'New York',
  hobbies: ['reading', 'gaming', 'coding']
};

// Accessing properties
console.log(person.name);        // Dot notation
console.log(person['age']);      // Bracket notation

// Adding/modifying properties
person.email = 'john@example.com';
person.age = 31;

// Object methods
person.greet = function() {
  return \`Hi, I'm \${this.name}\`;
};

console.log(person.greet());

// Object.keys, values, entries
console.log(Object.keys(person));
console.log(Object.values(person));`,
  },
  {
    id: "conditionals",
    title: "Conditionals",
    description: "If/else, switch, ternary operator",
    category: "beginner",
    js: `// If-else statement
const age = 18;
if (age >= 18) {
  console.log('Adult');
} else if (age >= 13) {
  console.log('Teenager');
} else {
  console.log('Child');
}

// Ternary operator
const status = age >= 18 ? 'Adult' : 'Minor';
console.log(status);

// Switch statement
const day = 'Monday';
switch (day) {
  case 'Monday':
    console.log('Start of week');
    break;
  case 'Friday':
    console.log('End of workweek');
    break;
  case 'Saturday':
  case 'Sunday':
    console.log('Weekend!');
    break;
  default:
    console.log('Midweek');
}`,
  },

  // ==================== API REQUEST EXAMPLES ====================
  {
    id: "fetch-get",
    title: "Fetch GET Request",
    description: "Fetching data from an API",
    category: "api",
    js: `// Basic GET request with fetch
async function fetchUsers() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const users = await response.json();
    console.log('Users:', users);
    return users;
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

fetchUsers();`,
  },
  {
    id: "fetch-post",
    title: "Fetch POST Request",
    description: "Sending data to an API",
    category: "api",
    js: `// POST request with fetch
async function createPost(postData) {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const result = await response.json();
    console.log('Created post:', result);
    return result;
  } catch (error) {
    console.error('Error creating post:', error);
  }
}

// Example usage
createPost({
  title: 'My Post',
  body: 'This is the content',
  userId: 1
});`,
  },
  {
    id: "axios-get",
    title: "Axios GET Request",
    description: "Using Axios library for API calls",
    category: "api",
    js: `// First install: npm install axios
// Then import: import axios from 'axios';

// For playground demo, using fetch as alternative
async function fetchWithAxiosStyle() {
  try {
    // Axios-style request
    const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    const data = await response.json();
    
    console.log('Todo:', data);
    
    // With error handling
    if (response.status === 404) {
      console.log('Not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchWithAxiosStyle();`,
  },
  {
    id: "api-with-params",
    title: "API with Query Parameters",
    description: "Building URLs with query parameters",
    category: "api",
    js: `// API call with query parameters
async function searchUsers(query) {
  const params = new URLSearchParams({
    q: query,
    limit: 10,
    page: 1
  });
  
  const url = \`https://api.example.com/search?\${params}\`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Search results:', data);
    return data;
  } catch (error) {
    console.error('Search error:', error);
  }
}

searchUsers('javascript');`,
  },

  // ==================== LOGIC EXAMPLES ====================
  {
    id: "array-sorting",
    title: "Array Sorting",
    description: "Different ways to sort arrays",
    category: "logic",
    js: `// Sorting arrays
const numbers = [5, 2, 8, 1, 9, 3];
const words = ['banana', 'apple', 'cherry', 'date'];

// Sort numbers (ascending)
const sortedNumbers = numbers.slice().sort((a, b) => a - b);
console.log('Sorted numbers:', sortedNumbers);

// Sort numbers (descending)
const descending = numbers.slice().sort((a, b) => b - a);
console.log('Descending:', descending);

// Sort strings alphabetically
const sortedWords = words.slice().sort();
console.log('Sorted words:', sortedWords);

// Sort objects by property
const users = [
  { name: 'John', age: 30 },
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 35 }
];

const sortedByAge = users.slice().sort((a, b) => a.age - b.age);
console.log('Sorted by age:', sortedByAge);`,
  },
  {
    id: "array-mapping",
    title: "Array Mapping",
    description: "Transform arrays with map()",
    category: "logic",
    js: `// Array mapping - transforming data
const numbers = [1, 2, 3, 4, 5];
const users = [
  { firstName: 'John', lastName: 'Doe' },
  { firstName: 'Jane', lastName: 'Smith' }
];

// Double each number
const doubled = numbers.map(num => num * 2);
console.log('Doubled:', doubled);

// Get full names
const fullNames = users.map(user => \`\${user.firstName} \${user.lastName}\`);
console.log('Full names:', fullNames);

// Transform objects
const userCards = users.map(user => ({
  name: \`\${user.firstName} \${user.lastName}\`,
  initials: \`\${user.firstName[0]}\${user.lastName[0]}\`
}));
console.log('User cards:', userCards);`,
  },
  {
    id: "array-filtering",
    title: "Array Filtering",
    description: "Filter arrays based on conditions",
    category: "logic",
    js: `// Array filtering
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const products = [
  { name: 'Laptop', price: 999, inStock: true },
  { name: 'Phone', price: 699, inStock: false },
  { name: 'Tablet', price: 499, inStock: true },
  { name: 'Monitor', price: 299, inStock: true }
];

// Filter even numbers
const evens = numbers.filter(num => num % 2 === 0);
console.log('Even numbers:', evens);

// Filter products in stock
const available = products.filter(p => p.inStock);
console.log('Available products:', available);

// Filter by price range
const affordable = products.filter(p => p.price < 500);
console.log('Affordable products:', affordable);

// Combine filter and map
const cheapNames = products
  .filter(p => p.price < 500)
  .map(p => p.name);
console.log('Cheap product names:', cheapNames);`,
  },
  {
    id: "array-reduce",
    title: "Array Reduce",
    description: "Reduce arrays to single values",
    category: "logic",
    js: `// Array reduce - aggregating data
const numbers = [1, 2, 3, 4, 5];
const cart = [
  { item: 'Laptop', price: 999, qty: 1 },
  { item: 'Mouse', price: 25, qty: 2 },
  { item: 'Keyboard', price: 75, qty: 1 }
];

// Sum of numbers
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log('Sum:', sum);

// Calculate cart total
const total = cart.reduce((acc, item) => {
  return acc + (item.price * item.qty);
}, 0);
console.log('Cart total: $' + total);

// Count occurrences
const fruits = ['apple', 'banana', 'apple', 'orange', 'banana', 'apple'];
const count = fruits.reduce((acc, fruit) => {
  acc[fruit] = (acc[fruit] || 0) + 1;
  return acc;
}, {});
console.log('Fruit count:', count);`,
  },

  // ==================== HTML/CSS STARTER TEMPLATES ====================
  {
    id: "html-basic",
    title: "HTML5 Boilerplate",
    description: "Basic HTML5 structure",
    category: "html-css",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Page</title>
</head>
<body>
  <header>
    <h1>Welcome</h1>
    <nav>
      <a href="#home">Home</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>
  
  <main>
    <section id="home">
      <h2>Home Section</h2>
      <p>This is the main content area.</p>
    </section>
  </main>
  
  <footer>
    <p>&copy; 2024 My Website</p>
  </footer>
</body>
</html>`,
  },
  {
    id: "flexbox-layout",
    title: "Flexbox Layout",
    description: "Responsive flexbox layout",
    category: "html-css",
    html: `<div class="container">
  <div class="box">Box 1</div>
  <div class="box">Box 2</div>
  <div class="box">Box 3</div>
</div>`,
    css: `.container {
  display: flex;
  gap: 20px;
  padding: 20px;
  flex-wrap: wrap;
}

.box {
  flex: 1;
  min-width: 200px;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.box:hover {
  transform: translateY(-5px);
}`,
  },
  {
    id: "grid-layout",
    title: "CSS Grid Layout",
    description: "Modern grid layout system",
    category: "html-css",
    html: `<div class="grid-container">
  <header class="header">Header</header>
  <aside class="sidebar">Sidebar</aside>
  <main class="main">Main Content</main>
  <footer class="footer">Footer</footer>
</div>`,
    css: `.grid-container {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 20px;
  min-height: 100vh;
  padding: 20px;
}

.header {
  grid-column: 1 / -1;
  background: #3498db;
  padding: 20px;
  color: white;
  border-radius: 8px;
}

.sidebar {
  background: #2ecc71;
  padding: 20px;
  color: white;
  border-radius: 8px;
}

.main {
  background: #ecf0f1;
  padding: 20px;
  border-radius: 8px;
}

.footer {
  grid-column: 1 / -1;
  background: #34495e;
  padding: 20px;
  color: white;
  text-align: center;
  border-radius: 8px;
}`,
  },
  {
    id: "card-component",
    title: "Card Component",
    description: "Reusable card design",
    category: "html-css",
    html: `<div class="card">
  <img src="https://via.placeholder.com/300x200" alt="Card image">
  <div class="card-content">
    <h3>Card Title</h3>
    <p>This is a beautiful card component with image and content.</p>
    <button class="btn">Learn More</button>
  </div>
</div>`,
    css: `.card {
  max-width: 300px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  background: white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-content {
  padding: 20px;
}

.card h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.card p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
}

.btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;
}

.btn:hover {
  background: #2980b9;
}`,
  },
];


export default function TemplateLibrary({ onSelect }: TemplateLibraryProps) {
  const [activeCategory, setActiveCategory] = useState<Template["category"]>("beginner");

  const filteredTemplates = TEMPLATES.filter(t => t.category === activeCategory);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Template Library
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as Template["category"])}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="beginner">
              <Code2 className="w-4 h-4 mr-2" />
              Beginner
            </TabsTrigger>
            <TabsTrigger value="api">
              <Zap className="w-4 h-4 mr-2" />
              API
            </TabsTrigger>
            <TabsTrigger value="logic">
              <Code2 className="w-4 h-4 mr-2" />
              Logic
            </TabsTrigger>
            <TabsTrigger value="html-css">
              <Layout className="w-4 h-4 mr-2" />
              HTML/CSS
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeCategory} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border rounded-lg hover:border-accent hover:bg-accent-secondary/10 transition-colors cursor-pointer"
                  onClick={() => onSelect(template)}
                >
                  <h4 className="font-semibold text-sm mb-1">{template.title}</h4>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
