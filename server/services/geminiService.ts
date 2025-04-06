import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Google Generative AI client
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey!);

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

// Get the Gemini Pro Vision model
const model = genAI.getGenerativeModel({
  model: "gemini-pro-vision",
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
        data: base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''),
        mimeType: base64Image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
      },
    };

    // Create a prompt for the model
    const prompt = "You are a recipe assistant. Please extract the complete recipe from this image. " + 
      "Format your response as follows:\n" +
      "Title: [Recipe Title]\n" +
      "Ingredients:\n" +
      "- [Ingredient 1]\n" +
      "- [Ingredient 2]\n" +
      "...\n" +
      "Instructions:\n" +
      "1. [Step 1]\n" +
      "2. [Step 2]\n" +
      "...\n" +
      "If there are any measurements, make sure they are specific and accurate.";

    // Generate content with the model
    const result = await model.generateContent([prompt, imageData]);
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
      .map(line => line.trim())
      .filter(line => line.startsWith('-'))
      .map(line => line.substring(1).trim());

    // Extract instructions
    const instructionsSection = text.match(/Instructions:([\s\S]*?)$/);
    const instructionsText = instructionsSection ? instructionsSection[1] : "";
    const instructions = instructionsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => /^\d+\./.test(line))
      .map(line => line.replace(/^\d+\.\s*/, ''));

    // Format the complete recipe text
    const recipeText = `# ${title}\n\n## Ingredients\n${ingredients.map(ing => `- ${ing}`).join('\n')}\n\n## Instructions\n${instructions.map((inst, idx) => `${idx + 1}. ${inst}`).join('\n')}`;

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
    // Use gemini-pro model for text processing
    const textModel = genAI.getGenerativeModel({
      model: "gemini-pro",
      safetySettings,
    });

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