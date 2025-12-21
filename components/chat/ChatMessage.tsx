export function ChatMessage({ role, content }: { role: "USER" | "ASSISTANT"; content: string }) {
  const isUser = role === "USER";

  return (
    <div className={`flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Profile Icon */}
        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${isUser ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
          {isUser ? "나" : "AI"}
        </div>
        
        {/* Bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap
            ${isUser 
              ? "bg-blue-600 text-white rounded-tr-none" 
              : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
            }`}
        >
          {content || (
             <div className="flex gap-1 py-2">
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
             </div>
          )}
        </div>
      </div>
    </div>
  );
}