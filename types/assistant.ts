import type { AssistantMessage, WeatherAssistantContext } from "@/lib/ai";

export type { AssistantMessage, WeatherAssistantContext } from "@/lib/ai";

export type AssistantChatRequest = {
  messages: AssistantMessage[];
  context: WeatherAssistantContext;
};

export type AssistantChatResponse = {
  message: string;
};
