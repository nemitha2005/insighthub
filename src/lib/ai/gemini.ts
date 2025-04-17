import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function analyzeData(
  prompt: string,
  dataContext: string,
  schema?: any
) {
  try {
    const fullPrompt = `
      You are an AI business intelligence assistant analyzing data for InsightHub. 
      
      User Question: ${prompt}
      
      Data Schema: ${JSON.stringify(schema || {})}
      
      Data Sample: ${dataContext.substring(0, 5000)}
      
      Based on this information, please provide:
      1. A concise summary of the analysis (2-3 sentences)
      2. 3-5 key insights from the data
      3. A suggestion for the most appropriate visualization type
      
      Format your response as a JSON object with the following structure:
      {
        "summary": "Your summary here",
        "insights": ["Insight 1", "Insight 2", "Insight 3"],
        "visualizationSuggestion": "bar chart"
      }
    `;

    const result = await geminiModel.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      summary:
        "Analysis completed but structured response could not be generated.",
      insights: [
        "The data was processed but no structured insights could be extracted.",
      ],
      visualizationSuggestion: "table",
    };
  } catch (error) {
    console.error("Error analyzing data with Gemini:", error);
    throw error;
  }
}
