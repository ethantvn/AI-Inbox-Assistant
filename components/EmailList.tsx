import type { EmailThread } from "@/lib/mockEmails";

interface EmailListProps {
  emails: EmailThread[];
  selectedEmailId: string | null;
  repliedEmailIds: Set<string>;
  onSelectEmail: (id: string) => void;
}

export default function EmailList({
  emails,
  selectedEmailId,
  repliedEmailIds,
  onSelectEmail,
}: EmailListProps) {
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

  return (
    <div className="w-80 border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
      </div>
      <div className="overflow-y-auto">
        {emails.map((email) => {
          const isReplied = repliedEmailIds.has(email.id);
          return (
            <button
              key={email.id}
              onClick={() => onSelectEmail(email.id)}
              className={`w-full border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                selectedEmailId === email.id
                  ? "bg-blue-50 border-l-4 border-l-blue-600"
                  : ""
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {email.from}
                </span>
                {isReplied && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    ✓ Replied
                  </span>
                )}
              </div>
              <div className="mb-1 truncate text-sm text-gray-700">
                {email.subject}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(email.receivedAt)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

