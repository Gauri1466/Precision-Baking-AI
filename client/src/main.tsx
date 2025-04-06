import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.title = "Precision Baking Converter | Bio Links";

// Add global styles for fonts and custom CSS variables
const style = document.createElement('style');
style.textContent = `
  :root {
    --primary: 0 65% 68%;
    --secondary: 120 33% 67%;
    --accent: 45 100% 66%;
    --background: 0 0% 98%;
    --card: 0 0% 100%;
    --foreground: 0 0% 26%;
    --border: 0 0% 88%;
    --font-heading: 'Playfair Display', serif;
    --font-body: 'Inter', sans-serif;
    --font-accent: 'Poppins', sans-serif;
  }
  
  body {
    background-color: hsl(var(--background));
    font-family: var(--font-body);
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
  }
  
  .social-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  
  .tab-active {
    border-bottom: 2px solid hsl(var(--primary));
    color: hsl(var(--primary));
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
