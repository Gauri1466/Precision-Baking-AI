import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Scale, Camera, Receipt, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Your Ultimate Recipe Assistant
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Find any recipe, convert measurements precisely, and cook with confidence using our AI-powered tools
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/recipe">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Find & Convert Recipes <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/measurement">
            <Button size="lg" variant="outline">
              Convert Measurements <Scale className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Our Features</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-6 w-6 text-primary" /> 
                Recipe Finder & Converter
              </CardTitle>
              <CardDescription>
                Find and convert recipes with ease
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Find recipes by ingredients you have on hand</li>
                <li>Extract recipes from photos of cookbooks or recipe cards</li>
                <li>Convert volume measurements to precise weights</li>
                <li>Scale recipes up or down to any serving size</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/recipe">
                <Button variant="secondary" className="w-full">
                  Try Recipe Finder <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-6 w-6 text-primary" /> 
                Measurement Converter
              </CardTitle>
              <CardDescription>
                Convert any cooking measurement with precision
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Convert between volume and weight measurements</li>
                <li>Ingredient-specific conversions for better accuracy</li>
                <li>Support for all common cooking units</li>
                <li>AI-powered precision for perfect results</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/measurement">
                <Button variant="secondary" className="w-full">
                  Try Measurement Converter <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Capture or Input</h3>
            <p className="text-gray-600">
              Upload a photo of a recipe or enter ingredients/measurements you want to convert
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Processing</h3>
            <p className="text-gray-600">
              Our AI analyzes your input and applies precise conversion formulas
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Get Results</h3>
            <p className="text-gray-600">
              Receive your converted recipe or measurements with perfect precision
            </p>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
