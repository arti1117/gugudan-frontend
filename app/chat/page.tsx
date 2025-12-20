"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ChatRoomList } from "@/components/chat/ChatRoomList";
import { ChatRoomView } from "@/components/chat/ChatRoomView";

export default function ChatPage() {
  const [roomId, setRoomId] = useState<number | null>(null);

  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        {/* 좌측: 채팅방 목록 */}
        <ChatRoomList onSelect={setRoomId} selectedRoomId={roomId} />

        {/* 우측: 채팅 영역 */}
        <ChatRoomView roomId={roomId} onRoomCreated={setRoomId} />
      </div>
    </ProtectedRoute>
  );
}
