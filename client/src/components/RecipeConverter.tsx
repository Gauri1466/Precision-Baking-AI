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
    
    convertMutation.mutate({
      recipeText: recipeInput,
      conversionType,
      scaleFactor,
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
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="font-heading text-2xl font-bold mb-4">Recipe Converter</h2>
          <p className="mb-6 text-gray-700">
            Convert vague measurements like "1 cup of flour" into exact weights like "120 grams" for perfect results every time.
          </p>
          
          {/* Input Method Tabs */}
          <Tabs defaultValue="text-input" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text-input" className="flex items-center justify-center">
                <span className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Text Recipe
                </span>
              </TabsTrigger>
              <TabsTrigger value="photo-input" className="flex items-center justify-center">
                <span className="flex items-center">
                  <Camera className="h-4 w-4 mr-2" />
                  Photo to Recipe
                </span>
              </TabsTrigger>
              <TabsTrigger value="dish-input" className="flex items-center justify-center">
                <span className="flex items-center">
                  <ChefHat className="h-4 w-4 mr-2" />
                  Dish Name
                </span>
              </TabsTrigger>
            </TabsList>
            
            {/* Text Input Tab */}
            <TabsContent value="text-input">
              <form onSubmit={handleConversion}>
                <div className="mb-6">
                  <Label htmlFor="recipe-input" className="block text-sm font-medium mb-2">
                    Paste Your Recipe
                  </Label>
                  <Textarea
                    id="recipe-input"
                    className="min-h-[150px] resize-y"
                    placeholder="Paste your recipe here or type ingredients with measurements..."
                    value={recipeInput}
                    onChange={(e) => setRecipeInput(e.target.value)}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="conversion-type" className="block text-sm font-medium mb-2">
                      Conversion Type
                    </Label>
                    <Select 
                      value={conversionType} 
                      onValueChange={setConversionType}
                    >
                      <SelectTrigger id="conversion-type">
                        <SelectValue placeholder="Select conversion type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cup-to-gram">Cups to Grams</SelectItem>
                        <SelectItem value="gram-to-cup">Grams to Cups</SelectItem>
                        <SelectItem value="oz-to-gram">Ounces to Grams</SelectItem>
                        <SelectItem value="tbsp-to-gram">Tablespoons to Grams</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="scale-factor" className="block text-sm font-medium mb-2">
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
                      <SelectTrigger id="scale-factor">
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
                
                {/* Custom scale factor input */}
                {showCustomScale && (
                  <div className="mb-4">
                    <Label htmlFor="custom-scale-factor" className="block text-sm font-medium mb-2">
                      Enter Custom Scale Factor
                    </Label>
                    <div className="flex gap-4">
                      <Input
                        id="custom-scale-factor"
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="1.5"
                        value={customScaleFactor}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setCustomScaleFactor(e.target.value);
                          setScaleFactor(e.target.value);
                        }}
                        className="w-32"
                      />
                      <Button 
                        type="button"
                        variant="outline"
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
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a value like 1.25 (for 1.25x) or 0.75 (for 3/4 sized recipe)
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="humidity-adjust" 
                      checked={humidityAdjust}
                      onCheckedChange={(checked) => setHumidityAdjust(checked as boolean)}
                    />
                    <Label htmlFor="humidity-adjust" className="text-sm">
                      Adjust for Humidity
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="pro-mode" 
                      checked={proMode}
                      onCheckedChange={(checked) => setProMode(checked as boolean)}
                    />
                    <Label htmlFor="pro-mode" className="text-sm">
                      Professional Baker Mode
                    </Label>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-white"
                  disabled={convertMutation.isPending}
                >
                  {convertMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    "Convert Recipe"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            {/* Photo Input Tab */}
            <TabsContent value="photo-input">
              <div className="mb-6">
                <Label className="block text-sm font-medium mb-2">
                  Upload a Photo of a Recipe
                </Label>
                
                {/* Hidden file input */}
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                />
                
                {/* File Upload UI */}
                {!previewImage ? (
                  <div 
                    onClick={triggerFileInput}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Image className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-center text-sm text-gray-500">
                      Click to upload a photo of a recipe card, book page, or handwritten recipe
                    </p>
                    <p className="text-center text-xs text-gray-400 mt-2">
                      Supports JPG, JPEG, PNG formats
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={previewImage} 
                      alt="Recipe preview" 
                      className="w-full h-auto rounded-lg max-h-[300px] object-contain bg-gray-100" 
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={() => setPreviewImage(null)}
                    >
                      Replace
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Our AI will analyze the image and extract the recipe with ingredients and instructions.
                  After extraction, you can edit and convert the recipe as needed.
                </p>
                
                <Button 
                  type="button" 
                  className="bg-primary hover:bg-primary/90 text-white w-full"
                  disabled={!previewImage || photoToRecipeMutation.isPending}
                  onClick={handlePhotoExtraction}
                >
                  {photoToRecipeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extracting Recipe...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Extract Recipe from Photo
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            {/* Dish Name Input Tab */}
            <TabsContent value="dish-input">
              <div className="mb-6">
                <Label htmlFor="dish-name" className="block text-sm font-medium mb-2">
                  Enter a Dish Name
                </Label>
                <div className="space-y-4">
                  <Textarea
                    id="dish-name"
                    className="resize-y"
                    placeholder="Enter a dish name (e.g., Chocolate Chip Cookies, Beef Stroganoff)..."
                    value={recipeInput}
                    onChange={(e) => setRecipeInput(e.target.value)}
                  />
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cuisine-type" className="block text-sm font-medium mb-2">
                        Cuisine Type (Optional)
                      </Label>
                      <Select 
                        value={cuisineType} 
                        onValueChange={setCuisineType}
                      >
                        <SelectTrigger id="cuisine-type">
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
                      <Label htmlFor="dietary-restrictions" className="block text-sm font-medium mb-2">
                        Dietary Restrictions (Optional)
                      </Label>
                      <Select 
                        value={dietaryRestrictions} 
                        onValueChange={setDietaryRestrictions}
                      >
                        <SelectTrigger id="dietary-restrictions">
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
                <p className="text-sm text-gray-600 mb-4">
                  Our AI will generate a complete recipe based on the dish name you provide. You can
                  specify cuisine type and dietary restrictions for more tailored results.
                </p>
                
                <Button 
                  type="button" 
                  className="bg-primary hover:bg-primary/90 text-white w-full"
                  disabled={!recipeInput.trim() || recipeByDishMutation.isPending}
                  onClick={handleDishNameSearch}
                >
                  {recipeByDishMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Recipe...
                    </>
                  ) : (
                    <>
                      <ChefHat className="mr-2 h-4 w-4" />
                      Generate Recipe
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Conversion Results */}
      {convertedResult && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-heading text-2xl font-bold">Converted Recipe</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary flex items-center"
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
            
            <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: convertedResult.replace(/\n/g, '<br>') }} 
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Ingredient Database Preview */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="font-heading text-xl font-bold mb-4">Ingredient Database Preview</h2>
          <p className="mb-4 text-sm text-gray-700">
            Our database contains precise weight measurements for hundreds of ingredients.
          </p>
          
          <IngredientTable />
        </CardContent>
      </Card>
    </div>
  );
}
