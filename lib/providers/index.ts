import type { EmailProvider } from "./emailProvider";
import { MockEmailProvider } from "./mockEmailProvider";
import { GmailEmailProvider } from "./gmailEmailProvider";

/**
 * Factory function to get the appropriate email provider based on environment.
 * 
 * Set EMAIL_PROVIDER=gmail in .env.local to use Gmail API
 * Set EMAIL_PROVIDER=mock (or leave unset) to use mock data
 */
export function getEmailProvider(): EmailProvider {
  const providerType = process.env.EMAIL_PROVIDER || "mock";

  if (providerType === "gmail") {
    return new GmailEmailProvider();
  }

  // Default to mock provider
  return new MockEmailProvider();
}

// Re-export types for convenience
export type { EmailProvider } from "./emailProvider";

