import { useState } from "react";
import Header from "@/components/Header";
import RecipeConverter from "@/components/RecipeConverter";
import Footer from "@/components/Footer";

export default function RecipePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Header />
      
      <div className="my-8">
        <h1 className="text-3xl font-bold text-center mb-2">Recipe Finder & Converter</h1>
        <p className="text-center text-gray-600 mb-8">
          Find any recipe by ingredients or photo, and convert measurements with precision
        </p>
        
        <RecipeConverter />
      </div>
      
      <Footer />
    </div>
  );
}