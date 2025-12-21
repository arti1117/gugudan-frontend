"use client";

import { useEffect, useState, useCallback } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ChatRoomList } from "@/components/chat/ChatRoomList";
import { ChatRoomView } from "@/components/chat/ChatRoomView";

const STORAGE_KEY = "selectedRoomId";

export default function ChatPage() {
  const [roomId, setRoomId] = useState<string | null>(null);

  // ✅ 1) /chat 진입 시 저장된 roomId 복원
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setRoomId(saved);
  }, []);

  // ✅ 2) 선택 변경 시: state + localStorage 동기화
  const handleSelectRoom = useCallback((nextRoomId: string | null) => {
    setRoomId(nextRoomId);

    if (nextRoomId) localStorage.setItem(STORAGE_KEY, nextRoomId);
    else localStorage.removeItem(STORAGE_KEY); // 새 채팅
  }, []);

  // ✅ 3) 방 생성됐을 때도 저장
  const handleRoomCreated = useCallback((newRoomId: string) => {
    setRoomId(newRoomId);
    localStorage.setItem(STORAGE_KEY, newRoomId);
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        <ChatRoomList selectedRoomId={roomId} onSelect={handleSelectRoom} />
        <ChatRoomView roomId={roomId} onRoomCreated={handleRoomCreated} />
      </div>
    </ProtectedRoute>
  );
}
