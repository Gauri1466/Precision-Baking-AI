import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, CheckCircle2 } from "lucide-react";

export default function MeasurementConverter() {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState("");
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [convertedResult, setConvertedResult] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  const units = [
    { label: "Cup", value: "cup" },
    { label: "Tablespoon", value: "tbsp" },
    { label: "Teaspoon", value: "tsp" },
    { label: "Fluid Ounce", value: "fl-oz" },
    { label: "Milliliter", value: "ml" },
    { label: "Liter", value: "l" },
    { label: "Gram", value: "g" },
    { label: "Kilogram", value: "kg" },
    { label: "Ounce", value: "oz" },
    { label: "Pound", value: "lb" },
    { label: "Pinch", value: "pinch" },
    { label: "Dash", value: "dash" }
  ];
  
  const convertMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/convert-measurement", data);
      return response.json();
    },
    onSuccess: (data) => {
      setConvertedResult(data.result);
      toast({
        title: "Measurement Converted",
        description: "Your measurement has been successfully converted",
      });
    },
    onError: (error) => {
      toast({
        title: "Conversion Failed",
        description: error instanceof Error ? error.message : "Failed to convert measurement",
        variant: "destructive",
      });
    },
  });
  
  const handleConversion = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quantity || !fromUnit || !toUnit) {
      toast({
        title: "Input Required",
        description: "Please enter a quantity and select units for conversion",
        variant: "destructive",
      });
      return;
    }
    
    convertMutation.mutate({
      quantity,
      fromUnit,
      toUnit,
      ingredient
    });
  };
  
  const handleCopyResult = () => {
    if (convertedResult) {
      navigator.clipboard.writeText(convertedResult);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      
      toast({
        title: "Copied to clipboard",
        description: "The conversion result has been copied to your clipboard",
      });
    }
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleConversion} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="text"
                  placeholder="Enter a number (e.g., 2.5)"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ingredient">Ingredient (Optional)</Label>
                <Input
                  id="ingredient"
                  type="text"
                  placeholder="e.g., flour, sugar, butter"
                  value={ingredient}
                  onChange={(e) => setIngredient(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="from-unit">From Unit</Label>
                <Select value={fromUnit} onValueChange={setFromUnit}>
                  <SelectTrigger id="from-unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="to-unit">To Unit</Label>
                <Select value={toUnit} onValueChange={setToUnit}>
                  <SelectTrigger id="to-unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white"
              disabled={convertMutation.isPending}
            >
              {convertMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                "Convert Measurement"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Conversion Results */}
      {convertedResult && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-heading text-2xl font-bold">Conversion Result</h2>
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
              <div className="text-lg font-medium text-center">
                {convertedResult}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Common Conversion Reference */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="font-heading text-xl font-bold mb-4">Common Cooking Conversions</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">From</th>
                  <th className="border p-2 text-left">To</th>
                  <th className="border p-2 text-left">Conversion</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">1 tablespoon (tbsp)</td>
                  <td className="border p-2">3 teaspoons (tsp)</td>
                  <td className="border p-2">1 tbsp = 3 tsp</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border p-2">1 cup</td>
                  <td className="border p-2">16 tablespoons</td>
                  <td className="border p-2">1 cup = 16 tbsp</td>
                </tr>
                <tr>
                  <td className="border p-2">1 cup</td>
                  <td className="border p-2">240 milliliters (ml)</td>
                  <td className="border p-2">1 cup = 240 ml</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border p-2">1 ounce (oz)</td>
                  <td className="border p-2">28.35 grams (g)</td>
                  <td className="border p-2">1 oz = 28.35 g</td>
                </tr>
                <tr>
                  <td className="border p-2">1 pound (lb)</td>
                  <td className="border p-2">453.6 grams (g)</td>
                  <td className="border p-2">1 lb = 453.6 g</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border p-2">1 fluid ounce (fl oz)</td>
                  <td className="border p-2">29.57 milliliters (ml)</td>
                  <td className="border p-2">1 fl oz = 29.57 ml</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}