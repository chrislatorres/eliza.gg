import { ContributorSearch } from "@/components/contributor-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { Contributor, Token } from "./types";

interface AllocationModalProps {
  onClose: () => void;
  onAllocate: (githubUsername: string, amount: number) => Promise<void>;
  selectedToken: Token;
}

export function AllocationModal({
  onClose,
  onAllocate,
  selectedToken,
}: AllocationModalProps) {
  const [selectedContributor, setSelectedContributor] =
    useState<Contributor | null>(null);
  const [amount, setAmount] = useState("");
  const [isAllocating, setIsAllocating] = useState(false);

  const handleAllocate = async () => {
    if (!selectedContributor || !amount) return;

    setIsAllocating(true);
    try {
      await onAllocate(selectedContributor.login, parseFloat(amount));
      onClose();
    } catch (error) {
      console.error("Failed to allocate:", error);
    } finally {
      setIsAllocating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg max-w-lg w-full">
        <h3 className="text-lg font-semibold mb-4">Allocate Tokens</h3>

        <ContributorSearch
          onSelect={(contributor) => setSelectedContributor(contributor)}
        />

        {selectedContributor && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Amount ({selectedToken.symbol})
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={onClose} outline disabled={isAllocating}>
                Cancel
              </Button>
              <Button
                onClick={handleAllocate}
                disabled={isAllocating || !amount || parseFloat(amount) <= 0}
              >
                {isAllocating ? "Allocating..." : "Allocate Tokens"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
