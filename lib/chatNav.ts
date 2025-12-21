"use client";

const STORAGE_KEY = "selectedRoomId";

export function startNewChat(router: { push: (url: string) => void }, url = "/chat") {
  localStorage.removeItem(STORAGE_KEY);
  router.push(url);
}

export function openChatRoom(router: { push: (url: string) => void }, roomId: string, url = "/chat") {
  localStorage.setItem(STORAGE_KEY, roomId);
  router.push(url);
}

export function clearChatSelection() {
  localStorage.removeItem(STORAGE_KEY);
}
