import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Comprehensive knowledge base for farming and agriculture
const knowledgeBase: { [key: string]: string[] } = {
  crop: [
    "For better crop yields, ensure proper spacing between plants (typically 30-60cm depending on crop type) and rotate crops annually to maintain soil health and prevent pest buildup.",
    "Choose crops suitable for your region's climate and soil type. Warm-season crops like tomatoes and peppers need 18-24°C, while cool-season crops like lettuce prefer 10-18°C.",
    "Regular monitoring and timely harvesting can significantly improve crop quality and yield. Most vegetables should be harvested in the morning when they're crisp and full of moisture.",
    "Crop rotation helps prevent soil depletion. Follow a 3-4 year rotation cycle: legumes (fix nitrogen) → leafy vegetables → root vegetables → grains.",
    "Intercropping (growing two or more crops together) can maximize space and improve yields. Good combinations include corn with beans, or tomatoes with basil.",
  ],
  soil: [
    "Test your soil pH regularly. Most crops prefer a pH between 6.0 and 7.0. Add lime to raise pH or sulfur to lower it. You can test pH with a simple home kit.",
    "Use compost and organic fertilizers to enrich soil nutrients naturally. A good compost pile needs 30:1 carbon to nitrogen ratio. Avoid over-fertilization which can burn plants.",
    "Maintain proper soil moisture levels. Well-drained soil prevents root rot and promotes healthy growth. Add organic matter like compost to improve both drainage and water retention.",
    "Soil structure is crucial. Sandy soil drains quickly but needs more water. Clay soil retains water but may need drainage improvement. Loamy soil (mix of sand, silt, clay) is ideal.",
    "Cover crops like clover or rye can improve soil health by preventing erosion, adding organic matter, and fixing nitrogen in the soil.",
  ],
  water: [
    "Water your crops early in the morning (6-10 AM) to reduce evaporation and prevent fungal diseases. Avoid evening watering as leaves stay wet overnight.",
    "Deep watering encourages strong root systems. Water less frequently but more deeply (15-20cm) rather than frequent shallow watering.",
    "Implement drip irrigation for efficient water usage (saves 30-50% compared to sprinklers). Monitor soil moisture with a moisture meter or finger test.",
    "During dry seasons, mulch around plants (5-10cm layer) to retain soil moisture and reduce water needs by up to 50%. Use organic mulch like straw, leaves, or wood chips.",
    "Signs of overwatering: yellow leaves, wilting despite wet soil, root rot. Signs of underwatering: dry, brittle leaves, slow growth, soil pulling away from container edges.",
  ],
  pest: [
    "Use integrated pest management (IPM) techniques. Encourage beneficial insects (ladybugs, lacewings) and use organic pesticides like neem oil or insecticidal soap when necessary.",
    "Regular inspection helps detect pests early. Check under leaves and at plant bases weekly. Remove affected plants or plant parts immediately to prevent spread.",
    "Companion planting can naturally deter pests. Marigolds repel nematodes and many insects. Basil repels mosquitoes and flies. Onions and garlic deter aphids.",
    "Physical barriers like row covers can protect crops from insects. Crop rotation prevents pest buildup. Remove plant debris after harvest to eliminate overwintering sites.",
    "For common pests: Aphids - spray with soapy water. Slugs - use beer traps or diatomaceous earth. Caterpillars - handpick or use Bt (Bacillus thuringiensis).",
  ],
  weather: [
    "Monitor weather forecasts regularly. Protect crops from extreme weather with covers, greenhouses, or temporary shelters. Frost cloth can protect plants down to -2°C.",
    "Adjust planting schedules based on seasonal patterns. Some crops thrive in specific weather conditions. Cool-season crops (broccoli, lettuce) grow best in spring/fall.",
    "During hot weather (above 30°C), provide shade for sensitive crops using shade cloth (30-50% shade). Mulch heavily and water more frequently.",
    "During cold snaps, use row covers, cloches, or bring potted plants indoors. Hardening off (gradual exposure) helps plants adapt to temperature changes.",
    "Wind can damage plants and increase water loss. Use windbreaks (fences, hedges) or plant wind-resistant varieties. Stake tall plants to prevent breakage.",
  ],
  fertilizer: [
    "Organic fertilizers release nutrients slowly and improve soil structure. Compost, manure, and bone meal are excellent choices. Apply 2-4 weeks before planting.",
    "NPK ratio matters: Nitrogen (N) for leaf growth, Phosphorus (P) for roots and flowers, Potassium (K) for overall health. Most vegetables need balanced 10-10-10 or 5-5-5.",
    "Side-dress crops with fertilizer 3-4 weeks after planting. Apply around the base, not touching stems. Water after fertilizing to help nutrients reach roots.",
    "Too much fertilizer can burn plants. Follow package instructions. Signs of over-fertilization: brown leaf edges, stunted growth, salt buildup on soil surface.",
    "Compost tea is a liquid fertilizer made by steeping compost in water. It provides beneficial microbes and nutrients. Use weekly during growing season.",
  ],
  harvest: [
    "Harvest timing is crucial. Most vegetables taste best when harvested at peak ripeness. Check seed packets or plant tags for 'days to maturity' estimates.",
    "Harvest in the morning when plants are crisp and temperatures are cool. Use sharp, clean tools to avoid damaging plants and spreading disease.",
    "For continuous harvest (lettuce, herbs), pick outer leaves first, allowing center to continue growing. This extends harvest period by weeks or months.",
    "Store harvested produce properly. Most vegetables keep best at 0-4°C with high humidity. Root vegetables can be stored in cool, dark places for months.",
    "Preserve excess harvest through canning, freezing, or drying. Blanch vegetables before freezing to preserve color, texture, and nutrients.",
  ],
  general: [
    "Start with a small garden and expand as you gain experience. A 3x3 meter plot can feed a family of 4 with proper planning and succession planting.",
    "Keep a garden journal to track planting dates, weather, pests, and yields. This helps you learn what works best in your specific location and conditions.",
    "Succession planting (planting new crops every 2-3 weeks) ensures continuous harvest throughout the season. This works well for lettuce, radishes, and beans.",
    "Companion planting benefits: Tomatoes with basil (improves flavor), Carrots with onions (deters carrot fly), Corn with beans (beans fix nitrogen for corn).",
    "Season extension techniques: Use cold frames or hoop houses to start earlier in spring and harvest later in fall. This can extend growing season by 4-6 weeks.",
  ],
};

const getKnowledgeBaseResponse = (message: string): string | null => {
  const lowerMessage = message.toLowerCase();
  
  // Check for keywords and return relevant knowledge
  for (const [category, responses] of Object.entries(knowledgeBase)) {
    const keywords = category === "general" 
      ? ["farming", "agriculture", "garden", "growing", "plant", "help", "advice", "how", "what", "when", "where", "why"]
      : [category];
    
    if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
      // Return a random response from the category
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
  
  // Check for specific farming terms
  const farmingTerms: { [term: string]: string } = {
    "ph": knowledgeBase.soil[0],
    "compost": knowledgeBase.soil[1],
    "irrigation": knowledgeBase.water[2],
    "mulch": knowledgeBase.water[3],
    "pesticide": knowledgeBase.pest[0],
    "aphid": knowledgeBase.pest[4],
    "fertilizer": knowledgeBase.fertilizer[0],
    "harvest": knowledgeBase.harvest[0],
    "planting": knowledgeBase.general[2],
    "companion": knowledgeBase.general[3],
  };
  
  for (const [term, response] of Object.entries(farmingTerms)) {
    if (lowerMessage.includes(term)) {
      return response;
    }
  }
  
  return null;
};

// Retry function with exponential backoff
const retryWithBackoff = async (
  fn: () => Promise<Response>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<Response> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fn();
      
      // If rate limited, wait and retry
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const delay = retryAfter 
          ? parseInt(retryAfter) * 1000 
          : baseDelay * Math.pow(2, attempt);
        
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      return response;
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
};

const getAIResponse = async (userMessage: string, conversationHistory: Message[]): Promise<string> => {
  // First, try knowledge base for farming-related questions
  const knowledgeResponse = getKnowledgeBaseResponse(userMessage);

  // Always try knowledge base first for domain-specific answers
  if (knowledgeResponse) {
    // If we have a knowledge base answer, use it (or enhance with Gemini if available)
  }

  if (!GEMINI_API_KEY) {
    // If no API key, use knowledge base exclusively
    return knowledgeResponse || "I specialize in farming and agriculture. Ask me about specific topics like crop rotation, soil pH testing, irrigation systems, pest management, fertilizer application, or harvest timing for detailed guidance.";
  }

  try {
    // Build conversation context for Gemini - highly specialized for farming
    let conversationContext = "You are an expert agricultural consultant specializing in Indian farming practices, crop management, soil health, irrigation techniques, pest and disease control, organic farming, and sustainable agriculture. You provide practical, actionable advice based on scientific farming principles. Focus on: crop-specific guidance (rice, wheat, vegetables, fruits), soil testing and amendments, water management, integrated pest management (IPM), fertilizer recommendations, seasonal planting schedules, and post-harvest handling. Always be specific, practical, and relevant to farming operations.\n\n";
    
    // Add recent conversation history (last 4 messages to keep context manageable)
    const recentMessages = conversationHistory.slice(-4);
    recentMessages.forEach((msg) => {
      conversationContext += `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}\n`;
    });

    // Add current user message
    conversationContext += `User: ${userMessage}\nAssistant:`;

    // Use retry logic for rate limits
    const response = await retryWithBackoff(() =>
      fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: conversationContext
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
          },
        }),
      })
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401 || response.status === 403) {
        // Fallback to knowledge base
        return knowledgeResponse || "I specialize in farming and agriculture. Ask me about specific topics like crop rotation, soil pH testing, irrigation systems, pest management, fertilizer application, or harvest timing for detailed guidance.";
      }
      
      if (response.status === 429) {
        // Use knowledge base as fallback for rate limits
        return knowledgeResponse || "Rate limit exceeded. Here's what I know: " + (knowledgeResponse || "Please wait a moment and try again, or ask about farming topics like crops, soil, water, or pests.");
      }
      
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the assistant's message from Gemini response
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 
                      knowledgeResponse ||
                      "I'm having trouble processing that. Could you rephrase your question?";

    return aiResponse;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Always fallback to knowledge base
    if (knowledgeResponse) {
      return knowledgeResponse;
    }
    
    // Fallback response
    if (error.message?.includes("API key")) {
      return knowledgeResponse || "I'm here to help with farming and agriculture! Ask me about crop cultivation, soil management, irrigation techniques, pest control, fertilizer application, or harvesting methods for expert guidance.";
    }
    
    if (error.message?.includes("rate limit") || error.message?.includes("429")) {
      return "Rate limit exceeded. Here's helpful information: " + (knowledgeResponse || "Please wait a moment and try again. Ask me about farming topics like crop rotation, soil pH, irrigation, pest control, or weather protection!");
    }
    
    return knowledgeResponse || "I'm having trouble connecting to the AI service, but I can still help! Ask me about farming topics like crops, soil management, water irrigation, pest control, weather, fertilizers, or harvesting techniques.";
  }
};

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your farming and agriculture assistant. I can help you with crop cultivation, soil management, irrigation, pest control, fertilizers, harvesting techniques, and sustainable farming practices. What would you like to know?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    const userInput = input.trim();
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const aiResponse = await getAIResponse(userInput, messages);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Error getting AI response:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <h3 className="font-semibold">AI Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "bot" && (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {message.sender === "user" && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="max-w-[75%] rounded-lg px-4 py-2 bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleSend} size="icon" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};
