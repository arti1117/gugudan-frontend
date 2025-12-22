"use client";
import { useState, useCallback } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ChatRoomList } from "@/components/chat/ChatRoomList";
import { ChatRoomView } from "@/components/chat/ChatRoomView";
const STORAGE_KEY = "selectedRoomId";
export default function ChatPage() {
  // :흰색_확인_표시: 1) /chat 진입 시 저장된 roomId 복원
  const [roomId, setRoomId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  });
  // :흰색_확인_표시: 2) 선택 변경 시: state + localStorage 동기화
  const handleSelectRoom = useCallback((nextRoomId: string | null) => {
    setRoomId(nextRoomId);
    if (nextRoomId) localStorage.setItem(STORAGE_KEY, nextRoomId);
    else localStorage.removeItem(STORAGE_KEY);
  }, []);
  // :흰색_확인_표시: 3) 방 생성됐을 때도 저장
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