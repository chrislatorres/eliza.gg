import type { Endpoint } from "@nevermined-io/payments";
import { EnvironmentName, Payments } from "@nevermined-io/payments";

export class PaymentService {
  private payments: Payments;

  constructor() {
    this.payments = Payments.getInstance({
      returnUrl: process.env.NEXT_PUBLIC_APP_URL,
      environment: (process.env.NEXT_PUBLIC_NEVERMINED_ENV ||
        "staging") as EnvironmentName,
    });
  }

  async init() {
    await this.payments.init();
  }

  async connect() {
    await this.payments.connect();
  }

  async purchaseAgentAccess(
    did: string
  ): Promise<{ agreementId: string; success: boolean }> {
    return await this.payments.orderPlan(did);
  }

  async createAgentPlan({
    name,
    description,
    priceInCents,
    creditsPerPlan = 100,
    tags = [],
  }: {
    name: string;
    description: string;
    priceInCents: number;
    creditsPerPlan?: number;
    tags?: string[];
  }) {
    // Convert cents to wei
    const priceInWei = BigInt(priceInCents * 10000000000000000);

    const planDID = await this.payments.createCreditsPlan({
      name,
      description,
      price: priceInWei,
      tokenAddress: process.env.NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS!,
      amountOfCredits: creditsPerPlan,
      tags,
    });

    return planDID;
  }

  async registerAgentService({
    planDID,
    name,
    description,
    endpoints,
    creditsPerCall = 1,
  }: {
    planDID: string;
    name: string;
    description: string;
    endpoints: Endpoint[];
    creditsPerCall?: number;
  }) {
    const agentDID = await this.payments.createService({
      planDID,
      name,
      description,
      serviceType: "agent",
      serviceChargeType: "fixed",
      authType: "bearer",
      token: process.env.NEXT_PUBLIC_AUTH_TOKEN!,
      amountOfCredits: creditsPerCall,
      endpoints,
      openEndpoints: [],
    });

    return agentDID;
  }
}
