import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { ChatMessage } from "../types";
import { MOCK_NEWS } from "../constants";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// 1. Prepare the "Index" (Lightweight Context)
const newsIndex = MOCK_NEWS.map(article => ({
  id: article.id,
  title: article.title,
  district: article.district,
  category: article.category,
  tags: article.tags
}));

const SYSTEM_INSTRUCTION = `You are OdishaGPT, a dedicated local news assistant for Odisha, India.

### KNOWLEDGE BASE (LIVE INDEX)
You have access to the following latest news headlines. 
DO NOT hallucinate news. Only use the articles listed below.
${JSON.stringify(newsIndex)}

### INSTRUCTIONS
1. **Analyze the Query**: Determine if the user is asking about specific news, a district, or a topic present in the index.
2. **Tool Use**: If you find relevant headlines in the index, YOU MUST use the 'fetch_article_details' tool to get the full story. Pass the corresponding IDs.
3. **Answering**: Once you receive the article details, summarize them for the user.
4. **General Chat**: If the user says "Hi" or asks general questions not related to news, answer politely without using tools.
5. **Fallbacks**: If no news matches the query, strictly say "I couldn't find any recent reports on that in our local database."

Structure your responses using Markdown. Be professional, concise, and focused on Odisha.`;

// 2. Define the Tool Definition
const fetchArticleDetailsTool: FunctionDeclaration = {
  name: 'fetch_article_details',
  description: 'Fetches the full content/summary of specific news articles by their unique IDs. Use this when the user asks about a topic found in the headline index.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      articleIds: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'List of Article IDs to fetch details for.'
      }
    },
    required: ['articleIds']
  }
};

export async function* streamGeminiResponse(
  history: ChatMessage[],
  newMessage: string
): AsyncGenerator<{ text: string; sources?: { uri: string; title: string }[] }> {
  
  if (!process.env.API_KEY) {
    yield { text: "Error: API_KEY is missing from environment variables." };
    return;
  }

  try {
    const chatHistory = history.slice(-10).map((msg) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text || " " }],
    }));

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      messages: chatHistory,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: [fetchArticleDetailsTool] }], 
      },
    });

    // Initial Request
    let currentStream = await chat.sendMessageStream({ message: newMessage });

    // Loop to handle recursive tool turns
    while (true) {
      let functionCalls: any[] = [];
      
      // Consume the stream fully to finalize the turn
      for await (const chunk of currentStream) {
        if (chunk.text) {
          yield { text: chunk.text };
        }
        if (chunk.functionCalls) {
          functionCalls.push(...chunk.functionCalls);
        }
      }

      // If no function calls were made, the turn is complete
      if (functionCalls.length === 0) {
        break;
      }

      // Handle function calls
      yield { text: "\n\n*Checking local records...*\n\n" };

      const functionResponses = functionCalls.map(call => {
        if (call.name === 'fetch_article_details') {
           const args = call.args as { articleIds: string[] };
           const requestedIds = args.articleIds || [];
           
           const fullArticles = MOCK_NEWS.filter(a => requestedIds.includes(a.id));
           
           return {
              functionResponse: {
                name: call.name,
                id: call.id,
                response: {
                    articles: fullArticles.map(a => ({
                        title: a.title,
                        summary: a.summary,
                        author: a.author,
                        timestamp: a.timestamp
                    }))
                }
              }
           };
        }
        return {
            functionResponse: {
                name: call.name,
                id: call.id,
                response: { error: "Tool not found" }
            }
        };
      });

      // Send the function responses back to the model
      // This creates a new stream for the model's answer to the tool output
      currentStream = await chat.sendMessageStream({
        message: functionResponses
      });
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    yield { text: `Sorry, I encountered an error. (${error.message || 'Unknown error'})` };
  }
}