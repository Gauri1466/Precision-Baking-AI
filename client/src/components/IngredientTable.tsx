import { useEffect, useState } from "react";
import { ingredientData } from "@/lib/ingredientData";
import { useIsMobile } from "@/hooks/use-mobile";

export default function IngredientTable() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Display fewer ingredients on mobile
    const limit = isMobile ? 3 : 5;
    setIngredients(ingredientData.slice(0, limit));
  }, [isMobile]);

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
            <tr key={index}>
              <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">{ingredient.name}</td>
              <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">{ingredient.cup}g</td>
              <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">{ingredient.tablespoon}g</td>
              <td className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">{ingredient.teaspoon}g</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-3 sm:mt-4 text-center">
        <a href="#" className="text-primary text-xs sm:text-sm font-medium hover:underline">
          View Full Ingredient Database
        </a>
      </div>
    </div>
  );
}
