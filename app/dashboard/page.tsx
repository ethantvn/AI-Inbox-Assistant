"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import EmailList from "@/components/EmailList";
import EmailDetail from "@/components/EmailDetail";
import { getEmailProvider } from "@/lib/providers";
import type { EmailThread } from "@/lib/mockEmails";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const emailProvider = useMemo(() => getEmailProvider(), []);

  // State for emails
  const [emails, setEmails] = useState<EmailThread[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState<boolean>(true);

  // Load emails for the current user
  useEffect(() => {
    async function loadEmails() {
      if (!session?.user?.email) {
        setEmails([]);
        setIsLoadingEmails(false);
        return;
      }

      setIsLoadingEmails(true);
      try {
        // Check if using Gmail provider - if so, use API route
        // Note: Use NEXT_PUBLIC_ prefix for client-side env vars
        const providerType = process.env.NEXT_PUBLIC_EMAIL_PROVIDER || "mock";
        
        if (providerType === "gmail") {
          // For Gmail, use API route since we need server-side session access
          const response = await fetch("/api/gmail/emails");
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to fetch Gmail emails");
          }
          const data = await response.json();
          setEmails(data.emails);
        } else {
          // For mock provider, call directly
          const userEmails = await emailProvider.listRecentEmails(session.user.email);
          setEmails(userEmails);
        }
      } catch (error) {
        console.error("Failed to load emails:", error);
        setEmails([]);
      } finally {
        setIsLoadingEmails(false);
      }
    }

    loadEmails();
  }, [session?.user?.email, emailProvider]);

  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  // Map from emailId -> replyText
  const [replies, setReplies] = useState<Map<string, string>>(new Map());
  const [isLoadingReply, setIsLoadingReply] = useState<boolean>(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  // Track which emails have been replied to
  const [repliedEmailIds, setRepliedEmailIds] = useState<Set<string>>(new Set());
  const [sendConfirmation, setSendConfirmation] = useState<string | null>(null);

  const selectedEmail = emails.find(
    (email) => email.id === selectedEmailId
  );

  // Get current reply text for selected email
  const currentReplyText = selectedEmailId
    ? replies.get(selectedEmailId) || ""
    : "";

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/dashboard");
    }
  }, [status, router]);

  // Clear error and confirmation when email selection changes
  useEffect(() => {
    setReplyError(null);
    setSendConfirmation(null);
  }, [selectedEmailId]);

  // Update selected email when emails change
  useEffect(() => {
    if (emails.length > 0 && !selectedEmailId) {
      setSelectedEmailId(emails[0].id);
    }
  }, [emails, selectedEmailId]);

  // Show loading state while checking authentication or loading emails
  if (status === "loading" || isLoadingEmails) {
    return (
      <main className="flex h-screen flex-col items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </main>
    );
  }

  // Don't render dashboard if not authenticated
  if (status === "unauthenticated" || !session || !session.user?.email) {
    return null;
  }

  const fetchAiReply = async (email: EmailThread, isRegenerating: boolean = false) => {
    setIsLoadingReply(true);
    setReplyError(null);
    setSendConfirmation(null);

    try {
      const response = await fetch("/api/draft-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: {
            from: email.from,
            subject: email.subject,
            body: email.body,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate reply");
      }

      // Update the reply for this email in the map
      setReplies((prev) => {
        const newMap = new Map(prev);
        newMap.set(email.id, data.reply);
        return newMap;
      });
    } catch (error) {
      setReplyError(
        error instanceof Error
          ? error.message
          : "An error occurred while generating the reply."
      );
    } finally {
      setIsLoadingReply(false);
    }
  };

  const handleReplyTextChange = (emailId: string, text: string) => {
    setReplies((prev) => {
      const newMap = new Map(prev);
      newMap.set(emailId, text);
      return newMap;
    });
  };

  const handleSendReply = async (emailId: string) => {
    if (!session?.user?.email || !selectedEmail) return;

    try {
      // Get the reply text for this email
      const replyText = replies.get(emailId) || "";
      
      if (!replyText.trim()) {
        return;
      }

      // Send reply using the email provider
      await emailProvider.sendReply({
        userIdOrEmail: session.user.email,
        threadId: emailId,
        replyBody: replyText,
      });

      // Mark email as replied
      setRepliedEmailIds((prev) => new Set(prev).add(emailId));
      
      // Show confirmation
      setSendConfirmation("Reply sent successfully");
      
      // Clear confirmation after 3 seconds
      setTimeout(() => {
        setSendConfirmation(null);
      }, 3000);
    } catch (error) {
      console.error("Failed to send reply:", error);
      setSendConfirmation("Failed to send reply. Please try again.");
      setTimeout(() => {
        setSendConfirmation(null);
      }, 3000);
    }
  };

  return (
    <main className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <EmailList
          emails={emails}
          selectedEmailId={selectedEmailId}
          repliedEmailIds={repliedEmailIds}
          onSelectEmail={setSelectedEmailId}
        />
        <EmailDetail
          email={selectedEmail}
          replyText={currentReplyText}
          isLoading={isLoadingReply}
          errorMessage={replyError || undefined}
          sendConfirmation={sendConfirmation}
          onChangeReplyText={(value) =>
            selectedEmailId && handleReplyTextChange(selectedEmailId, value)
          }
          onGenerate={() => selectedEmail && fetchAiReply(selectedEmail)}
          onRegenerate={() => selectedEmail && fetchAiReply(selectedEmail, true)}
          onSendReply={() => selectedEmailId && handleSendReply(selectedEmailId)}
        />
      </div>
    </main>
  );
}


