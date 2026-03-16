import type { EmailProvider } from "./emailProvider";
import type { EmailThread } from "@/lib/mockEmails";

/**
 * Gmail Email Provider
 * 
 * Fetches emails from Gmail API using the user's OAuth access token.
 * 
 * SETUP REQUIRED:
 * 1. Enable Gmail API in Google Cloud Console
 * 2. Add Gmail scopes to NextAuth configuration
 * 3. Store access token in session (see app/api/auth/[...nextauth]/route.ts)
 * 4. Set EMAIL_PROVIDER=gmail in .env.local to use this provider
 */
export class GmailEmailProvider implements EmailProvider {
  /**
   * Get access token for the user
   * 
   * This method needs to be called from a server context where you can access the session.
   * For client-side usage, you'll need to create an API route that fetches the token.
   */
  private async getAccessToken(userIdOrEmail: string): Promise<string> {
    // TODO: Implement token retrieval based on your setup
    // 
    // Option 1: If calling from server component/API route, use getServerSession:
    //   import { getServerSession } from "next-auth";
    //   const session = await getServerSession(authOptions);
    //   return session?.accessToken;
    //
    // Option 2: If you store tokens in a database:
    //   const user = await db.user.findUnique({ where: { email: userIdOrEmail } });
    //   return user?.accessToken;
    //
    // Option 3: Create an API route /api/gmail/token that returns the token
    //   Then call it from here: const res = await fetch('/api/gmail/token');
    
    // For now, this is a placeholder
    throw new Error(
      "GmailEmailProvider: Access token retrieval not implemented. " +
      "See getAccessToken() method comments for implementation options."
    );
  }

  /**
   * Fetch messages from Gmail API
   */
  protected async fetchGmailMessages(
    accessToken: string,
    maxResults: number = 20
  ): Promise<any[]> {
    // Gmail API endpoint to list messages
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Gmail API error: ${response.status} ${response.statusText}. ` +
        `${error.error?.message || "Check your access token and Gmail API setup."}`
      );
    }

    const data = await response.json();
    return data.messages || [];
  }

  /**
   * Fetch full message details from Gmail API
   */
  protected async fetchMessageDetails(
    accessToken: string,
    messageId: string
  ): Promise<any> {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch message ${messageId}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Extract email body from Gmail message payload
   */
  private extractBody(payload: any): string {
    let body = "";

    if (payload.body?.data) {
      // Decode base64url encoded body
      body = Buffer.from(payload.body.data, "base64url").toString("utf-8");
    } else if (payload.parts) {
      // Handle multipart messages
      for (const part of payload.parts) {
        if (part.mimeType === "text/plain" && part.body?.data) {
          body = Buffer.from(part.body.data, "base64url").toString("utf-8");
          break;
        } else if (part.mimeType === "text/html" && part.body?.data && !body) {
          // Fallback to HTML if plain text not available
          const htmlBody = Buffer.from(part.body.data, "base64url").toString("utf-8");
          // Simple HTML to text conversion (you might want a better solution)
          body = htmlBody.replace(/<[^>]*>/g, "").substring(0, 500);
        }
      }
    }

    return body || "(No body content)";
  }

  /**
   * Extract header value from Gmail message
   */
  private getHeader(headers: any[], name: string): string {
    const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
    return header?.value || "";
  }

  /**
   * Map Gmail API message to EmailThread format
   */
  protected mapGmailMessageToEmailThread(message: any): EmailThread {
    const payload = message.payload;
    const headers = payload.headers || [];

    const from = this.getHeader(headers, "From");
    const subject = this.getHeader(headers, "Subject");
    const date = this.getHeader(headers, "Date");
    const body = this.extractBody(payload);

    // Parse date to ISO string
    let receivedAt = new Date().toISOString();
    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        receivedAt = parsedDate.toISOString();
      }
    }

    return {
      id: message.id,
      from: from || "unknown@example.com",
      subject: subject || "(No subject)",
      receivedAt: receivedAt,
      body: body,
    };
  }

  async listRecentEmails(userIdOrEmail: string): Promise<EmailThread[]> {
    try {
      // TODO: Get access token from session/database
      const accessToken = await this.getAccessToken(userIdOrEmail);

      // Fetch message list
      const messages = await this.fetchGmailMessages(accessToken, 20);

      // Fetch full details for each message
      const emailThreads: EmailThread[] = [];
      for (const messageRef of messages) {
        try {
          const messageDetails = await this.fetchMessageDetails(
            accessToken,
            messageRef.id
          );
          const emailThread = this.mapGmailMessageToEmailThread(messageDetails);
          emailThreads.push(emailThread);
        } catch (error) {
          console.error(`Failed to fetch message ${messageRef.id}:`, error);
          // Continue with other messages
        }
      }

      return emailThreads;
    } catch (error) {
      console.error("GmailEmailProvider.listRecentEmails error:", error);
      throw error;
    }
  }

  async sendReply(params: {
    userIdOrEmail: string;
    threadId: string;
    replyBody: string;
  }): Promise<void> {
    // TODO: Implement Gmail API send reply
    // This requires the gmail.send scope and constructing a proper MIME message
    throw new Error("GmailEmailProvider.sendReply not yet implemented");
  }
}

