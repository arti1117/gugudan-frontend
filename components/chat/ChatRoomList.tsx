"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  EllipsisHorizontalIcon, 
  TrashIcon 
} from "@heroicons/react/24/outline";

type ChatRoom = {
  room_id: string;
  title: string | null;
};

interface Props {
  selectedRoomId: string | null;
  onSelect: (roomId: string | null) => void;
}

export function ChatRoomList({ selectedRoomId, onSelect }: Props) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/conversation/rooms`, {
        credentials: "include",
      });
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
  }, []);

  useEffect(() => {
    void fetchRooms();
  }, [selectedRoomId, fetchRooms]);

  const handleDeleteRoom = async (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();
    setMenuOpenId(null);

    if (!confirm("이 채팅방을 삭제하시겠습니까? 대화 내용이 모두 사라집니다.")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/conversation/rooms/${roomId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setRooms((prev) => prev.filter((room) => room.room_id !== roomId));
        if (selectedRoomId === roomId) onSelect(null);
      } else {
        alert("삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      alert("서버 통신 중 오류가 발생했습니다.");
    }
  };

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    return rooms.filter((room) =>
      room.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rooms, searchQuery]);

  return (
    <aside className="w-72 border-r bg-[#f9f9f9] flex flex-col h-full shadow-sm relative">
      <div className="p-3 space-y-3 bg-white border-b">
        <button
          onClick={() => onSelect(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
            selectedRoomId === null ? "bg-gray-100 border-gray-300 shadow-sm" : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
          }`}
        >
          <PlusIcon className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-900">새 채팅</span>
        </button>

        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="채팅 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-2 py-4">
          <h3 className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">최근 대화</h3>
          {loading && rooms.length === 0 ? (
            <div className="p-4 text-sm text-gray-400 animate-pulse">불러오는 중...</div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-4 text-sm text-gray-400 text-center leading-relaxed">
              {searchQuery ? "검색 결과가 없습니다." : "대화 기록이 없습니다."}
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredRooms.map((room) => (
                <div key={room.room_id} className="relative group px-1">
                  <button
                    onClick={() => onSelect(room.room_id)}
                    className={`w-full text-left px-3 py-3 rounded-lg transition-all truncate pr-10 ${
                      selectedRoomId === room.room_id ? "bg-gray-200 text-gray-900 font-bold" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <span className="block truncate">{room.title || "새 대화"}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === room.room_id ? null : room.room_id);
                    }}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-gray-300 transition-all ${
                      menuOpenId === room.room_id ? "opacity-100 bg-gray-300" : "opacity-0 group-hover:opacity-100 text-gray-500"
                    }`}
                  >
                    <EllipsisHorizontalIcon className="w-5 h-5" />
                  </button>

                  {menuOpenId === room.room_id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); }} />
                      <div className="absolute right-2 top-11 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 animate-in fade-in zoom-in duration-75">
                        <button
                          onClick={(e) => handleDeleteRoom(e, room.room_id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                          삭제하기
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #d1d5db; }
      `}</style>
    </aside>
  );
}