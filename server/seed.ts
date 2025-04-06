import { db } from './db';
import { socialLinks, recipes } from '../shared/schema';

// Seed initial data for the database
export async function seedDatabase() {
  try {
    console.log('Seeding database with initial data...');
    
    // Check if social links already exist
    const existingLinks = await db.select().from(socialLinks);
    if (existingLinks.length === 0) {
      // Seed default social links
      const defaultLinks = [
        { platform: "Instagram", username: "@precision_baking", url: "#", iconClass: "ri-instagram-line", bgColorClass: "primary", user_id: null },
        { platform: "Twitter", username: "@precision_baking", url: "#", iconClass: "ri-twitter-x-line", bgColorClass: "accent", user_id: null },
        { platform: "GitHub", username: "@precision_baking", url: "#", iconClass: "ri-github-fill", bgColorClass: "secondary", user_id: null },
        { platform: "Pinterest", username: "@precision_baking", url: "#", iconClass: "ri-pinterest-line", bgColorClass: "primary", user_id: null },
        { platform: "YouTube", username: "Precision Baking", url: "#", iconClass: "ri-youtube-line", bgColorClass: "secondary", user_id: null },
        { platform: "Facebook", username: "Precision Baking", url: "#", iconClass: "ri-facebook-circle-line", bgColorClass: "accent", user_id: null }
      ];
      
      await db.insert(socialLinks).values(defaultLinks);
      console.log('Inserted default social links');
    }
    
    // Check if recipes already exist
    const existingRecipes = await db.select().from(recipes);
    if (existingRecipes.length === 0) {
      // Seed default recipes
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
          featured: true,
          user_id: null
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
          featured: true,
          user_id: null
        }
      ];
      
      await db.insert(recipes).values(defaultRecipes);
      console.log('Inserted default recipes');
    }
    
    console.log('Database seeding completed.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}