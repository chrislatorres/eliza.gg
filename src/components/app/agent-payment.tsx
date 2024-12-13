import { PaymentService } from "bounties/nevermined/pay";
import { useState } from "react";

export function AgentPayment({
  onSuccess,
}: {
  onSuccess: (token: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setLoading(true);

      const payments = new PaymentService();
      await payments.init();
      await payments.connect();

      const { agreementId } = await payments.purchaseAgentAccess(
        process.env.NEXT_PUBLIC_AGENT_DID!
      );

      onSuccess(agreementId);
    } catch (err) {
      console.error("Payment failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-medium mb-2">Purchase Agent Access</h3>
      <p className="mb-4">100 API calls for $10</p>

      <button
        onClick={handlePurchase}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Processing..." : "Purchase Access"}
      </button>
    </div>
  );
}
