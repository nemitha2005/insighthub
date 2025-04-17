import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { logger } from "@/lib/logger";

const apiKey = process.env.GOOGLE_AI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;
let geminiModel: GenerativeModel | null = null;

try {
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY environment variable is not set");
  }

  genAI = new GoogleGenerativeAI(apiKey);
  geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });

  logger.info("Gemini AI client initialized successfully");
} catch (error) {
  logger.error("Failed to initialize Gemini AI client", error);
}

export async function analyzeData(
  prompt: string,
  dataContext: string,
  schema?: any
) {
  try {
    if (!geminiModel) {
      throw new Error("Gemini model not initialized");
    }

    logger.info("Starting data analysis with Gemini", {
      promptLength: prompt.length,
      dataContextLength: dataContext.length,
      hasSchema: !!schema,
    });

    const fullPrompt = `
      You are an AI business intelligence assistant analyzing data for InsightHub. 
      Your task is to analyze business data and provide valuable insights.
      
      User Question: ${prompt}
      
      Data Schema Information:
      ${JSON.stringify(schema || {}, null, 2)}
      
      Data Sample (first rows):
      ${dataContext.substring(0, 8000)}
      
      Based on this information, please provide:
      1. A concise summary of the analysis (2-3 sentences)
      2. 3-5 key insights from the data (be specific and include numbers where relevant)
      3. A suggestion for the most appropriate visualization type for this data and question
      
      Format your response as a JSON object with the following structure:
      {
        "summary": "Your summary here",
        "insights": ["Insight 1", "Insight 2", "Insight 3"],
        "visualizationSuggestion": "bar chart"
      }
      
      Ensure your response is strictly in valid JSON format with no additional text before or after.
    `;

    const result = await geminiModel.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    logger.info("Received response from Gemini", {
      responseLength: text.length,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        return parsedResponse;
      } catch (parseError) {
        logger.error("Failed to parse Gemini response as JSON", {
          error: parseError,
          responseText: text.substring(0, 500) + "...",
        });

        return {
          summary:
            "Analysis was completed, but there was an issue formatting the results.",
          insights: [
            "The data was analyzed successfully.",
            "A structured response could not be generated.",
            "Try rephrasing your question for better results.",
          ],
          visualizationSuggestion: "table",
        };
      }
    }

    logger.warn("Could not extract JSON from Gemini response", {
      responseText: text.substring(0, 500) + "...",
    });

    return {
      summary:
        "Analysis completed but structured response could not be generated.",
      insights: [
        "The data was processed but no structured insights could be extracted.",
      ],
      visualizationSuggestion: "table",
    };
  } catch (error) {
    logger.error("Error analyzing data with Gemini", error);
    throw error;
  }
}
