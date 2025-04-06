import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Social links schema
export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  username: text("username").notNull(),
  url: text("url").notNull(),
  iconClass: text("icon_class").notNull(),
  bgColorClass: text("bg_color_class").notNull(),
  user_id: integer("user_id").references(() => users.id),
});

export const insertSocialLinkSchema = createInsertSchema(socialLinks).pick({
  platform: true,
  username: true,
  url: true,
  iconClass: true,
  bgColorClass: true,
  user_id: true,
});

// Recipes schema
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  ingredients: jsonb("ingredients").notNull(),
  instructions: text("instructions").notNull(),
  imageUrl: text("image_url"),
  featured: boolean("featured").default(false),
  user_id: integer("user_id").references(() => users.id),
});

export const insertRecipeSchema = createInsertSchema(recipes).pick({
  title: true,
  description: true,
  ingredients: true,
  instructions: true,
  imageUrl: true,
  featured: true,
  user_id: true,
});

// Conversion history schema
export const conversionHistory = pgTable("conversion_history", {
  id: serial("id").primaryKey(),
  originalRecipe: text("original_recipe").notNull(),
  convertedRecipe: text("converted_recipe").notNull(),
  conversionType: text("conversion_type").notNull(),
  scaleFactor: text("scale_factor").notNull(),
  timestamp: text("timestamp").notNull(),
  user_id: integer("user_id").references(() => users.id),
});

export const insertConversionHistorySchema = createInsertSchema(conversionHistory).pick({
  originalRecipe: true,
  convertedRecipe: true,
  conversionType: true,
  scaleFactor: true,
  timestamp: true,
  user_id: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type SocialLink = typeof socialLinks.$inferSelect;
export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;

export type ConversionHistory = typeof conversionHistory.$inferSelect;
export type InsertConversionHistory = z.infer<typeof insertConversionHistorySchema>;
