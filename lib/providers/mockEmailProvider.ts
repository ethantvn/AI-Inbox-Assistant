import type { EmailProvider } from "./emailProvider";
import type { EmailThread } from "@/lib/mockEmails";

/**
 * Mock email provider for development and testing.
 * Uses in-memory mock data instead of real email API calls.
 */
export class MockEmailProvider implements EmailProvider {
  private getMockEmails(): EmailThread[] {
    return [
      {
        id: "1",
        from: "sarah.johnson@example.com",
        subject: "Appointment Request - Consultation",
        receivedAt: "2024-01-15T10:30:00Z",
        body: "Hi there,\n\nI'm interested in scheduling a consultation for next week. Would you have availability on Tuesday or Wednesday afternoon?\n\nLooking forward to hearing from you.\n\nBest regards,\nSarah Johnson",
      },
      {
        id: "2",
        from: "mike.chen@businessco.com",
        subject: "Reschedule Meeting",
        receivedAt: "2024-01-15T09:15:00Z",
        body: "Hello,\n\nI apologize for the short notice, but I need to reschedule our meeting that was planned for this Friday. Could we move it to next Monday instead?\n\nLet me know what works for you.\n\nThanks,\nMike Chen",
      },
      {
        id: "3",
        from: "info@techstartup.io",
        subject: "Quote Request - Website Development",
        receivedAt: "2024-01-14T16:45:00Z",
        body: "Good afternoon,\n\nWe're looking to get a quote for a website development project. We need a 5-page website with a contact form and basic SEO setup.\n\nCould you provide an estimate and timeline?\n\nThank you,\nTech Startup Team",
      },
      {
        id: "4",
        from: "jennifer.martinez@email.com",
        subject: "Follow-up on Proposal",
        receivedAt: "2024-01-14T14:20:00Z",
        body: "Hi,\n\nI wanted to follow up on the proposal you sent last week. We've reviewed it and have a few questions before we can move forward.\n\nCould we schedule a brief call to discuss?\n\nBest,\nJennifer Martinez",
      },
      {
        id: "5",
        from: "support@vendor.com",
        subject: "Invoice #INV-2024-001",
        receivedAt: "2024-01-14T11:00:00Z",
        body: "Dear Customer,\n\nPlease find attached invoice #INV-2024-001 for services rendered in January 2024.\n\nPayment is due within 30 days. If you have any questions, please don't hesitate to contact us.\n\nThank you for your business.\n\nVendor Support Team",
      },
      {
        id: "6",
        from: "david.williams@clientcorp.com",
        subject: "Urgent: Project Update Needed",
        receivedAt: "2024-01-13T08:30:00Z",
        body: "Hello,\n\nWe need an update on the project status as soon as possible. Our stakeholders are asking for progress details.\n\nCan you provide a status report by end of day today?\n\nThanks,\nDavid Williams",
      },
    ];
  }

  async listRecentEmails(userIdOrEmail: string): Promise<EmailThread[]> {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // In the future, this could filter by user or fetch from a database
    // For now, return the same mock emails for all users
    return this.getMockEmails();
  }

  async sendReply(params: {
    userIdOrEmail: string;
    threadId: string;
    replyBody: string;
  }): Promise<void> {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    // Mock implementation - in the future this would actually send the email
    console.log("Mock: Sending reply", {
      userIdOrEmail: params.userIdOrEmail,
      threadId: params.threadId,
      replyBody: params.replyBody,
    });
    
    // In a real implementation, this would:
    // - Call Gmail API to send the reply
    // - Handle errors and retries
    // - Update thread status
  }
}

