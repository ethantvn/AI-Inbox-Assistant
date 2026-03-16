import type { EmailThread } from "@/lib/mockEmails";

/**
 * Interface for email providers (Gmail, Outlook, Mock, etc.)
 * This abstraction allows swapping email providers without changing dashboard code.
 */
export interface EmailProvider {
  /**
   * Lists recent emails for a user
   * @param userIdOrEmail - User identifier (email address or user ID)
   * @returns Promise resolving to array of email threads
   */
  listRecentEmails(userIdOrEmail: string): Promise<EmailThread[]>;

  /**
   * Sends a reply to an email thread
   * @param params - Reply parameters
   * @param params.userIdOrEmail - User identifier
   * @param params.threadId - ID of the email thread to reply to
   * @param params.replyBody - Body text of the reply
   * @returns Promise that resolves when reply is sent
   */
  sendReply(params: {
    userIdOrEmail: string;
    threadId: string;
    replyBody: string;
  }): Promise<void>;
}

