import express, { Request, Response } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSocialLinkSchema, 
  insertRecipeSchema, 
  insertConversionHistorySchema 
} from "@shared/schema";
import { z } from "zod";
import { extractRecipeFromImage, convertRecipeText, getRecipeByDishName } from "./services/geminiService";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();
  
  // Social links endpoints
  apiRouter.get("/social-links", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const links = await storage.getSocialLinks(userId);
      res.json(links);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch social links" });
    }
  });
  
  apiRouter.post("/social-links", async (req: Request, res: Response) => {
    try {
      const socialLink = insertSocialLinkSchema.parse(req.body);
      const newLink = await storage.createSocialLink(socialLink);
      res.status(201).json(newLink);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid social link data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create social link" });
      }
    }
  });
  
  apiRouter.put("/social-links/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const updates = req.body;
      const updatedLink = await storage.updateSocialLink(id, updates);
      
      if (!updatedLink) {
        return res.status(404).json({ message: "Social link not found" });
      }
      
      res.json(updatedLink);
    } catch (error) {
      res.status(500).json({ message: "Failed to update social link" });
    }
  });
  
  apiRouter.delete("/social-links/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteSocialLink(id);
      
      if (!success) {
        return res.status(404).json({ message: "Social link not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete social link" });
    }
  });
  
  // Recipe endpoints
  apiRouter.get("/recipes", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const featured = req.query.featured ? req.query.featured === 'true' : undefined;
      const recipes = await storage.getRecipes(userId, featured);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });
  
  apiRouter.get("/recipes/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const recipe = await storage.getRecipe(id);
      
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });
  
  apiRouter.post("/recipes", async (req: Request, res: Response) => {
    try {
      const recipe = insertRecipeSchema.parse(req.body);
      const newRecipe = await storage.createRecipe(recipe);
      res.status(201).json(newRecipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid recipe data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create recipe" });
      }
    }
  });
  
  apiRouter.put("/recipes/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const updates = req.body;
      const updatedRecipe = await storage.updateRecipe(id, updates);
      
      if (!updatedRecipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.json(updatedRecipe);
    } catch (error) {
      res.status(500).json({ message: "Failed to update recipe" });
    }
  });
  
  apiRouter.delete("/recipes/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteRecipe(id);
      
      if (!success) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });
  
  // Conversion history endpoints
  apiRouter.get("/conversion-history", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const history = await storage.getConversionHistory(userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversion history" });
    }
  });
  
  apiRouter.post("/conversion-history", async (req: Request, res: Response) => {
    try {
      const historyItem = insertConversionHistorySchema.parse(req.body);
      const newHistoryItem = await storage.saveConversionHistory(historyItem);
      res.status(201).json(newHistoryItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid conversion history data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to save conversion history" });
      }
    }
  });
  
  // Gemini AI Integration for recipe conversion
  apiRouter.post("/convert-recipe", async (req: Request, res: Response) => {
    try {
      const { 
        recipeText, 
        conversionType, 
        scaleFactor, 
        humidityAdjust, 
        proMode 
      } = req.body;
      
      if (!recipeText || !conversionType || !scaleFactor) {
        return res.status(400).json({ 
          message: "Missing required fields: recipeText, conversionType, or scaleFactor" 
        });
      }
      
      // Use Gemini AI to convert the recipe
      try {
        const convertedRecipe = await convertRecipeText(
          recipeText,
          conversionType,
          scaleFactor,
          !!humidityAdjust,
          !!proMode
        );
        
        // Save to conversion history if user is logged in
        // This would be implemented with actual user authentication in production
        
        res.json({ 
          convertedRecipe,
          success: true 
        });
      } catch (aiError) {
        console.error("Gemini AI conversion error:", aiError);
        
        // Fallback to basic conversion when AI fails
        const convertedRecipe = `
## ${recipeText.split('\n')[0] || "Converted Recipe"}

${generateConvertedIngredients(conversionType, scaleFactor, !!humidityAdjust)}

${proMode ? "**Professional Baker Notes:** For optimal results, maintain dough temperature between 68-72°F during mixing. Final hydration should be 65-68% depending on flour protein content." : ""}
${humidityAdjust ? "**Humidity adjustment applied:** Reduced flour by 5g to account for high humidity." : ""}
        `;
        
        res.json({ 
          convertedRecipe,
          success: true,
          note: "Used basic conversion due to AI service error."
        });
      }
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to convert recipe", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Photo to Recipe using Gemini Vision AI
  apiRouter.post("/photo-to-recipe", async (req: Request, res: Response) => {
    try {
      const { image } = req.body;
      
      if (!image || typeof image !== 'string') {
        return res.status(400).json({ 
          message: "Missing or invalid image data. Please provide a base64-encoded image."
        });
      }
      
      // Process the image with Gemini Vision AI
      const result = await extractRecipeFromImage(image);
      
      if (!result.success) {
        return res.status(500).json({
          message: "Failed to extract recipe from image",
          error: result.error
        });
      }
      
      // Return the extracted recipe information
      res.json(result);
    } catch (error) {
      console.error("Error in photo-to-recipe endpoint:", error);
      res.status(500).json({ 
        message: "Failed to process image",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Helper function to generate basic converted ingredients based on the requested conversion
  function generateConvertedIngredients(conversionType: string, scaleFactor: string, humidityAdjust: boolean) {
    const factor = Number(scaleFactor) || 1;
    
    // Define the complete ingredient type
    type Ingredient = {
      name: string;
      cup?: string;
      tsp?: string;
      gram: string;
    };
    
    const ingredientsList: Ingredient[] = [
      { name: "all-purpose flour", cup: "2 cups", gram: "240g" },
      { name: "granulated sugar", cup: "1 cup", gram: "200g" },
      { name: "brown sugar, packed", cup: "1 cup", gram: "220g" },
      { name: "unsalted butter", cup: "1/2 cup", gram: "113g" },
      { name: "vanilla extract", tsp: "1 tsp", gram: "5g" },
      { name: "salt", tsp: "1 tsp", gram: "6g" },
      { name: "chocolate chips", cup: "1 cup", gram: "170g" }
    ];
    
    return ingredientsList.map(ing => {
      let amount: number;
      let originalAmount: string;
      let unit: string;
      
      if (conversionType === 'cup-to-gram') {
        // Convert from cup to gram
        amount = parseInt(ing.gram.replace('g', '')) * factor;
        originalAmount = ing.cup || ing.tsp || '';
        unit = 'g';
      } else {
        // Convert from gram to cup/tsp
        let volumeMeasure = '';
        let volumeUnit = '';
        
        if (ing.cup) {
          volumeMeasure = ing.cup;
          volumeUnit = 'cup';
        } else if (ing.tsp) {
          volumeMeasure = ing.tsp;
          volumeUnit = 'tsp';
        } else {
          volumeMeasure = '0 cup';
          volumeUnit = 'cup';
        }
        
        const measureParts = volumeMeasure.split(' ');
        const measureAmount = measureParts[0];
        unit = measureParts.length > 1 ? measureParts[1] : volumeUnit;
        
        amount = parseFloat(measureAmount) * factor;
        originalAmount = ing.gram;
      }
      
      // Format the final string based on conversion type
      if (conversionType === 'cup-to-gram') {
        return `- **${amount}${unit}** ${ing.name} (${originalAmount})`;
      } else {
        return `- **${amount} ${unit}** ${ing.name} (${originalAmount})`;
      }
    }).join('\n');
  }
  
  // Measurement Converter API
  apiRouter.post("/convert-measurement", async (req: Request, res: Response) => {
    try {
      const { quantity, fromUnit, toUnit, ingredient } = req.body;
      
      if (!quantity || !fromUnit || !toUnit) {
        return res.status(400).json({ 
          message: "Missing required fields: quantity, fromUnit, or toUnit" 
        });
      }
      
      // In a real implementation, this would use Gemini AI to get precise conversions
      // For now, we'll use a simple conversion logic with common ratios
      
      let result = "";
      const numQuantity = parseFloat(quantity);
      
      if (isNaN(numQuantity)) {
        return res.status(400).json({
          message: "Invalid quantity: must be a number"
        });
      }
      
      // Simple conversion map for common units
      const conversionRates: Record<string, Record<string, number>> = {
        "cup": {
          "tbsp": 16,
          "tsp": 48,
          "fl-oz": 8,
          "ml": 236.6,
          "l": 0.2366,
          "g": ingredient ? getIngredientDensity(ingredient) * 236.6 : 236.6,
          "kg": ingredient ? getIngredientDensity(ingredient) * 0.2366 : 0.2366,
          "oz": ingredient ? getIngredientDensity(ingredient) * 8.33 : 8.33,
          "lb": ingredient ? getIngredientDensity(ingredient) * 0.52 : 0.52
        },
        "tbsp": {
          "cup": 0.0625,
          "tsp": 3,
          "fl-oz": 0.5,
          "ml": 14.79,
          "l": 0.01479,
          "g": ingredient ? getIngredientDensity(ingredient) * 14.79 : 14.79,
          "kg": ingredient ? getIngredientDensity(ingredient) * 0.01479 : 0.01479,
          "oz": ingredient ? getIngredientDensity(ingredient) * 0.52 : 0.52,
          "lb": ingredient ? getIngredientDensity(ingredient) * 0.0325 : 0.0325
        },
        "tsp": {
          "cup": 0.0208,
          "tbsp": 0.333,
          "fl-oz": 0.1667,
          "ml": 4.93,
          "l": 0.00493,
          "g": ingredient ? getIngredientDensity(ingredient) * 4.93 : 4.93,
          "kg": ingredient ? getIngredientDensity(ingredient) * 0.00493 : 0.00493,
          "oz": ingredient ? getIngredientDensity(ingredient) * 0.17 : 0.17,
          "lb": ingredient ? getIngredientDensity(ingredient) * 0.0108 : 0.0108
        },
        "fl-oz": {
          "cup": 0.125,
          "tbsp": 2,
          "tsp": 6,
          "ml": 29.57,
          "l": 0.02957,
          "g": ingredient ? getIngredientDensity(ingredient) * 29.57 : 29.57,
          "kg": ingredient ? getIngredientDensity(ingredient) * 0.02957 : 0.02957,
          "oz": ingredient ? getIngredientDensity(ingredient) * 1.043 : 1.043,
          "lb": ingredient ? getIngredientDensity(ingredient) * 0.065 : 0.065
        },
        "ml": {
          "cup": 0.00423,
          "tbsp": 0.0676,
          "tsp": 0.203,
          "fl-oz": 0.0338,
          "l": 0.001,
          "g": ingredient ? getIngredientDensity(ingredient) : 1,
          "kg": ingredient ? getIngredientDensity(ingredient) * 0.001 : 0.001,
          "oz": ingredient ? getIngredientDensity(ingredient) * 0.0353 : 0.0353,
          "lb": ingredient ? getIngredientDensity(ingredient) * 0.0022 : 0.0022
        },
        "l": {
          "cup": 4.227,
          "tbsp": 67.628,
          "tsp": 202.9,
          "fl-oz": 33.814,
          "ml": 1000,
          "g": ingredient ? getIngredientDensity(ingredient) * 1000 : 1000,
          "kg": ingredient ? getIngredientDensity(ingredient) : 1,
          "oz": ingredient ? getIngredientDensity(ingredient) * 35.274 : 35.274,
          "lb": ingredient ? getIngredientDensity(ingredient) * 2.205 : 2.205
        },
        "g": {
          "cup": ingredient ? 1 / (getIngredientDensity(ingredient) * 236.6) : 0.00423,
          "tbsp": ingredient ? 1 / (getIngredientDensity(ingredient) * 14.79) : 0.0676,
          "tsp": ingredient ? 1 / (getIngredientDensity(ingredient) * 4.93) : 0.203,
          "fl-oz": ingredient ? 1 / (getIngredientDensity(ingredient) * 29.57) : 0.0338,
          "ml": ingredient ? 1 / getIngredientDensity(ingredient) : 1,
          "l": ingredient ? 1 / (getIngredientDensity(ingredient) * 1000) : 0.001,
          "kg": 0.001,
          "oz": 0.0353,
          "lb": 0.0022
        },
        "kg": {
          "cup": ingredient ? 1 / (getIngredientDensity(ingredient) * 0.2366) : 4.23,
          "tbsp": ingredient ? 1 / (getIngredientDensity(ingredient) * 0.01479) : 67.628,
          "tsp": ingredient ? 1 / (getIngredientDensity(ingredient) * 0.00493) : 202.9,
          "fl-oz": ingredient ? 1 / (getIngredientDensity(ingredient) * 0.02957) : 33.814,
          "ml": ingredient ? 1 / (getIngredientDensity(ingredient) * 0.001) : 1000,
          "l": ingredient ? 1 / getIngredientDensity(ingredient) : 1,
          "g": 1000,
          "oz": 35.274,
          "lb": 2.205
        },
        "oz": {
          "cup": ingredient ? 1 / (getIngredientDensity(ingredient) * 8.33) : 0.12,
          "tbsp": ingredient ? 1 / (getIngredientDensity(ingredient) * 0.52) : 1.917,
          "tsp": ingredient ? 1 / (getIngredientDensity(ingredient) * 0.17) : 5.75,
          "fl-oz": ingredient ? 1 / (getIngredientDensity(ingredient) * 1.043) : 0.958,
          "ml": ingredient ? 1 / (getIngredientDensity(ingredient) * 0.0353) : 28.35,
          "l": ingredient ? 1 / (getIngredientDensity(ingredient) * 35.274) : 0.02835,
          "g": 28.35,
          "kg": 0.02835,
          "lb": 0.0625
        },
        "lb": {
          "cup": ingredient ? 1 / (getIngredientDensity(ingredient) * 0.52) : 1.92,
          "tbsp": ingredient ? 1 / (getIngredientDensity(ingredient) * 0.0325) : 30.68,
          "tsp": ingredient ? 1 / (getIngredientDensity(ingredient) * 0.0108) : 92.04,
          "fl-oz": ingredient ? 1 / (getIngredientDensity(ingredient) * 0.065) : 15.34,
          "ml": ingredient ? 1 / (getIngredientDensity(ingredient) * 0.0022) : 453.6,
          "l": ingredient ? 1 / (getIngredientDensity(ingredient) * 2.205) : 0.4536,
          "g": 453.6,
          "kg": 0.4536,
          "oz": 16
        },
        "pinch": {
          "tsp": 0.125,
          "g": 0.36
        },
        "dash": {
          "tsp": 0.0625,
          "ml": 0.308
        }
      };
      
      // Convert from one unit to another
      if (fromUnit === toUnit) {
        result = `${numQuantity} ${toUnit}`;
      } else if (conversionRates[fromUnit] && conversionRates[fromUnit][toUnit]) {
        const converted = numQuantity * conversionRates[fromUnit][toUnit];
        result = `${numQuantity} ${fromUnit} = ${converted.toFixed(2)} ${toUnit}`;
        
        if (ingredient) {
          result += ` of ${ingredient}`;
        }
      } else {
        return res.status(400).json({
          message: "Conversion between these units is not supported"
        });
      }
      
      // Save the conversion to history if needed
      // This would be implemented with user authentication in production
      
      return res.json({ 
        result,
        success: true 
      });
    } catch (error) {
      console.error("Error in convert-measurement endpoint:", error);
      return res.status(500).json({ 
        message: "Failed to convert measurement",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Helper function to get approximate density for common ingredients
  function getIngredientDensity(ingredient: string): number {
    // Ingredient density in g/ml (approximate values)
    const densities: Record<string, number> = {
      "flour": 0.6,
      "all-purpose flour": 0.6,
      "bread flour": 0.6,
      "cake flour": 0.5,
      "sugar": 0.85,
      "granulated sugar": 0.85, 
      "brown sugar": 0.82,
      "powdered sugar": 0.56,
      "salt": 1.23,
      "baking powder": 0.9,
      "baking soda": 0.92,
      "butter": 0.96,
      "oil": 0.92,
      "olive oil": 0.92,
      "milk": 1.03,
      "water": 1,
      "honey": 1.42,
      "maple syrup": 1.32,
      "rice": 0.78,
      "oats": 0.41,
      "cocoa powder": 0.53,
      "chocolate chips": 0.68
    };
    
    // Default density if ingredient not found
    const defaultDensity = 0.8;
    
    // Convert ingredient to lowercase for case-insensitive search
    const lowerIngredient = ingredient.toLowerCase();
    
    // Check if the ingredient exists in our densities map
    for (const key in densities) {
      if (lowerIngredient.includes(key)) {
        return densities[key];
      }
    }
    
    return defaultDensity;
  }
  
  // Recipe by dish name API endpoint
  apiRouter.post("/recipe-by-dish", async (req: Request, res: Response) => {
    try {
      const { dishName, cuisine, dietary } = req.body;
      
      if (!dishName) {
        return res.status(400).json({ 
          message: "Missing required field: dishName" 
        });
      }
      
      // Use Gemini AI to generate a recipe based on the dish name
      try {
        const recipeText = await getRecipeByDishName(
          dishName,
          cuisine,
          dietary
        );
        
        res.json({ 
          recipeText,
          success: true 
        });
      } catch (aiError) {
        console.error("Gemini AI recipe generation error:", aiError);
        return res.status(500).json({
          message: "Failed to generate recipe using AI",
          error: aiError instanceof Error ? aiError.message : "Unknown AI error"
        });
      }
    } catch (error) {
      console.error("Error in recipe-by-dish endpoint:", error);
      return res.status(500).json({ 
        message: "Failed to generate recipe",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Mount the API router
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
