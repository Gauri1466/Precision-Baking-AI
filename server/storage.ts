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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private socialLinksMap: Map<number, SocialLink>;
  private recipesMap: Map<number, Recipe>;
  private conversionHistoryMap: Map<number, ConversionHistory>;
  
  private userIdCounter: number;
  private socialLinkIdCounter: number;
  private recipeIdCounter: number;
  private conversionHistoryIdCounter: number;

  constructor() {
    this.users = new Map();
    this.socialLinksMap = new Map();
    this.recipesMap = new Map();
    this.conversionHistoryMap = new Map();
    
    this.userIdCounter = 1;
    this.socialLinkIdCounter = 1;
    this.recipeIdCounter = 1;
    this.conversionHistoryIdCounter = 1;
    
    // Initialize with default social links
    const defaultLinks = [
      { platform: "Instagram", username: "@precision_baking", url: "#", iconClass: "ri-instagram-line", bgColorClass: "primary" },
      { platform: "Twitter", username: "@precision_baking", url: "#", iconClass: "ri-twitter-x-line", bgColorClass: "accent" },
      { platform: "GitHub", username: "@precision_baking", url: "#", iconClass: "ri-github-fill", bgColorClass: "secondary" },
      { platform: "Pinterest", username: "@precision_baking", url: "#", iconClass: "ri-pinterest-line", bgColorClass: "primary" },
      { platform: "YouTube", username: "Precision Baking", url: "#", iconClass: "ri-youtube-line", bgColorClass: "secondary" },
      { platform: "Facebook", username: "Precision Baking", url: "#", iconClass: "ri-facebook-circle-line", bgColorClass: "accent" }
    ];
    
    // Add each default link to the storage
    defaultLinks.forEach(link => {
      this.socialLinksMap.set(this.socialLinkIdCounter, {
        id: this.socialLinkIdCounter,
        ...link,
        user_id: null
      });
      this.socialLinkIdCounter++;
    });
    
    // Initialize with default featured recipes
    const defaultRecipes = [
      {
        title: "Perfect Chocolate Chip Cookies",
        description: "Precision measurements for the perfect chewy texture.",
        ingredients: [
          { name: "all-purpose flour", amount: "2 cups", weight: "240g" },
          { name: "granulated sugar", amount: "1 cup", weight: "200g" },
          { name: "brown sugar, packed", amount: "1 cup", weight: "220g" },
          { name: "unsalted butter", amount: "1/2 cup", weight: "113g" },
          { name: "vanilla extract", amount: "1 tsp", weight: "5g" },
          { name: "salt", amount: "1 tsp", weight: "6g" },
          { name: "chocolate chips", amount: "1 cup", weight: "170g" }
        ],
        instructions: "Mix dry ingredients. Cream butter and sugars. Add vanilla. Combine and fold in chocolate chips. Bake at 350°F for 12-15 minutes.",
        imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        featured: true
      },
      {
        title: "Vanilla Bean Cupcakes",
        description: "Light and fluffy cupcakes with precise measurements.",
        ingredients: [
          { name: "cake flour", amount: "1 3/4 cups", weight: "190g" },
          { name: "granulated sugar", amount: "1 cup", weight: "200g" },
          { name: "baking powder", amount: "1.5 tsp", weight: "6g" },
          { name: "unsalted butter", amount: "1/2 cup", weight: "113g" },
          { name: "vanilla bean paste", amount: "2 tsp", weight: "10g" },
          { name: "eggs", amount: "2 large", weight: "100g" },
          { name: "milk", amount: "3/4 cup", weight: "180g" }
        ],
        instructions: "Cream butter and sugar. Add eggs one at a time. Alternate adding dry ingredients and milk. Bake at 350°F for 18-20 minutes.",
        imageUrl: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        featured: true
      }
    ];
    
    // Add each default recipe to the storage
    defaultRecipes.forEach(recipe => {
      this.recipesMap.set(this.recipeIdCounter, {
        id: this.recipeIdCounter,
        ...recipe,
        user_id: null
      });
      this.recipeIdCounter++;
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Social link methods
  async getSocialLinks(userId?: number): Promise<SocialLink[]> {
    const links = Array.from(this.socialLinksMap.values());
    if (userId) {
      return links.filter(link => link.user_id === userId);
    }
    return links;
  }
  
  async createSocialLink(insertSocialLink: InsertSocialLink): Promise<SocialLink> {
    const id = this.socialLinkIdCounter++;
    const socialLink: SocialLink = { ...insertSocialLink, id };
    this.socialLinksMap.set(id, socialLink);
    return socialLink;
  }
  
  async updateSocialLink(id: number, socialLink: Partial<InsertSocialLink>): Promise<SocialLink | undefined> {
    const existingLink = this.socialLinksMap.get(id);
    if (!existingLink) {
      return undefined;
    }
    
    const updatedLink = { ...existingLink, ...socialLink };
    this.socialLinksMap.set(id, updatedLink);
    return updatedLink;
  }
  
  async deleteSocialLink(id: number): Promise<boolean> {
    return this.socialLinksMap.delete(id);
  }
  
  // Recipe methods
  async getRecipes(userId?: number, featured?: boolean): Promise<Recipe[]> {
    let recipes = Array.from(this.recipesMap.values());
    
    if (userId) {
      recipes = recipes.filter(recipe => recipe.user_id === userId);
    }
    
    if (featured !== undefined) {
      recipes = recipes.filter(recipe => recipe.featured === featured);
    }
    
    return recipes;
  }
  
  async getRecipe(id: number): Promise<Recipe | undefined> {
    return this.recipesMap.get(id);
  }
  
  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const id = this.recipeIdCounter++;
    const recipe: Recipe = { ...insertRecipe, id };
    this.recipesMap.set(id, recipe);
    return recipe;
  }
  
  async updateRecipe(id: number, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const existingRecipe = this.recipesMap.get(id);
    if (!existingRecipe) {
      return undefined;
    }
    
    const updatedRecipe = { ...existingRecipe, ...recipe };
    this.recipesMap.set(id, updatedRecipe);
    return updatedRecipe;
  }
  
  async deleteRecipe(id: number): Promise<boolean> {
    return this.recipesMap.delete(id);
  }
  
  // Conversion history methods
  async getConversionHistory(userId?: number): Promise<ConversionHistory[]> {
    const history = Array.from(this.conversionHistoryMap.values());
    
    if (userId) {
      return history.filter(item => item.user_id === userId);
    }
    
    return history;
  }
  
  async saveConversionHistory(insertHistory: InsertConversionHistory): Promise<ConversionHistory> {
    const id = this.conversionHistoryIdCounter++;
    const historyItem: ConversionHistory = { ...insertHistory, id };
    this.conversionHistoryMap.set(id, historyItem);
    return historyItem;
  }
}

// Export the storage instance
export const storage = new MemStorage();
