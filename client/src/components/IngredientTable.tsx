import { useEffect, useState } from "react";
import { ingredientData } from "@/lib/ingredientData";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function IngredientTable() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Update ingredients when showAll status changes or mobile state changes
    const limit = isMobile ? 3 : 5;
    setIngredients(showAll ? ingredientData : ingredientData.slice(0, limit));
  }, [isMobile, showAll]);

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  return (
    <div className="overflow-x-auto -mx-3 sm:mx-0">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead>
          <tr>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-700 uppercase tracking-wider">Ingredient</th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-700 uppercase tracking-wider">1 Cup</th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-700 uppercase tracking-wider">1 Tbsp</th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-700 uppercase tracking-wider">1 tsp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {ingredients.map((ingredient, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium">{ingredient.name}</td>
              <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">{ingredient.cup}g</td>
              <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">{ingredient.tablespoon}g</td>
              <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">{ingredient.teaspoon}g</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-3 sm:mt-4 text-center">
        <Button 
          variant="ghost" 
          className="text-primary text-xs sm:text-sm font-medium hover:underline"
          onClick={toggleShowAll}
        >
          {showAll ? (
            <span className="flex items-center">
              Show Less <ChevronUp className="ml-1 h-3 w-3" />
            </span>
          ) : (
            <span className="flex items-center">
              View Full Ingredient Database <ChevronDown className="ml-1 h-3 w-3" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
