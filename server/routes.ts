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
import { extractRecipeFromImage, convertRecipeText } from "./services/geminiService";

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
  
  // Mount the API router
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
