import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IngredientTable from "./IngredientTable";
import { Loader2, Copy, CheckCircle2, Upload, Camera, Image, ChefHat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RecipeConverter() {
  const { toast } = useToast();
  const [recipeInput, setRecipeInput] = useState("");
  const [conversionType, setConversionType] = useState("cup-to-gram");
  const [scaleFactor, setScaleFactor] = useState("1");
  const [customScaleFactor, setCustomScaleFactor] = useState("1.5");
  const [showCustomScale, setShowCustomScale] = useState(false);
  const [actualScaleFactor, setActualScaleFactor] = useState("1");
  const [humidityAdjust, setHumidityAdjust] = useState(false);
  const [proMode, setProMode] = useState(false);
  const [convertedResult, setConvertedResult] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("text-input");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [cuisineType, setCuisineType] = useState("any");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("none");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Text-based recipe conversion mutation
  const convertMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/convert-recipe", data);
      return response.json();
    },
    onSuccess: (data) => {
      setConvertedResult(data.convertedRecipe);
      toast({
        title: "Recipe Converted",
        description: "Your recipe has been successfully converted",
      });
    },
    onError: (error) => {
      toast({
        title: "Conversion Failed",
        description: error instanceof Error ? error.message : "Failed to convert recipe",
        variant: "destructive",
      });
    },
  });
  
  // Photo-to-recipe mutation
  const photoToRecipeMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const response = await apiRequest("POST", "/api/photo-to-recipe", { image: imageData });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setConvertedResult(data.recipeText);
        toast({
          title: "Recipe Extracted",
          description: "Recipe successfully extracted from the image",
        });
      } else {
        toast({
          title: "Extraction Error",
          description: data.error || "Failed to extract recipe from image",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to process image",
        variant: "destructive",
      });
    },
  });
  
  // Recipe by dish name mutation
  const recipeByDishMutation = useMutation({
    mutationFn: async (data: { dishName: string; cuisine: string; dietary: string }) => {
      const response = await apiRequest("POST", "/api/recipe-by-dish", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setConvertedResult(data.recipeText);
        toast({
          title: "Recipe Generated",
          description: "Recipe successfully generated for your dish",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: data.error || "Failed to generate recipe for dish",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Recipe Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate recipe",
        variant: "destructive",
      });
    },
  });
  
  const handleConversion = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipeInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a recipe to convert",
        variant: "destructive",
      });
      return;
    }
    
    // Use the actual scale factor for conversion
    let scaleFactorToUse = showCustomScale ? customScaleFactor : scaleFactor;
    
    convertMutation.mutate({
      recipeText: recipeInput,
      conversionType,
      scaleFactor: scaleFactorToUse,
      humidityAdjust,
      proMode,
    });
  };
  
  const handleCopyResult = () => {
    if (convertedResult) {
      navigator.clipboard.writeText(convertedResult);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      
      toast({
        title: "Copied to clipboard",
        description: "The converted recipe has been copied to your clipboard",
      });
    }
  };
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPG or PNG image",
        variant: "destructive",
      });
      return;
    }
    
    // Read the file as a data URL
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewImage(result);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle photo to recipe extraction
  const handlePhotoExtraction = () => {
    if (!previewImage) {
      toast({
        title: "No Image Selected",
        description: "Please upload an image containing a recipe",
        variant: "destructive",
      });
      return;
    }
    
    photoToRecipeMutation.mutate(previewImage);
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Handle dish name search
  const handleDishNameSearch = () => {
    if (!recipeInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a dish name to generate a recipe",
        variant: "destructive",
      });
      return;
    }
    
    recipeByDishMutation.mutate({
      dishName: recipeInput,
      cuisine: cuisineType,
      dietary: dietaryRestrictions
    });
  };

  return (
    <div>
      <Card className="mb-4 sm:mb-8">
        <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
          <h2 className="font-heading text-xl sm:text-2xl font-bold mb-2 sm:mb-4">Recipe Converter</h2>
          <p className="mb-4 sm:mb-6 text-xs sm:text-sm md:text-base text-gray-700">
            Convert vague measurements like "1 cup of flour" into exact weights like "120 grams" for perfect results every time.
          </p>
          
          {/* Input Method Tabs - Responsive for all screen sizes */}
          <Tabs defaultValue="text-input" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
              <TabsTrigger value="text-input" className="flex items-center justify-center py-3 sm:py-2">
                <span className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Generate or Convert</span>
                  <span className="sm:hidden">Text Input</span>
                </span>
              </TabsTrigger>
              <TabsTrigger value="photo-input" className="flex items-center justify-center py-3 sm:py-2">
                <span className="flex items-center">
                  <Camera className="h-4 w-4 mr-2" />
                  <span>Photo to Recipe</span>
                </span>
              </TabsTrigger>
              <TabsTrigger value="dish-input" className="flex items-center justify-center py-3 sm:py-2">
                <span className="flex items-center">
                  <ChefHat className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Generate by Dish Name</span>
                  <span className="sm:hidden">Dish Search</span>
                </span>
              </TabsTrigger>
            </TabsList>
            
            {/* Text Input Tab */}
            <TabsContent value="text-input">
              <form onSubmit={handleConversion}>
                <div className="mb-4 sm:mb-6">
                  <Label htmlFor="recipe-input" className="block text-sm font-medium mb-1 sm:mb-2">
                    Enter Ingredients or Recipe
                  </Label>
                  <div className="text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2">
                    <div>Our AI can:</div>
                    <ul className="list-disc pl-4 sm:pl-5 mt-1 mb-1 sm:mb-2 space-y-[2px] sm:space-y-1">
                      <li>Generate a complete recipe from a list of ingredients</li>
                      <li>Convert measurements in an existing recipe (cup → gram or gram → cup)</li>
                    </ul>
                  </div>
                  <Textarea
                    id="recipe-input"
                    className="min-h-[100px] sm:min-h-[150px] resize-y text-xs sm:text-sm"
                    placeholder="Enter ingredients (one per line) or paste a complete recipe to convert..."
                    value={recipeInput}
                    onChange={(e) => setRecipeInput(e.target.value)}
                  />
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    Our AI detects whether you've entered ingredients or a recipe and processes accordingly.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div>
                    <Label htmlFor="conversion-type" className="block text-sm font-medium mb-1 sm:mb-2">
                      Conversion Type
                    </Label>
                    <Select 
                      value={conversionType} 
                      onValueChange={setConversionType}
                    >
                      <SelectTrigger id="conversion-type" className="h-9 sm:h-10 text-xs sm:text-sm">
                        <SelectValue placeholder="Select conversion type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cup-to-gram">Cups to Grams</SelectItem>
                        <SelectItem value="gram-to-cup">Grams to Cups</SelectItem>
                        <SelectItem value="oz-to-gram">Ounces to Grams</SelectItem>
                        <SelectItem value="tbsp-to-gram">Tablespoons to Grams</SelectItem>
                        <SelectItem value="gram-to-tbsp">Grams to Tablespoons</SelectItem>
                        <SelectItem value="tsp-to-gram">Teaspoons to Grams</SelectItem>
                        <SelectItem value="gram-to-tsp">Grams to Teaspoons</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="scale-factor" className="block text-sm font-medium mb-1 sm:mb-2">
                      Scale Recipe
                    </Label>
                    <Select 
                      value={scaleFactor} 
                      onValueChange={(value) => {
                        if (value === "custom") {
                          setShowCustomScale(true);
                        } else {
                          setShowCustomScale(false);
                          setScaleFactor(value);
                        }
                      }}
                    >
                      <SelectTrigger id="scale-factor" className="h-9 sm:h-10 text-xs sm:text-sm">
                        <SelectValue placeholder="Select scale factor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">No Scaling (1x)</SelectItem>
                        <SelectItem value="0.5">Half (0.5x)</SelectItem>
                        <SelectItem value="2">Double (2x)</SelectItem>
                        <SelectItem value="3">Triple (3x)</SelectItem>
                        <SelectItem value="custom">Custom...</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Custom scale factor input - Responsive */}
                {showCustomScale && (
                  <div className="mb-3 sm:mb-4">
                    <Label htmlFor="custom-scale-factor" className="block text-sm font-medium mb-1 sm:mb-2">
                      Enter Custom Scale Factor
                    </Label>
                    <div className="flex gap-2 sm:gap-4">
                      <Input
                        id="custom-scale-factor"
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="1.5"
                        value={customScaleFactor}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = e.target.value;
                          setCustomScaleFactor(value);
                          // Don't update scaleFactor here, we'll use customScaleFactor directly in handleConversion
                        }}
                        className="w-24 sm:w-32 h-9 sm:h-10 text-xs sm:text-sm"
                      />
                      <Button 
                        type="button"
                        variant="outline"
                        className="h-9 sm:h-10 text-xs sm:text-sm"
                        onClick={() => {
                          if (parseFloat(customScaleFactor) > 0) {
                            setScaleFactor(customScaleFactor);
                            setShowCustomScale(false);
                            toast({
                              title: "Scale Factor Applied",
                              description: `Recipe will be scaled by ${customScaleFactor}x`,
                            });
                          } else {
                            toast({
                              title: "Invalid Scale Factor",
                              description: "Please enter a positive number",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Apply
                      </Button>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                      Enter a value like 1.25 (for 1.25x) or 0.75 (for 3/4 sized recipe)
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Checkbox 
                      id="humidity-adjust" 
                      checked={humidityAdjust}
                      onCheckedChange={(checked) => setHumidityAdjust(checked as boolean)}
                      className="h-3 w-3 sm:h-4 sm:w-4"
                    />
                    <Label htmlFor="humidity-adjust" className="text-xs sm:text-sm">
                      Adjust for Humidity
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Checkbox 
                      id="pro-mode" 
                      checked={proMode}
                      onCheckedChange={(checked) => setProMode(checked as boolean)}
                      className="h-3 w-3 sm:h-4 sm:w-4"
                    />
                    <Label htmlFor="pro-mode" className="text-xs sm:text-sm">
                      Professional Baker Mode
                    </Label>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto py-2 sm:py-4 h-auto"
                  disabled={convertMutation.isPending}
                >
                  {convertMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Generating Recipe...</span>
                      <span className="sm:hidden">Generating...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Generate or Convert Recipe</span>
                      <span className="sm:hidden">Generate Recipe</span>
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            {/* Photo Input Tab - Responsive for mobile and tablet */}
            <TabsContent value="photo-input">
              <div className="mb-6">
                <Label className="block text-sm font-medium mb-2">
                  Upload a Photo of a Recipe or Dish
                </Label>
                
                {/* Hidden file input */}
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                />
                
                {/* File Upload UI - Responsive */}
                {!previewImage ? (
                  <div 
                    onClick={triggerFileInput}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors min-h-[180px]"
                  >
                    <Image className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-2 sm:mb-3" />
                    <p className="text-center text-xs sm:text-sm text-gray-500 px-2 sm:px-4">
                      Click to upload a photo of a recipe card, book page, handwritten recipe, or any food dish
                    </p>
                    <p className="text-center text-xs text-gray-400 mt-1 sm:mt-2">
                      Supports JPG, JPEG, PNG formats
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={previewImage} 
                      alt="Recipe preview" 
                      className="w-full h-auto rounded-lg max-h-[200px] sm:max-h-[300px] object-contain bg-gray-100" 
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2 text-xs px-2 py-1 h-auto sm:h-9"
                      onClick={() => setPreviewImage(null)}
                    >
                      <span className="hidden sm:inline">Replace</span>
                      <span className="sm:hidden">×</span>
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  <div>Our AI will analyze the image and either:</div>
                  <ul className="list-disc pl-4 sm:pl-5 mt-1 sm:mt-2 space-y-1">
                    <li>Extract a recipe from recipe cards, book pages, or handwritten recipes</li>
                    <li>Identify the dish from a food photo and generate a complete recipe for it</li>
                  </ul>
                </div>
                
                <Button 
                  type="button" 
                  className="bg-primary hover:bg-primary/90 text-white w-full py-2 sm:py-4 h-auto"
                  disabled={!previewImage || photoToRecipeMutation.isPending}
                  onClick={handlePhotoExtraction}
                >
                  {photoToRecipeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Extracting Recipe...</span>
                      <span className="sm:hidden">Extracting...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Extract Recipe from Photo</span>
                      <span className="sm:hidden">Extract Recipe</span>
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            {/* Dish Name Input Tab - Responsive for mobile and tablet */}
            <TabsContent value="dish-input">
              <div className="mb-6">
                <Label htmlFor="dish-name" className="block text-sm font-medium mb-2">
                  Enter a Dish Name
                </Label>
                <div className="space-y-3 sm:space-y-4">
                  <Textarea
                    id="dish-name"
                    className="resize-y min-h-[100px] sm:min-h-[150px]"
                    placeholder="Enter a dish name (e.g., Chocolate Chip Cookies, Beef Stroganoff)..."
                    value={recipeInput}
                    onChange={(e) => setRecipeInput(e.target.value)}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="cuisine-type" className="block text-sm font-medium mb-1 sm:mb-2">
                        Cuisine Type (Optional)
                      </Label>
                      <Select 
                        value={cuisineType} 
                        onValueChange={setCuisineType}
                      >
                        <SelectTrigger id="cuisine-type" className="h-9 sm:h-10">
                          <SelectValue placeholder="Select cuisine type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any Cuisine</SelectItem>
                          <SelectItem value="italian">Italian</SelectItem>
                          <SelectItem value="french">French</SelectItem>
                          <SelectItem value="mexican">Mexican</SelectItem>
                          <SelectItem value="chinese">Chinese</SelectItem>
                          <SelectItem value="indian">Indian</SelectItem>
                          <SelectItem value="thai">Thai</SelectItem>
                          <SelectItem value="japanese">Japanese</SelectItem>
                          <SelectItem value="mediterranean">Mediterranean</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="dietary-restrictions" className="block text-sm font-medium mb-1 sm:mb-2">
                        Dietary Restrictions (Optional)
                      </Label>
                      <Select 
                        value={dietaryRestrictions} 
                        onValueChange={setDietaryRestrictions}
                      >
                        <SelectTrigger id="dietary-restrictions" className="h-9 sm:h-10">
                          <SelectValue placeholder="Select restrictions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Restrictions</SelectItem>
                          <SelectItem value="vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="vegan">Vegan</SelectItem>
                          <SelectItem value="gluten-free">Gluten-Free</SelectItem>
                          <SelectItem value="dairy-free">Dairy-Free</SelectItem>
                          <SelectItem value="keto">Keto</SelectItem>
                          <SelectItem value="paleo">Paleo</SelectItem>
                          <SelectItem value="low-carb">Low Carb</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  Our AI will generate a complete recipe based on the dish name you provide. You can
                  specify cuisine type and dietary restrictions for more tailored results.
                </p>
                
                <Button 
                  type="button" 
                  className="bg-primary hover:bg-primary/90 text-white w-full py-2 sm:py-4 h-auto"
                  disabled={!recipeInput.trim() || recipeByDishMutation.isPending}
                  onClick={handleDishNameSearch}
                >
                  {recipeByDishMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Generating Recipe...</span>
                      <span className="sm:hidden">Generating...</span>
                    </>
                  ) : (
                    <>
                      <ChefHat className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Generate Recipe</span>
                      <span className="sm:hidden">Generate</span>
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Conversion Results - Responsive for all screens */}
      {convertedResult && (
        <Card className="mb-8">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-0">
              <h2 className="font-heading text-xl sm:text-2xl font-bold">
                {activeTab === "text-input" 
                  ? (convertedResult && convertedResult.includes("# Converted Recipe")) 
                    ? "Converted Recipe" 
                    : "Generated Recipe from Ingredients"
                  : activeTab === "photo-input"
                    ? "Extracted Recipe"
                    : "Generated Recipe by Dish Name"}
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary flex items-center self-end sm:self-auto"
                onClick={handleCopyResult}
              >
                {isCopied ? (
                  <>
                    <CheckCircle2 className="mr-1 h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-4 w-4" /> Copy
                  </>
                )}
              </Button>
            </div>
            
            <div className="border border-neutral-200 rounded-lg p-3 sm:p-4 bg-neutral-50">
              <div 
                className="prose prose-sm sm:prose max-w-none text-xs sm:text-sm md:text-base"
                dangerouslySetInnerHTML={{ __html: convertedResult.replace(/\n/g, '<br>') }} 
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Ingredient Database Preview - Responsive */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <h2 className="font-heading text-lg sm:text-xl font-bold mb-2 sm:mb-4">Ingredient Database Preview</h2>
          <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-700">
            Our database contains precise weight measurements for hundreds of ingredients.
          </p>
          
          <IngredientTable />
        </CardContent>
      </Card>
    </div>
  );
}
