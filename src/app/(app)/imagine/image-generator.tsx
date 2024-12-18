"use client";

import { Button } from "@/components/ui/button";
import { ResizableTextarea } from "@/components/ui/resizable-textarea";
import { fal } from "@fal-ai/client";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";

const ELIZA_LORA =
  "https://v3.fal.media/files/zebra/e2AhhSdf1Qp6W_lRgyfzH_pytorch_lora_weights.safetensors";

// portrait model: "https://v3.fal.media/files/tiger/QVhnmgFfV8NBBM2_4Igh3_pytorch_lora_weights.safetensors";

export function ImageGenerator() {
  const [imageUrl, setImageUrl] = useState<string>();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!prompt) return;

    setIsGenerating(true);
    try {
      const result = await fal.subscribe("fal-ai/flux-lora", {
        input: {
          prompt: `An image of eliza, wearing an orange shirt that says "ai16z" in bold white letters, ${prompt}`,
          loras: [
            {
              path: ELIZA_LORA,
              scale: 1,
            },
          ],
          image_size: "square_hd",
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });

      setImageUrl(result.data.images[0].url);
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt]);

  return (
    <div className="h-full flex items-center justify-center p-4 flex-col pt-16 overflow-hidden grow">
      <div className="max-w-4xl w-full h-full flex flex-col grow justify-center items-center">
        <div className="space-y-4 md:space-y-8 flex flex-col w-full grow justify-center items-center">
          {/* Image Display Area */}
          <div className="aspect-square w-full max-w-[min(90vw,600px)] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Generated image"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-zinc-400 dark:text-zinc-600 text-sm md:text-lg text-center px-4">
                Generated image will appear here
              </div>
            )}
          </div>

          {/* Prompt Input Area */}
          <div className="space-y-4 w-full max-w-[min(90vw,600px)]">
            <ResizableTextarea
              className="w-full"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              rows={4}
            />

            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={isGenerating || !prompt}
                className="w-full md:w-auto flex items-center"
                color="orange"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Image"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
