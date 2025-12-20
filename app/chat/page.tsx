"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ChatRoomList } from "@/components/chat/ChatRoomList";
import { ChatRoomView } from "@/components/chat/ChatRoomView";

export default function ChatPage() {
  const [roomId, setRoomId] = useState<string | null>(null);

  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        <ChatRoomList
          selectedRoomId={roomId}
          onSelect={setRoomId}
        />

        <ChatRoomView
          roomId={roomId}
          onRoomCreated={setRoomId}
        />
      </div>
    </ProtectedRoute>
  );
}
