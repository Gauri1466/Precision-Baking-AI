import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import IngredientTable from "./IngredientTable";
import { Loader2, Copy, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RecipeConverter() {
  const { toast } = useToast();
  const [recipeInput, setRecipeInput] = useState("");
  const [conversionType, setConversionType] = useState("cup-to-gram");
  const [scaleFactor, setScaleFactor] = useState("1");
  const [humidityAdjust, setHumidityAdjust] = useState(false);
  const [proMode, setProMode] = useState(false);
  const [convertedResult, setConvertedResult] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
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

  return (
    <div>
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="font-heading text-2xl font-bold mb-4">Recipe Converter</h2>
          <p className="mb-6 text-gray-700">
            Convert vague measurements like "1 cup of flour" into exact weights like "120 grams" for perfect results every time.
          </p>
          
          {/* Converter Form */}
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
                  onValueChange={setScaleFactor}
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
