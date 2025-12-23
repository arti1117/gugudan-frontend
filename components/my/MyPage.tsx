"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { startNewChat } from "@/lib/chatNav";

import { Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MessageCircle, User as UserIcon } from "lucide-react";

const STORAGE_KEY = "selectedRoomId";

type ConsultationSession = {
  id: string; // room_id
  date: string; // YYYY-MM-DD (created_at 기준)
  topic: string; // title or category
  status: "ACTIVE" | "LOCKED" | "ENDED" | "UNKNOWN";
  duration?: string;
};

const GENDER_OPTIONS = ["MALE", "FEMALE", "OTHER"] as const;
const MBTI_OPTIONS = [
  "ISTJ","ISFJ","INFJ","INTJ","ISTP","ISFP","INFP","INTP",
  "ESTP","ESFP","ENFP","ENTP","ESTJ","ESFJ","ENFJ","ENTJ",
] as const;

function getInitials(name?: string) {
  if (!name) return "ME";
  const trimmed = name.trim();
  return trimmed.length >= 2 ? trimmed.slice(0, 2) : trimmed;
}

function formatJoinDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}년 ${Number(mm)}월 ${Number(dd)}일`;
}

function toYYYYMMDD(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * 서버 응답 -> 화면용 모델로 변환
 * 네 API 응답 형태에 맞춰 여기만 조정하면 됨.
 */
function normalizeRoom(raw: any): ConsultationSession {
  const id = String(raw?.room_id ?? raw?.id ?? raw?.roomId ?? "");
  const createdAt = raw?.created_at ?? raw?.createdAt ?? raw?.created;
  const title = raw?.title ?? raw?.topic ?? raw?.category ?? "상담";

  const s = String(raw?.status ?? "").toUpperCase();

  let status: ConsultationSession["status"] = "UNKNOWN";
  if (s === "ACTIVE") status = "ACTIVE";
  else if (s === "LOCKED") status = "LOCKED";
  else if (s === "ENDED") status = "ENDED";

  return { id, date: toYYYYMMDD(createdAt), topic: title, status };
}

function renderStatusLabel(s: ConsultationSession["status"]) {
  if (s === "ACTIVE") return "진행중";
  if (s === "LOCKED") return "한도 초과"; // 또는 "이용 제한", "잠김"
  if (s === "ENDED") return "종료";
  return "알 수 없음";
}

export function MyPage() {
  const router = useRouter();
  const { user } = useAuth();

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:33333";

  const [activeTab, setActiveTab] = useState("go");
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);

  // 프로필 수정 상태
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editGender, setEditGender] = useState<string>("");
  const [editMbti, setEditMbti] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // 화면 표시용 프로필 값
  const [profileGender, setProfileGender] = useState<string>("");
  const [profileMbti, setProfileMbti] = useState<string>("");

  // 상담방 목록 상태
  const [rooms, setRooms] = useState<ConsultationSession[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  // user 로드/변경 시 초기화
  useEffect(() => {
    const g = (user as any)?.gender ?? "";
    const m = (user as any)?.mbti ?? "";
    setEditGender(g || "");
    setEditMbti(m || "");
    setProfileGender(g || "");
    setProfileMbti(m || "");
  }, [user]);

  const fetchRooms = useCallback(async () => {
    if (!user) return;

    setRoomsLoading(true);
    setRoomsError(null);

    try {
      const res = await fetch(`${API_BASE}/conversation/rooms`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `요청 실패: ${res.status}`);
      }

      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : data?.items ?? data?.rooms ?? [];

      const mapped = (list ?? [])
        .map(normalizeRoom)
        .filter((x: ConsultationSession) => x.id);

      setRooms(mapped);
    } catch (e: any) {
      setRoomsError(e?.message ?? "상담 이력을 불러오지 못했습니다.");
    } finally {
      setRoomsLoading(false);
    }
  }, [API_BASE, user]);

  useEffect(() => {
    if (!user) return;
    fetchRooms();
  }, [user, fetchRooms]);

  const deleteRoom = useCallback(
    async (roomId: string) => {
      if (!roomId) return;

      const ok = confirm("이 상담 기록을 삭제하시겠어요?\n삭제 후에는 다시 복구할 수 없어요.");
      if (!ok) return;

      setDeletingRoomId(roomId);

      try {
        const res = await fetch(`${API_BASE}/conversation/rooms/${roomId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `삭제 실패: ${res.status}`);
        }

        // ✅ 선택중이던 room이면 localStorage도 정리
        const selected = localStorage.getItem(STORAGE_KEY);
        if (selected === roomId) {
          localStorage.removeItem(STORAGE_KEY);
        }

        // ✅ 화면에서 제거 (굳이 재조회 안해도 됨)
        setRooms((prev) => prev.filter((r) => r.id !== roomId));

        alert("삭제되었습니다.");
      } catch (e: any) {
        alert(e?.message ?? "삭제 중 오류가 발생했습니다.");
      } finally {
        setDeletingRoomId(null);
      }
    },
    [API_BASE]
  );

  const totalCount = rooms.length;

  const nickname = user?.nickname ?? "사용자";
  const email = user?.email ?? "-";
  const gender = profileGender || "-";
  const mbti = profileMbti || "-";

  const createdAt = (user as any)?.created_at as string | undefined;
  const joinDateText = useMemo(() => formatJoinDate(createdAt), [createdAt]);

  function startEditProfile() {
    setEditGender(profileGender || "");
    setEditMbti(profileMbti || "");
    setIsEditingProfile(true);
  }

  function cancelEditProfile() {
    setEditGender(profileGender || "");
    setEditMbti(profileMbti || "");
    setIsEditingProfile(false);
  }

  async function saveProfile() {
    const currentGender = profileGender || "";
    const currentMbti = profileMbti || "";

    const nextGender = editGender || "";
    const nextMbti = editMbti || "";

    if (nextGender === currentGender && nextMbti === currentMbti) {
      setIsEditingProfile(false);
      return;
    }

    if (!nextGender && !nextMbti) {
      alert("성별 또는 MBTI 중 최소 1개는 선택해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/account/my/profile/mbti-gender/edit`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            gender: editGender || null,
            mbti: editMbti || null,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `요청 실패: ${res.status}`);
      }

      setProfileGender(nextGender);
      setProfileMbti(nextMbti);
      setIsEditingProfile(false);
      alert("저장되었습니다.");

      // (선택) 서버 값으로 재동기화
      const meRes = await fetch(`${API_BASE}/api/v1/account/my`, {
        method: "GET",
        credentials: "include",
      });
      if (meRes.ok) {
        const me = await meRes.json();
        setProfileGender(me?.gender ?? nextGender);
        setProfileMbti(me?.mbti ?? nextMbti);
      }
    } catch (e: any) {
      alert(e?.message ?? "저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    // ✅ Chat 화면 톤과 통일: 라이트 배경 고정
    <div className="min-h-[calc(100vh-64px)] bg-white text-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8 border border-gray-200 bg-white">
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="bg-gray-100 text-gray-700 text-2xl font-semibold">
                    {getInitials(nickname)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">{nickname}</h2>
                  <p className="text-gray-600 mb-4">{email}</p>

                  <div className="flex gap-10">
                    <div>
                      <p className="text-sm text-gray-500">가입일</p>
                      <p className="font-medium">{joinDateText}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">총 상담 횟수</p>
                      <p className="font-medium">{totalCount}회</p>
                    </div>
                  </div>
                </div>

                {/* ✅ 설정 버튼 제거 (요청사항) */}
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12 rounded-full bg-gray-100 p-1">
              <TabsTrigger
                value="go"
                className="flex items-center justify-center gap-2 rounded-full text-sm font-medium text-gray-600 transition
                  data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow"
              >
                <MessageCircle className="w-4 h-4" />
                상담 하러가기
              </TabsTrigger>

              <TabsTrigger
                value="history"
                className="flex items-center justify-center gap-2 rounded-full text-sm font-medium text-gray-600 transition
                  data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow"
              >
                <MessageCircle className="w-4 h-4" />
                상담 이력
              </TabsTrigger>

              <TabsTrigger
                value="profile"
                className="flex items-center justify-center gap-2 rounded-full text-sm font-medium text-gray-600 transition
                  data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow"
              >
                <UserIcon className="w-4 h-4" />
                프로필 정보
              </TabsTrigger>
            </TabsList>

            {/* 상담 하러가기 */}
            <TabsContent value="go" className="mt-6">
              <Card className="border border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle>상담 하러가기</CardTitle>
                  <CardDescription>
                    원하는 주제로 AI 상담을 시작해보세요.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="mb-4 text-4xl">💬</div>
                    <p className="text-gray-600 mb-6">
                      지금 바로 상담을 시작할 수 있어요.
                    </p>

                    <Button className="px-8" onClick={() => startNewChat(router, "/chat")}>
                      상담 시작하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 상담 이력 */}
            <TabsContent value="history" className="mt-6">
              <Card className="border border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle>상담 이력</CardTitle>
                  <CardDescription>
                    지금까지 진행한 AI 상담 기록입니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {roomsLoading ? (
                    <div className="py-10 text-center text-gray-600">
                      불러오는 중...
                    </div>
                  ) : roomsError ? (
                    <div className="py-10 text-center">
                      <p className="text-sm text-red-600 mb-3">{roomsError}</p>
                      <Button variant="outline" onClick={fetchRooms}>
                        다시 시도
                      </Button>
                    </div>
                  ) : rooms.length === 0 ? (
                    <div className="py-10 text-center text-gray-600">
                      아직 상담 이력이 없어요.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rooms.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center">
                              <MessageCircle className="w-6 h-6 text-pink-600" />
                            </div>

                            <div>
                              <h4 className="font-semibold mb-1">
                                {session.topic}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {session.date}
                                {session.duration ? ` · ${session.duration}` : ""}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Badge 
                              variant="secondary"
                              className={
                                session.status === "LOCKED"
                                  ? "bg-amber-100 text-amber-800"
                                  : session.status === "ENDED"
                                  ? "bg-gray-100 text-gray-700"
                                  : "bg-green-100 text-green-800"
                              }
                            >
                              {renderStatusLabel(session.status)}
                            </Badge>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                localStorage.setItem(STORAGE_KEY, session.id);
                                router.push("/chat");
                              }}
                            >
                              상세보기
                            </Button>
                            <Button variant="outline" size="sm"
                              onClick={(e) => { e.stopPropagation(); deleteRoom(session.id); }}
                              disabled={deletingRoomId === session.id}
                            >
                              {deletingRoomId === session.id ? "삭제 중..." : "삭제"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 프로필 정보 */}
            <TabsContent value="profile" className="mt-6">
              <Card className="border border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle>프로필 정보</CardTitle>
                  <CardDescription>
                    개인 정보를 관리하고 업데이트할 수 있습니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        이름
                      </label>
                      <p className="p-3 rounded-md bg-gray-50 text-gray-900 border border-gray-200">
                        {nickname}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        이메일
                      </label>
                      <p className="p-3 rounded-md bg-gray-50 text-gray-900 border border-gray-200">
                        {email}
                      </p>
                    </div>

                    {/* 성별 */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        성별
                      </label>

                      {!isEditingProfile ? (
                        <div className="flex items-center justify-between gap-3 p-3 rounded-md bg-gray-50 border border-gray-200">
                          <span>{gender}</span>
                          <Button variant="ghost" size="sm" onClick={startEditProfile}>
                            수정
                          </Button>
                        </div>
                      ) : (
                        <select
                          className="w-full p-3 border border-gray-200 rounded-md bg-white text-gray-900"
                          value={editGender}
                          onChange={(e) => setEditGender(e.target.value)}
                          disabled={isSaving}
                        >
                          <option value="">선택 안함</option>
                          {GENDER_OPTIONS.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* MBTI */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        MBTI
                      </label>

                      {!isEditingProfile ? (
                        <div className="flex items-center justify-between gap-3 p-3 rounded-md bg-gray-50 border border-gray-200">
                          <span>{mbti}</span>
                          <Button variant="ghost" size="sm" onClick={startEditProfile}>
                            수정
                          </Button>
                        </div>
                      ) : (
                        <select
                          className="w-full p-3 border border-gray-200 rounded-md bg-white text-gray-900"
                          value={editMbti}
                          onChange={(e) => setEditMbti(e.target.value)}
                          disabled={isSaving}
                        >
                          <option value="">선택 안함</option>
                          {MBTI_OPTIONS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* 저장/취소 */}
                    {!isEditingProfile ? (
                      <div className="pt-2">
                        <Button variant="outline" onClick={startEditProfile}>
                          성별/MBTI 수정하기
                        </Button>
                      </div>
                    ) : (
                      <div className="pt-2 flex gap-3">
                        <Button onClick={saveProfile} disabled={isSaving}>
                          {isSaving ? "저장 중..." : "저장"}
                        </Button>
                        <Button variant="outline" onClick={cancelEditProfile} disabled={isSaving}>
                          취소
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
