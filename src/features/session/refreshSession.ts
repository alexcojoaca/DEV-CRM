export function refreshSession() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("session-refresh"));
}

