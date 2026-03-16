import type { EmailThread } from "@/lib/mockEmails";

interface EmailDetailProps {
  email: EmailThread | null;
  replyText: string;
  isLoading: boolean;
  errorMessage?: string;
  sendConfirmation?: string | null;
  onChangeReplyText: (value: string) => void;
  onGenerate: () => void;
  onRegenerate: () => void;
  onSendReply: () => void;
}

export default function EmailDetail({
  email,
  replyText,
  isLoading,
  errorMessage,
  sendConfirmation,
  onChangeReplyText,
  onGenerate,
  onRegenerate,
  onSendReply,
}: EmailDetailProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (!email) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select an email to view details</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
      <div className="flex-1 overflow-y-auto bg-white p-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4">
            <div className="mb-2 text-sm text-gray-500">From</div>
            <div className="text-base font-medium text-gray-900">
              {email.from}
            </div>
          </div>
          <div className="mb-4">
            <div className="mb-2 text-sm text-gray-500">Subject</div>
            <div className="text-lg font-semibold text-gray-900">
              {email.subject}
            </div>
          </div>
          <div className="mb-6">
            <div className="mb-2 text-sm text-gray-500">Date</div>
            <div className="text-sm text-gray-700">
              {formatDate(email.receivedAt)}
            </div>
          </div>
          <div className="mb-6 border-t border-gray-200 pt-6">
            <div className="mb-2 text-sm text-gray-500">Message</div>
            <div className="whitespace-pre-wrap text-base text-gray-900">
              {email.body}
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={onGenerate}
              disabled={isLoading}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Generating reply..." : "Generate AI Reply"}
            </button>
          </div>
        </div>
      </div>

      {/* AI Suggested Reply */}
      <div className="border-t border-gray-200 bg-white p-6">
        <div className="mx-auto max-w-3xl">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            AI Suggested Reply
          </h3>
          {isLoading ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">
                  Generating reply...
                </div>
              </div>
            </div>
          ) : (
            <>
              <textarea
                value={replyText}
                onChange={(e) => onChangeReplyText(e.target.value)}
                placeholder="No reply generated yet. Click 'Generate AI Reply' to create one."
                className="mb-4 min-h-[200px] w-full rounded-lg border border-gray-300 bg-white p-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={onRegenerate}
                  disabled={isLoading || !email}
                  className="rounded-lg bg-gray-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "Regenerating..." : "Regenerate"}
                </button>
                <button
                  onClick={onSendReply}
                  disabled={isLoading || !replyText.trim()}
                  className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send Reply
                </button>
                {sendConfirmation && (
                  <span className="text-sm font-medium text-green-600">
                    {sendConfirmation}
                  </span>
                )}
              </div>
              {errorMessage && (
                <div className="mt-3 rounded bg-red-50 p-3">
                  <p className="text-sm text-red-800">
                    {errorMessage}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

