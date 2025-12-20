"use client";

import { useEffect, useState } from "react";

type ChatRoom = {
  room_id: string;
  title: string | null;
};

interface Props {
  selectedRoomId: string | null;
  onSelect: (roomId: string) => void;
}

export function ChatRoomList({ selectedRoomId, onSelect }: Props) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:33333/conversation/rooms",
        { credentials: "include" }
      );

      if (!res.ok) {
        setRooms([]);
        return;
      }

      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRooms();
  }, []);

  return (
    <aside className="w-72 border-r bg-white flex flex-col">
      <div className="p-4 font-semibold border-b">내 채팅방</div>

      {loading && (
        <div className="p-4 text-sm text-gray-400">불러오는 중...</div>
      )}

      {!loading && rooms.length === 0 && (
        <div className="p-4 text-sm text-gray-400">
          메시지를 입력하면 새 채팅방이 생성됩니다.
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {rooms.map((room) => (
          <button
            key={room.room_id}
            onClick={() => onSelect(room.room_id)}
            className={`w-full text-left px-4 py-3 border-b hover:bg-gray-100 ${
              selectedRoomId === room.room_id ? "bg-gray-200" : ""
            }`}
          >
            {room.title ?? "새 채팅"}
          </button>
        ))}
      </div>
    </aside>
  );
}
