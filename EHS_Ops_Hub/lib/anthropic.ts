import Anthropic from "@anthropic-ai/sdk";

const getClient = (() => {
  let instance: Anthropic | null = null;
  return () => {
    if (!instance) {
      instance = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    return instance;
  };
})();

export default getClient;

export const MODEL = "claude-sonnet-4-20250514";
