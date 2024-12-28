"use client";

import { ImageExamplePrompts } from "@/components/app/image-example-prompts";
import { TextareaWithActions } from "@/components/app/textarea-with-actions";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const ELIZA_LORA =
  "https://v3.fal.media/files/zebra/e2AhhSdf1Qp6W_lRgyfzH_pytorch_lora_weights.safetensors";

export function ImageGenerator() {
  const [imageUrl, setImageUrl] = useState<string>("/universe.jpg");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent, inputPrompt?: string) => {
      e.preventDefault();
      const promptToUse = inputPrompt || prompt;

      if (!promptToUse) {
        toast.error("Please enter a prompt first");
        return;
      }

      toast.error(
        "You're currently out of credits! DM @chrislatorres to get more"
      );
      return;

      /* Commented out image generation code
      toast.message("Generating your image...", {
        description: promptToUse,
      });

      setIsGenerating(true);
      try {
        const result = await fal.subscribe("fal-ai/flux-lora", {
          input: {
            prompt: `An image of eliza, wearing an orange shirt that says "ai16z" in bold white letters, ${promptToUse}`,
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

        if (!result.data.images?.[0]?.url) {
          throw new Error("No image was generated");
        }

        setImageUrl(result.data.images[0].url);
        toast.success("Image generated successfully!");
      } catch (error) {
        console.error("Failed to generate image:", error);

        if (error instanceof Error) {
          toast.error(`Failed to generate image: ${error.message}`);
        } else if (typeof error === "string") {
          toast.error(`Failed to generate image: ${error}`);
        } else {
          toast.error("Failed to generate image. Please try again later.");
        }
      } finally {
        setIsGenerating(false);
      }
      */
    },
    [prompt]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setPrompt(e.target.value);
    },
    []
  );

  const handlePromptSelect = useCallback(
    (selectedPrompt: string) => {
      setPrompt(selectedPrompt);
      const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSubmit(syntheticEvent, selectedPrompt);
    },
    [handleSubmit]
  );

  return (
    <main className="flex flex-col min-h-full">
      <div className="flex-1 relative mx-auto w-full">
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
          {/* Image Display Area */}
          <div className="w-full max-w-[min(90vh,800px)] px-4">
            <div className="aspect-square w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
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
          </div>
        </div>
      </div>

      {/* Fixed Textarea at Bottom */}
      <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-white dark:from-black from-50% to-transparent pb-6 pt-8">
        <div className="max-w-3xl mx-auto px-4 md:px-0">
          <div className="flex flex-col gap-4">
            <ImageExamplePrompts onPromptSelect={handlePromptSelect} />
            <TextareaWithActions
              input={prompt}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              isLoading={isGenerating}
              placeholder="What Eliza will you imagine?"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
