import { useState } from "react";
import { CryptoSherpa } from "./agent";

interface Action {
  id: string;
  description: string;
  execute: () => Promise<void>;
}

interface QueryResponse {
  response: string;
  actions: Action[];
}

export function CryptoSherpaUI() {
  const [sherpa] = useState(() => new CryptoSherpa());
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<QueryResponse | null>(null);

  const handleQuery = async () => {
    const result = await sherpa.processQuery(query);
    setResponse(result);
  };

  const handleAction = async (action: Action) => {
    try {
      await action.execute();
    } catch (error) {
      console.error("Failed to execute action:", error);
    }
  };

  return (
    <div className="p-4">
      <h2>CryptoSherpa: Your Web3 Guide</h2>

      {/* Query Interface */}
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask about crypto or request actions..."
        className="w-full p-2 border rounded"
      />

      <button
        onClick={handleQuery}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Submit
      </button>

      {/* Display Response */}
      {response && (
        <div className="mt-4">
          <p className="whitespace-pre-wrap">{response.response}</p>
          {response.actions.map((action) => (
            <div key={action.id} className="mt-2">
              <button
                onClick={() => handleAction(action)}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Execute: {action.description}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Autonomous Mode Controls */}
      <div className="mt-8">
        <h3>Autonomous Trading</h3>
        <button
          onClick={() =>
            sherpa.startAutonomousMode({
              monitoredTokens: ["ETH", "USDC"],
              tradingStrategy: "conservative",
              riskLevel: "low",
            })
          }
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Start Auto-Trading
        </button>
      </div>
    </div>
  );
}
