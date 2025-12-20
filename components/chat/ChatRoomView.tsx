"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "./ChatMessage";

type Message = {
  role: "USER" | "ASSISTANT";
  content: string;
};

interface Props {
  roomId: string | null;
  onRoomCreated: (roomId: string) => void;
}

export function ChatRoomView({ roomId, onRoomCreated }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  /** 채팅 내역 로드 */
  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `http://localhost:33333/conversation/rooms/${roomId}/messages`,
          { credentials: "include" }
        );

        if (!res.ok) {
          setMessages([]);
          return;
        }

        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch {
        setMessages([]);
      }
    };

    void fetchMessages();
  }, [roomId]);

  /** 메시지 전송 */
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "USER", content: userMessage },
      { role: "ASSISTANT", content: "" },
    ]);

    try {
      const res = await fetch(
        "http://localhost:33333/conversation/chat/stream-auto",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room_id: roomId,
            message: userMessage,
          }),
        }
      );

      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        assistantText += decoder.decode(value);
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "ASSISTANT",
            content: assistantText,
          };
          return copy;
        });

        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }

      /** 새 방 생성된 경우 → 방 목록 다시 조회 */
      if (!roomId) {
        const roomsRes = await fetch(
          "http://localhost:33333/conversation/rooms",
          { credentials: "include" }
        );
        const rooms = await roomsRes.json();
        const newest = rooms[0];
        if (newest?.room_id) {
          onRoomCreated(newest.room_id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <header className="p-4 border-b font-semibold">💬 상담 채팅</header>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
        {messages.map((msg, idx) => (
          <ChatMessage
            key={idx}
            role={msg.role}
            content={msg.content}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="메시지를 입력하세요"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
        >
          전송
        </button>
      </div>
    </div>
  );
}
