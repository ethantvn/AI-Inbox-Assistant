import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { GmailEmailProvider } from "@/lib/providers/gmailEmailProvider";

/**
 * API route to fetch emails using Gmail API
 * This is needed because GmailEmailProvider needs server-side access to the session
 */
export async function GET(request: NextRequest) {
  try {
    // Get the session to access the user's email and access token
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get access token from session
    const accessToken = (session as any).accessToken;

    if (!accessToken) {
      return NextResponse.json(
        {
          error:
            "Gmail access token not found. Please sign out and sign in again to grant Gmail permissions.",
        },
        { status: 401 }
      );
    }

    // Create a Gmail provider instance with token access
    const provider = new GmailEmailProviderWithToken(accessToken);

    // Fetch emails
    const emails = await provider.listRecentEmails(session.user.email);

    return NextResponse.json({ emails });
  } catch (error) {
    console.error("Error fetching Gmail emails:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch emails from Gmail",
      },
      { status: 500 }
    );
  }
}

/**
 * Helper class that extends GmailEmailProvider with token injection
 * This allows us to pass the token directly instead of fetching it
 */
class GmailEmailProviderWithToken extends GmailEmailProvider {
  constructor(private accessToken: string) {
    super();
  }

  // Override the listRecentEmails method to use the injected token
  async listRecentEmails(userIdOrEmail: string): Promise<any[]> {
    // Fetch message list using the injected token
    const messages = await this.fetchGmailMessages(this.accessToken, 20);

    // Fetch full details for each message
    const emailThreads: any[] = [];
    for (const messageRef of messages) {
      try {
        const messageDetails = await this.fetchMessageDetails(
          this.accessToken,
          messageRef.id
        );
        const emailThread = this.mapGmailMessageToEmailThread(messageDetails);
        emailThreads.push(emailThread);
      } catch (error) {
        console.error(`Failed to fetch message ${messageRef.id}:`, error);
      }
    }

    return emailThreads;
  }
}

