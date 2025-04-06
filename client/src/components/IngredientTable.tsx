import { useEffect, useState } from "react";
import { ingredientData } from "@/lib/ingredientData";

export default function IngredientTable() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  
  useEffect(() => {
    // Display only the first 5 ingredients
    setIngredients(ingredientData.slice(0, 5));
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ingredient</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">1 Cup</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">1 Tbsp</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">1 tsp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {ingredients.map((ingredient, index) => (
            <tr key={index}>
              <td className="px-4 py-2 text-sm">{ingredient.name}</td>
              <td className="px-4 py-2 text-sm">{ingredient.cup}g</td>
              <td className="px-4 py-2 text-sm">{ingredient.tablespoon}g</td>
              <td className="px-4 py-2 text-sm">{ingredient.teaspoon}g</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-4 text-center">
        <a href="#" className="text-primary text-sm font-medium hover:underline">
          View Full Ingredient Database
        </a>
      </div>
    </div>
  );
}
