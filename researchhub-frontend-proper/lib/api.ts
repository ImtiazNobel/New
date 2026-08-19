// Thin fetch wrapper used by client components — this replaces every
// window.storage.get/set/list() call from the original artifact prototype.

async function request(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // profile
  me: () => request("/api/users/me"),
  updateMe: (data: Record<string, unknown>) =>
    request("/api/users/me", { method: "PATCH", body: JSON.stringify(data) }),
  getUser: (id: string) => request(`/api/users/${id}`),

  // directory
  searchSupervisors: (params: { q?: string; department?: string; area?: string; accepting?: boolean }) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.department) qs.set("department", params.department);
    if (params.area) qs.set("area", params.area);
    if (params.accepting) qs.set("accepting", "true");
    return request(`/api/supervisors?${qs.toString()}`);
  },

  // bookmarks
  getBookmarks: () => request("/api/bookmarks"),
  toggleBookmark: (supervisorId: string) =>
    request("/api/bookmarks", { method: "POST", body: JSON.stringify({ supervisorId }) }),

  // messaging
  getConversations: () => request("/api/conversations"),
  getThread: (contactId: string) => request(`/api/messages/${contactId}`),
  sendMessage: (contactId: string, text: string) =>
    request(`/api/messages/${contactId}`, { method: "POST", body: JSON.stringify({ text }) }),

  // reviews
  getReviews: (supervisorId: string) => request(`/api/reviews/${supervisorId}`),
  submitReview: (supervisorId: string, rating: number, text: string) =>
    request(`/api/reviews/${supervisorId}`, { method: "POST", body: JSON.stringify({ rating, text }) }),

  // recommendations
  getRecommendations: (type: "received" | "sent") => request(`/api/recommendations?type=${type}`),
  sendRecommendation: (studentId: string, toId: string, note: string) =>
    request("/api/recommendations", { method: "POST", body: JSON.stringify({ studentId, toId, note }) }),
  getRecommendationUnread: () => request("/api/reads/recommendations"),
  markRecommendationsRead: () => request("/api/reads/recommendations", { method: "POST" }),

  // signup (credentials)
  signup: (name: string, email: string, password: string) =>
    request("/api/auth/signup", { method: "POST", body: JSON.stringify({ name, email, password }) }),
};
