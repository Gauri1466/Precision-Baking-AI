import { useState } from "react";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import BioLinks from "@/components/BioLinks";
import RecipeConverter from "@/components/RecipeConverter";
import Footer from "@/components/Footer";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"bio" | "converter">("bio");

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Header />
      
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === "bio" ? <BioLinks /> : <RecipeConverter />}
      
      <Footer />
    </div>
  );
}
