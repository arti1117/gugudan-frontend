"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"; // 아이콘 라이브러리 설치 권장 (npm i @heroicons/react)

type ChatRoom = {
  room_id: string;
  title: string | null;
};

interface Props {
  selectedRoomId: string | null;
  onSelect: (roomId: string | null) => void; // null 전달이 가능하도록 수정
}

export function ChatRoomList({ selectedRoomId, onSelect }: Props) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:33333/conversation/rooms", {
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

  // 초기 로드 및 선택된 방 변경 시 갱신
  useEffect(() => {
    void fetchRooms();
  }, [selectedRoomId, fetchRooms]);

  // 검색 필터링 로직
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    return rooms.filter((room) =>
      room.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rooms, searchQuery]);

  return (
    <aside className="w-72 border-r bg-[#f9f9f9] flex flex-col h-full shadow-sm">
      {/* 1. 상단 섹션: 새 채팅 및 검색 */}
      <div className="p-3 space-y-3 bg-white border-b">
        <button
          onClick={() => onSelect(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
            selectedRoomId === null
              ? "bg-gray-100 border-gray-300 shadow-sm"
              : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
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

      {/* 2. 하단 섹션: 스크롤 가능한 목록 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-2 py-4">
          <h3 className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            최근 대화
          </h3>

          {loading && rooms.length === 0 ? (
            <div className="p-4 text-sm text-gray-400 animate-pulse">불러오는 중...</div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-4 text-sm text-gray-400 text-center leading-relaxed">
              {searchQuery ? "검색 결과가 없습니다." : "대화 기록이 없습니다."}
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredRooms.map((room) => (
                <button
                  key={room.room_id}
                  onClick={() => onSelect(room.room_id)}
                  className={`w-full text-left px-3 py-3 rounded-lg transition-all truncate group ${
                    selectedRoomId === room.room_id
                      ? "bg-gray-200 text-gray-900 font-bold"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="block truncate">
                    {room.title && room.title.trim() !== "" ? room.title : "새 대화"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 스타일 커스텀 (CSS-in-JS 또는 전역 CSS에 추가) */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
        }
      `}</style>
    </aside>
  );
}