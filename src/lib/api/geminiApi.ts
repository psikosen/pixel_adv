/**
 * Gemini API service for generating pixel art images
 */

const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

/**
 * Generate pixel art image using Gemini API
 * @param prompt The text prompt for image generation
 * @param apiKey The Gemini API key
 * @param model The Gemini model to use
 * @returns Promise resolving to the generated image data URL
 */
export const generatePixelArtImage = async (prompt: string, apiKey: string, model: string = 'gemini-2.0-flash-exp'): Promise<string> => {
  try {
    if (!apiKey) {
      throw new Error("Gemini API key is required");
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseModalities: ["Text", "Image"]
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    // Extract the image from the response
    if (data.candidates && 
        data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts) {
        
      // Find the part containing the image
      const imagePart = data.candidates[0].content.parts.find(
        (part: any) => part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')
      );
      
      if (imagePart && imagePart.inlineData) {
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      } else {
        throw new Error("No image found in response");
      }
    } else {
      throw new Error("No image generated in response");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

/**
 * Generate batch of pixel art images using Gemini API
 * @param prompt The text prompt for image generation
 * @param count Number of images to generate
 * @param apiKey The Gemini API key
 * @returns Promise resolving to array of generated image data URLs
 */
export const generatePixelArtBatch = async (
  prompt: string,
  count: number = 8,
  apiKey: string,
  model: string = 'gemini-2.0-flash-exp'
): Promise<string[]> => {
  try {
    if (!apiKey) {
      throw new Error("Gemini API key is required");
    }
    
    // Use numOfImages parameter in the request
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${prompt} - Generate exactly ${count} frames for pixel art animation sequence.` }]
        }],
        generationConfig: {
          responseModalities: ["Text", "Image"],
          number_of_images: count  // Specify number of images to generate
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    // Extract all images from the response
    const images: string[] = [];
    
    if (data.candidates && 
        data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts) {
        
      // Find all parts containing images
      const imageParts = data.candidates[0].content.parts.filter(
        (part: any) => part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')
      );
      
      if (imageParts && imageParts.length > 0) {
        imageParts.forEach((part: any) => {
          images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
        });
        return images;
      } else {
        throw new Error("No images found in response");
      }
    } else {
      throw new Error("No images generated in response");
    }
  } catch (error) {
    console.error("Error generating images:", error);
    throw error;
  }
};

/**
 * Generate multiple pixel art frames using the Gemini API
 * @param basePrompt The base text prompt for image generation
 * @param count Number of frames to generate
 * @param apiKey The Gemini API key
 * @returns Promise resolving to an array of image data URLs
 */
export const generatePixelArtFrames = async (
  basePrompt: string,
  count: number = 8,
  apiKey: string,
  model: string = 'gemini-2.0-flash-exp'
): Promise<string[]> => {
  try {
    // Try to generate all frames at once using batch API
    try {
      // Add animation-specific context to the prompt
      const batchPrompt = `${basePrompt} - Create a sequence of ${count} frames for a pixel art animation. Each frame should be part of a coherent animation sequence. Make each frame 32x32 pixels with clear outlines and limited color palette.`;
      
      return await generatePixelArtBatch(batchPrompt, count, apiKey, model);
    } catch (batchError) {
      console.warn("Batch generation failed, falling back to sequential generation:", batchError);
      
      // Fall back to generating frames one by one if batch fails
      const frames: string[] = [];
      
      // Generate all frames with multiple API calls
      for (let i = 0; i < count; i++) {
        // Add frame-specific context to the prompt
        const framePrompt = `${basePrompt} - frame ${i+1} of ${count} in an animation sequence. Make it a pixel art style image.`;
        
        // Generate the image
        const imageUrl = await generatePixelArtImage(framePrompt, apiKey, model);
        frames.push(imageUrl);
      }
      
      return frames;
    }
  } catch (error) {
    console.error("Error generating frames:", error);
    throw error;
  }
};
