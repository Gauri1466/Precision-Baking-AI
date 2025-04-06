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
      
      // This would be replaced with actual Gemini AI call in a production environment
      // For now, we'll return a mock response based on the input
      const convertedRecipe = `
## ${recipeText.split('\n')[0] || "Converted Recipe"}

${generateConvertedIngredients(conversionType, scaleFactor, humidityAdjust)}

${proMode ? "**Professional Baker Notes:** For optimal results, maintain dough temperature between 68-72°F during mixing. Final hydration should be 65-68% depending on flour protein content." : ""}
${humidityAdjust ? "**Humidity adjustment applied:** Reduced flour by 5g to account for high humidity." : ""}
      `;
      
      // Save to conversion history if user is logged in
      // This would be implemented with actual user authentication in production
      
      res.json({ 
        convertedRecipe,
        success: true 
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to convert recipe", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Helper function to generate mock converted ingredients based on the requested conversion
  function generateConvertedIngredients(conversionType: string, scaleFactor: string, humidityAdjust: boolean) {
    const factor = Number(scaleFactor) || 1;
    
    const ingredientsList = [
      { name: "all-purpose flour", cup: "2 cups", gram: "240g" },
      { name: "granulated sugar", cup: "1 cup", gram: "200g" },
      { name: "brown sugar, packed", cup: "1 cup", gram: "220g" },
      { name: "unsalted butter", cup: "1/2 cup", gram: "113g" },
      { name: "vanilla extract", tsp: "1 tsp", gram: "5g" },
      { name: "salt", tsp: "1 tsp", gram: "6g" },
      { name: "chocolate chips", cup: "1 cup", gram: "170g" }
    ];
    
    return ingredientsList.map(ing => {
      let amount;
      let originalAmount;
      
      if (conversionType === 'cup-to-gram') {
        amount = parseInt(ing.gram) * factor;
        originalAmount = ing.cup;
        return `- **${amount}g** ${ing.name} (${originalAmount})`;
      } else {
        const cupAmount = ing.cup.split(' ')[0];
        amount = parseFloat(cupAmount) * factor;
        originalAmount = ing.gram;
        return `- **${amount} ${ing.cup.split(' ')[1]}** ${ing.name} (${originalAmount})`;
      }
    }).join('\n');
  }
  
  // Mount the API router
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
