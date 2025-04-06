import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Google Generative AI client
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('GEMINI_API_KEY environment variable is not set');
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Define safety settings to allow processing of recipe content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

// Get the Gemini Pro Vision model (for image processing)
const visionModel = genAI.getGenerativeModel({
  model: "gemini-pro-vision",
  safetySettings,
});

// Get the Gemini Pro model (for text processing)
const textModel = genAI.getGenerativeModel({
  model: "gemini-1.5-pro-latest",
  safetySettings,
});

export interface PhotoToRecipeResult {
  recipeText: string;
  ingredients: string[];
  instructions: string[];
  success: boolean;
  error?: string;
}

/**
 * Extracts recipe from an image using Gemini AI
 * @param base64Image - Base64 encoded image data
 * @returns Recipe information extracted from the image
 */
export async function extractRecipeFromImage(base64Image: string): Promise<PhotoToRecipeResult> {
  try {
    // Prepare the image data
    const imageData = {
      inlineData: {
        data: base64Image.includes('base64,') ? base64Image.split('base64,')[1] : base64Image,
        mimeType: base64Image.includes('image/png') ? 'image/png' : 'image/jpeg',
      },
    };

    // Create a prompt for the model
    const prompt = "You are a professional chef at PreciseBaker. " +
      "Either extract a recipe from the image OR if the image shows a prepared dish (like a food photo), " +
      "identify what dish it is and create a complete recipe for it. " + 
      "Format your response as follows:\n" +
      "Title: [Recipe Title]\n" +
      "Ingredients:\n" +
      "- [Ingredient 1 with precise measurements]\n" +
      "- [Ingredient 2 with precise measurements]\n" +
      "...\n" +
      "Instructions:\n" +
      "1. [Step 1]\n" +
      "2. [Step 2]\n" +
      "...\n" +
      "If there are any measurements, make sure they are specific and accurate. " +
      "For dish photos where no recipe is visible, create a detailed authentic recipe " +
      "based on what you can identify in the image.";

    // Generate content with the vision model
    const result = await visionModel.generateContent([prompt, imageData]);
    const response = await result.response;
    const text = response.text();

    // Parse the response to extract structured recipe information
    const titleMatch = text.match(/Title: (.*)/);
    const title = titleMatch ? titleMatch[1] : "Extracted Recipe";

    // Extract ingredients
    const ingredientsSection = text.match(/Ingredients:([\s\S]*?)(?=Instructions:)/);
    const ingredientsText = ingredientsSection ? ingredientsSection[1] : "";
    const ingredients = ingredientsText
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.startsWith('-'))
      .map((line: string) => line.substring(1).trim());

    // Extract instructions
    const instructionsSection = text.match(/Instructions:([\s\S]*?)$/);
    const instructionsText = instructionsSection ? instructionsSection[1] : "";
    const instructions = instructionsText
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => /^\d+\./.test(line))
      .map((line: string) => line.replace(/^\d+\.\s*/, ''));

    // Format the complete recipe text
    const recipeText = `# ${title}\n\n## Ingredients\n${ingredients.map((ing: string) => `- ${ing}`).join('\n')}\n\n## Instructions\n${instructions.map((inst: string, idx: number) => `${idx + 1}. ${inst}`).join('\n')}`;

    return {
      recipeText,
      ingredients,
      instructions,
      success: true,
    };
  } catch (error) {
    console.error('Error extracting recipe from image with Gemini:', error);
    return {
      recipeText: '',
      ingredients: [],
      instructions: [],
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

/**
 * Converts recipe text based on specified parameters
 * @param recipeText - The original recipe text
 * @param conversionType - Type of conversion (e.g., 'cup-to-gram')
 * @param scaleFactor - Factor to scale the recipe by
 * @param humidityAdjust - Whether to adjust for humidity
 * @param proMode - Whether to include professional baking notes
 * @returns Converted recipe text
 */
export async function convertRecipeText(
  recipeText: string,
  conversionType: string,
  scaleFactor: string,
  humidityAdjust: boolean,
  proMode: boolean
): Promise<string> {
  try {
    // Already using the textModel instance

    // Create a prompt for the model
    let prompt = `You are a professional baker and recipe converter. Please convert the following recipe according to these specifications:
    
    1. Conversion type: ${conversionType} (${conversionType === 'cup-to-gram' ? 'convert volume measurements to weight in grams' : 'convert weight in grams to volume measurements'})
    2. Scale factor: ${scaleFactor} (multiply all ingredient quantities by this number)
    ${humidityAdjust ? '3. Adjust for high humidity conditions.' : ''}
    ${proMode ? '4. Include professional baking notes and tips.' : ''}
    
    Recipe to convert:
    ${recipeText}
    
    Format your response as a complete recipe with a title, ingredients list, and instructions. Use markdown formatting.`;

    // Generate content with the model
    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error converting recipe with Gemini:', error);
    throw new Error('Failed to convert recipe');
  }
}

/**
 * Generates a recipe based on a dish name
 * @param dishName - The name of the dish to generate a recipe for
 * @param cuisine - Optional cuisine type
 * @param dietary - Optional dietary restrictions
 * @returns Complete recipe text
 */
/**
 * Generates a recipe based on a list of ingredients
 * @param ingredients - List of ingredients to use in the recipe
 * @param conversionType - Type of measurement preferred
 * @param humidityAdjust - Whether to adjust for humidity
 * @param proMode - Whether to include professional baking notes
 * @returns Complete recipe text
 */
export async function generateRecipeFromIngredients(
  ingredients: string,
  conversionType: string,
  humidityAdjust: boolean,
  proMode: boolean
): Promise<string> {
  try {
    // Create a prompt for the model
    let prompt = `You are a professional chef at PreciseBaker. Please generate a detailed recipe using these ingredients:
    
    ${ingredients}
    
    Please use ${conversionType === 'cup-to-gram' ? 'weight measurements (grams)' : 'volume measurements (cups, tablespoons)'} when listing ingredients.
    ${humidityAdjust ? 'Adjust the recipe for high humidity conditions.' : ''}
    ${proMode ? 'Include professional baking notes and tips.' : ''}
    
    Your recipe should include:
    1. A creative descriptive title
    2. A brief introduction to the dish
    3. Complete ingredient list with precise measurements
    4. Clear, step-by-step instructions
    5. Cooking time and servings
    6. Optional tips for perfect results
    
    Format your response as a complete recipe with markdown formatting. Make sure all measurements are precise and accurate.`;

    // Generate content with the model
    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating recipe with Gemini:', error);
    throw new Error('Failed to generate recipe from ingredients');
  }
}

export async function getRecipeByDishName(
  dishName: string,
  cuisine?: string,
  dietary?: string
): Promise<string> {
  try {
    // Already using the textModel instance

    // Create a prompt for the model
    let prompt = `You are a professional chef at PreciseBaker. Please generate a detailed recipe for "${dishName}"`;
    
    if (cuisine) {
      prompt += ` in the ${cuisine} style`;
    }
    
    if (dietary) {
      prompt += ` that is ${dietary}`;
    }
    
    prompt += `.

    Your recipe should include:
    1. A descriptive title
    2. A brief introduction to the dish
    3. Precise ingredient measurements in both volume (cups, tablespoons) and weight (grams)
    4. Clear, step-by-step instructions
    5. Cooking time and servings
    6. Optional tips for perfect results
    
    Format your response as a complete recipe with markdown formatting. Make sure all measurements are precise and accurate.`;

    // Generate content with the model
    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating recipe with Gemini:', error);
    throw new Error('Failed to generate recipe');
  }
}