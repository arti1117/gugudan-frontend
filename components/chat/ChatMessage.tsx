interface Props {
  role: "USER" | "ASSISTANT";
  content: string;
}

export function ChatMessage({ role, content }: Props) {
  const isUser = role === "USER";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap
          ${
            isUser
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-gray-200 text-gray-900 rounded-bl-none"
          }`}
      >
        {content}
      </div>
    </div>
  );
}
