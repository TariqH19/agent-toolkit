import { LLM } from "@langchain/core/language_models/llms";
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";

export class OllamaLLM extends LLM {
  modelName: string;
  baseUrl: string;

  constructor(options: { modelName: string; baseUrl: string }) {
    super({});
    this.modelName = options.modelName;
    this.baseUrl = options.baseUrl;
  }

  async _call(
    prompt: string,
    options?: any,
    runManager?: CallbackManagerForLLMRun
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.modelName,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            num_predict: 500,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = (await response.json()) as { response: string };
      return data.response;
    } catch (error: any) {
      console.error("Ollama API error:", error);
      throw new Error(`Failed to connect to Ollama: ${error.message}`);
    }
  }

  _llmType(): string {
    return "ollama";
  }
}
