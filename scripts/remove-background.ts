import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

async function removeBackground() {
  const imagePath = path.join(process.cwd(), "attached_assets", "Gemini_Generated_Image_yew2n6yew2n6yew2_1769183883909.png");
  const outputPath = path.join(process.cwd(), "attached_assets", "vending-machine-no-bg.png");

  console.log("Reading image from:", imagePath);
  
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString("base64");

  console.log("Sending to Gemini for background removal...");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image,
            },
          },
          {
            text: "Remove the background from this image completely, making it transparent. Keep only the vending machines. Output a PNG image with transparent background.",
          },
        ],
      },
    ],
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const candidate = response.candidates?.[0];
  const imagePart = candidate?.content?.parts?.find(
    (part: any) => part.inlineData
  );

  if (!imagePart?.inlineData?.data) {
    console.error("No image data in response");
    process.exit(1);
  }

  console.log("Saving processed image to:", outputPath);
  
  const outputBuffer = Buffer.from(imagePart.inlineData.data, "base64");
  fs.writeFileSync(outputPath, outputBuffer);

  console.log("Done! Background removed successfully.");
}

removeBackground().catch(console.error);
