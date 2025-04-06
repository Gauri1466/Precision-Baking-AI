import { Link, useLocation } from "wouter";
import { ChefHat, Scale, Home, BarChart3 } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  
  return (
    <header className="mb-8">
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-primary mb-4">
          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
            <Scale className="w-12 h-12 text-primary" />
          </div>
        </div>
        <Link href="/">
          <h1 className="font-heading text-3xl font-bold text-center mb-2 hover:opacity-90 transition-opacity cursor-pointer">
            PreciseBaker
          </h1>
        </Link>
        <p className="text-center text-gray-700 max-w-md mb-6">
          Perfect measurements for perfect baking results, powered by AI
        </p>
      </div>
      
      <nav className="flex justify-center mb-2">
        <div className="flex items-center justify-center p-1 bg-gray-100 rounded-lg">
          <Link href="/">
            <div className={`flex items-center px-4 py-2 rounded-md transition-colors cursor-pointer ${
              location === "/" 
                ? "bg-white shadow-sm text-primary font-medium" 
                : "text-gray-600 hover:text-gray-900"
            }`}>
              <Home className="w-4 h-4 mr-2" />
              Home
            </div>
          </Link>
          
          <Link href="/recipe">
            <div className={`flex items-center px-4 py-2 rounded-md transition-colors cursor-pointer ${
              location === "/recipe" 
                ? "bg-white shadow-sm text-primary font-medium" 
                : "text-gray-600 hover:text-gray-900"
            }`}>
              <ChefHat className="w-4 h-4 mr-2" />
              Recipes
            </div>
          </Link>
          
          <Link href="/measurement">
            <div className={`flex items-center px-4 py-2 rounded-md transition-colors cursor-pointer ${
              location === "/measurement" 
                ? "bg-white shadow-sm text-primary font-medium" 
                : "text-gray-600 hover:text-gray-900"
            }`}>
              <Scale className="w-4 h-4 mr-2" />
              Measurements
            </div>
          </Link>
        </div>
      </nav>
    </header>
  );
}
