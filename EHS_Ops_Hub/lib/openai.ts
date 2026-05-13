import OpenAI from "openai";

const getClient = (() => {
  let instance: OpenAI | null = null;
  return () => {
    if (!instance) instance = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return instance;
  };
})();

export default getClient;
export const MODEL = "gpt-4o";
