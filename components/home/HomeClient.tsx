"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { startNewChat } from "@/lib/chatNav";

type ConsultationTopic = "marriage" | "dating" | "crush" | null;

export default function HomeClient() {
  const router = useRouter();

  const { isAuthenticated, isLoading } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState<ConsultationTopic>(null);

  const topics = useMemo(
    () => [
      {
        id: "marriage" as const,
        title: "결혼",
        subtitle: "부부 관계의 고민",
        description:
          "결혼 생활의 어려움, 배우자와의 갈등, 소통 문제 등을 함께 이야기해요",
        image:
          "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1600&q=80",
        overlay: "from-rose-400 to-pink-500",
      },
      {
        id: "dating" as const,
        title: "연애",
        subtitle: "연인과의 관계",
        description:
          "연인과의 갈등, 소통 방법, 관계 발전에 대해 편하게 상담해요",
        image:
          "https://images.unsplash.com/photo-1513279922550-250c2129b13a?auto=format&fit=crop&w=1600&q=80",
        overlay: "from-purple-400 to-indigo-500",
      },
      {
        id: "crush" as const,
        title: "썸",
        subtitle: "마음이 설레는 관계",
        description:
          "관심있는 사람과의 관계, 고백 타이밍, 상대방의 마음 등을 고민해요",
        image:
          "https://images.unsplash.com/photo-1506014299253-3725319c0f69?auto=format&fit=crop&w=1600&q=80",
        overlay: "from-amber-400 to-orange-500",
      },
    ],
    []
  );


const canStart = !isLoading && isAuthenticated;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
            💬 24시간 언제든지
          </span>

          <h2 className="mt-6 text-4xl md:text-6xl font-bold leading-tight break-keep bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            어떤 이야기를
            <br className="hidden md:block" />
            나누고 싶으세요?
          </h2>

          <p className="mt-6 text-lg text-gray-600 break-keep">
            혼자 고민하지 마세요. AI 상담사가 당신의 이야기를 경청하고
            <br className="hidden md:block" />
            따뜻한 조언을 드릴게요 💕
          </p>
        </div>

        {/* Topic cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {topics.map((t) => {
            const active = selectedTopic === t.id;

            return (
              <div
                key={t.id}
                // (요구사항 반영) "클릭 선택" 없애고, hover 줌업만 하고 싶으면:
                // onClick 제거 + button 대신 div 사용
                className={`overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
              >
                <div className="relative h-48">
                  <Image
                    src={t.image}
                    alt={t.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${t.overlay} opacity-60`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{t.title}</div>
                      <div className="text-sm opacity-90">{t.subtitle}</div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-sm text-gray-600 text-center break-keep">
                    {t.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
<div className="mt-6 mx-auto max-w-xl rounded-xl bg-white/60 px-5 py-3 shadow-sm">
  <div className="flex items-center justify-center gap-2 text-center">
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-sm">
      ✨
    </div>

    <p className="text-sm text-gray-600 leading-relaxed">
      로그인 후 <span className="font-medium text-gray-800">My Page</span>에서
      <span className="font-medium text-gray-800"> 성별 · MBTI</span>를 입력하면  
      AI가 더 <span className="font-medium text-gray-800">맞춤형</span>으로 상담해줘요.
    </p>
  </div>
</div>





        {/* CTA */}
        <div className="text-center mt-10">
          {isAuthenticated ? (
            <Button
              disabled={!canStart}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-12 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              onClick={() => startNewChat(router, "/chat")}
            >
              상담 시작하기 →
            </Button>
          ) : (
            <div className="h-[76px]" />
          )}
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              🔒
            </div>
            <h3 className="text-gray-900 font-semibold mb-2">완벽한 비밀 보장</h3>
            <p className="text-sm text-gray-600">
              대화 내용은 암호화되어 안전하게 보호돼요
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              💬
            </div>
            <h3 className="text-gray-900 font-semibold mb-2">즉각적인 응답</h3>
            <p className="text-sm text-gray-600">
              기다릴 필요 없이 바로 대화를 시작해요
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              💜
            </div>
            <h3 className="text-gray-900 font-semibold mb-2">따뜻한 공감</h3>
            <p className="text-sm text-gray-600">
              판단하지 않고 당신의 이야기를 경청해요
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
