import { 
  users, 
  socialLinks, 
  recipes, 
  conversionHistory,
  type User, 
  type InsertUser,
  type SocialLink,
  type InsertSocialLink,
  type Recipe,
  type InsertRecipe,
  type ConversionHistory,
  type InsertConversionHistory
} from "@shared/schema";
import { db } from './db';
import { eq } from 'drizzle-orm';

// Storage interface with CRUD methods
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Social link operations
  getSocialLinks(userId?: number): Promise<SocialLink[]>;
  createSocialLink(socialLink: InsertSocialLink): Promise<SocialLink>;
  updateSocialLink(id: number, socialLink: Partial<InsertSocialLink>): Promise<SocialLink | undefined>;
  deleteSocialLink(id: number): Promise<boolean>;
  
  // Recipe operations
  getRecipes(userId?: number, featured?: boolean): Promise<Recipe[]>;
  getRecipe(id: number): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: number, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined>;
  deleteRecipe(id: number): Promise<boolean>;
  
  // Conversion history operations
  getConversionHistory(userId?: number): Promise<ConversionHistory[]>;
  saveConversionHistory(conversionHistory: InsertConversionHistory): Promise<ConversionHistory>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Social link methods
  async getSocialLinks(userId?: number): Promise<SocialLink[]> {
    if (userId) {
      return db.select().from(socialLinks).where(eq(socialLinks.user_id, userId));
    }
    return db.select().from(socialLinks);
  }
  
  async createSocialLink(insertSocialLink: InsertSocialLink): Promise<SocialLink> {
    const [link] = await db.insert(socialLinks).values(insertSocialLink).returning();
    return link;
  }
  
  async updateSocialLink(id: number, socialLink: Partial<InsertSocialLink>): Promise<SocialLink | undefined> {
    const [updated] = await db
      .update(socialLinks)
      .set(socialLink)
      .where(eq(socialLinks.id, id))
      .returning();
    return updated;
  }
  
  async deleteSocialLink(id: number): Promise<boolean> {
    await db
      .delete(socialLinks)
      .where(eq(socialLinks.id, id));
    // Assume success if no error is thrown
    return true;
  }
  
  // Recipe methods
  async getRecipes(userId?: number, featured?: boolean): Promise<Recipe[]> {
    // Handle all filtering combinations
    if (userId && featured !== undefined) {
      return db.select().from(recipes)
        .where(eq(recipes.user_id, userId))
        .where(eq(recipes.featured, featured));
    } else if (userId) {
      return db.select().from(recipes)
        .where(eq(recipes.user_id, userId));
    } else if (featured !== undefined) {
      return db.select().from(recipes)
        .where(eq(recipes.featured, featured));
    } else {
      return db.select().from(recipes);
    }
  }
  
  async getRecipe(id: number): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe;
  }
  
  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const [recipe] = await db.insert(recipes).values(insertRecipe).returning();
    return recipe;
  }
  
  async updateRecipe(id: number, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const [updated] = await db
      .update(recipes)
      .set(recipe)
      .where(eq(recipes.id, id))
      .returning();
    return updated;
  }
  
  async deleteRecipe(id: number): Promise<boolean> {
    await db
      .delete(recipes)
      .where(eq(recipes.id, id));
    // Assume success if no error is thrown
    return true;
  }
  
  // Conversion history methods
  async getConversionHistory(userId?: number): Promise<ConversionHistory[]> {
    if (userId) {
      return db.select().from(conversionHistory).where(eq(conversionHistory.user_id, userId));
    }
    return db.select().from(conversionHistory);
  }
  
  async saveConversionHistory(insertHistory: InsertConversionHistory): Promise<ConversionHistory> {
    const [history] = await db.insert(conversionHistory).values(insertHistory).returning();
    return history;
  }
}

// Export the storage instance
export const storage = new DatabaseStorage();
