"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "./ChatMessage";

type Message = {
  role: "USER" | "ASSISTANT";
  content: string;
};

interface ChatRoomViewProps {
  roomId: number | null;
  onRoomCreated: (roomId: number) => void;
}

export function ChatRoomView({ roomId, onRoomCreated }: ChatRoomViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [currentRoomId, setCurrentRoomId] = useState<number | null>(roomId);

  /** 채팅 내역 로드 */
  useEffect(() => {
    if (!currentRoomId) {
      setMessages([]); // 새 채팅방이면 메시지 없음
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `http://localhost:33333/conversation/rooms/${currentRoomId}/messages`,
          { credentials: "include" }
        );
        const data: Message[] = await res.json();
        setMessages(data);
      } catch (err) {
        console.error(err);
      }
    };

    void fetchMessages();
  }, [currentRoomId]);

  /** 메시지 전송 + 스트리밍 + 자동 새 방 생성 */
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
      const response = await fetch(
        `http://localhost:33333/conversation/chat/stream-auto`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room_id: currentRoomId, // 없으면 서버에서 새 방 생성
            message: userMessage,
          }),
        }
      );

      if (!response.body) return;

      const reader = response.body.getReader();
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

      // 새로 생성된 방이면 roomId 갱신 + 부모에게 알림
      if (!currentRoomId) {
        const roomsRes = await fetch("http://localhost:33333/conversation/rooms", {
          credentials: "include",
        });
        const rooms = await roomsRes.json();
        const newRoom = rooms[rooms.length - 1]; // 마지막 방이 새 방
        setCurrentRoomId(newRoom.room_id);
        onRoomCreated(newRoom.room_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <header className="p-4 border-b font-semibold">💬 상담 채팅</header>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} role={msg.role} content={msg.content} />
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
