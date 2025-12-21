"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "./ChatMessage";
import { StopIcon, PaperAirplaneIcon, SparklesIcon, HeartIcon, ChatBubbleLeftEllipsisIcon, ArrowsRightLeftIcon, FaceSmileIcon } from "@heroicons/react/24/outline";

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
  const [isComposing, setIsComposing] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 자동 포커스
  useEffect(() => {
    inputRef.current?.focus();
  }, [roomId]);

  /** 채팅 내역 로드 */
  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:33333/conversation/rooms/${roomId}/messages`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setMessages(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };
    void fetchMessages();
  }, [roomId]);

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  };

  /** 메시지 전송 통합 로직 (텍스트를 인자로 받음) */
  const handleSendMessage = async (textToSend?: string) => {
    const finalContent = textToSend || input;
    if (!finalContent.trim() || loading) return;

    abortControllerRef.current = new AbortController();
    setInput("");
    setLoading(true);

    // 1. UI에 즉시 메시지 추가
    setMessages((prev) => [
      ...prev, 
      { role: "USER", content: finalContent }, 
      { role: "ASSISTANT", content: "" }
    ]);

    try {
      const res = await fetch("http://localhost:33333/conversation/chat/stream-auto", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId, message: finalContent }),
        signal: abortControllerRef.current.signal,
      });

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
          copy[copy.length - 1] = { role: "ASSISTANT", content: assistantText };
          return copy;
        });
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
      }

      if (!roomId) {
        const roomsRes = await fetch("http://localhost:33333/conversation/rooms", { credentials: "include" });
        const rooms = await roomsRes.json();
        const newest = rooms[0];
        if (newest?.room_id) onRoomCreated(newest.room_id);
      }
    } catch (error: unknown) {
      if (!(error instanceof Error && error.name === "AbortError")) console.error(error);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  // 관계 고민 카테고리 데이터
  const categories = [
    {
      id: "communication",
      title: "대화의 온도",
      desc: "상대방과 자꾸 말이 어긋날 때",
      icon: <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />,
      text: "요즘 파트너와 대화를 하면 자꾸 오해가 생기고 어긋나는 것 같아 답답해요. 어떻게 대화를 풀어가면 좋을까요?"
    },
    {
      id: "distance",
      title: "관계의 거리",
      desc: "가까움과 서운함 사이 고민",
      icon: <ArrowsRightLeftIcon className="w-5 h-5" />,
      text: "관계에서 적절한 거리를 유지하는 게 참 어려워요. 너무 가깝거나 멀게 느껴질 때 제 마음을 어떻게 정리해야 할까요?"
    },
    {
      id: "breakup",
      title: "이별과 정리",
      desc: "정리 이후 몰려오는 생각들",
      icon: <HeartIcon className="w-5 h-5" />,
      text: "관계가 끝난 뒤에 남은 복잡한 감정들을 정리하고 싶어요. 제 마음을 가만히 들여다볼 수 있게 도와주세요."
    },
    {
      id: "myself",
      title: "나의 마음",
      desc: "관계 속 잃어버린 나 찾기",
      icon: <FaceSmileIcon className="w-5 h-5" />,
      text: "관계에 집중하다 보니 제 자신의 마음을 돌보지 못한 것 같아요. 지금 제 감정을 찬찬히 정리해보고 싶어요."
    }
  ];

  return (
    <div className="flex flex-col flex-1 h-full bg-white relative">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
          <h2 className="font-bold text-gray-800 tracking-tight">마음 정리 동반자</h2>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-0">
        <div className="max-w-3xl mx-auto py-8 space-y-6">
          {messages.length === 0 ? (
            /* ✨ 관계 상담 전용 웰컴 화면 */
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-700">
              <div className="w-20 h-20 bg-pink-50 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                <SparklesIcon className="w-12 h-12 text-pink-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                어떤 마음을 <br/>정리하고 싶으신가요?
              </h1>
              <p className="text-gray-500 mb-12 max-w-sm text-sm leading-relaxed px-6">
                진단이나 분석보다는, 당신이 안전하게 속마음을 <br/>꺼내고 정리할 수 있도록 곁에 머무를게요.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-6">
                {categories.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => handleSendMessage(item.text)} // 즉시 전송
                    className="group p-5 text-left border border-gray-100 bg-white rounded-2xl hover:bg-pink-50 hover:border-pink-200 transition-all shadow-sm hover:shadow-md text-gray-900"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-pink-400 group-hover:scale-110 transition-transform">{item.icon}</div>
                      <div className="font-bold group-hover:text-pink-600 transition-colors">{item.title}</div>
                    </div>
                    <div className="text-xs text-gray-500 leading-normal">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => <ChatMessage key={idx} role={msg.role} content={msg.content} />)
          )}
          <div ref={bottomRef} className="h-24" />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4 md:p-6">
        <div className="max-w-3xl mx-auto relative group">
          <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:bg-white focus-within:border-pink-300 focus-within:ring-4 focus-within:ring-pink-50 transition-all">
            <textarea
              ref={inputRef}
              rows={1}
              className="flex-1 max-h-48 p-2 text-base text-gray-900 bg-transparent outline-none resize-none placeholder:text-gray-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isComposing) {
                  e.preventDefault();
                  void handleSendMessage();
                }
              }}
              placeholder="무엇이든 물어보세요"
            />
            
            {loading ? (
              <button onClick={stopGeneration} className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors">
                <StopIcon className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={() => void handleSendMessage()}
                disabled={!input.trim()}
                className="p-2.5 bg-pink-500 text-white rounded-xl hover:bg-pink-600 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-sm"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-3 text-center tracking-tight">
            이 대화는 오직 당신의 기록 페이지에서 다시 돌아보며 마음을 정리하는 용도로만 사용됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}