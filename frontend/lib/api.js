const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  let payload = {};

  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Request failed.");
  }

  return payload.data;
}

export function getCurrentUser() {
  return request("/auth/me");
}

export function login(credentials) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials)
  });
}

export function signup(payload) {
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function logout() {
  return request("/auth/logout", {
    method: "POST"
  });
}

export function getFeed({ limit = 10, offset = 0 } = {}) {
  return request(`/feed?limit=${limit}&offset=${offset}`);
}

export function createTweet(payload) {
  return request("/tweets", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getTweet(tweetId) {
  return request(`/tweets/${tweetId}`);
}

export function deleteTweet(tweetId) {
  return request(`/tweets/${tweetId}`, {
    method: "DELETE"
  });
}

export function likeTweet(tweetId) {
  return request(`/tweets/${tweetId}/like`, {
    method: "POST"
  });
}

export function unlikeTweet(tweetId) {
  return request(`/tweets/${tweetId}/like`, {
    method: "DELETE"
  });
}

export function getTweetComments(tweetId) {
  return request(`/tweets/${tweetId}/comments`);
}

export function createComment(tweetId, payload) {
  return request(`/tweets/${tweetId}/comments`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getUserProfile(username) {
  return request(`/users/${username}`);
}

export function getUserTweets(username, { limit = 20, offset = 0 } = {}) {
  return request(`/users/${username}/tweets?limit=${limit}&offset=${offset}`);
}

export function followUser(username) {
  return request(`/users/${username}/follow`, {
    method: "POST"
  });
}

export function unfollowUser(username) {
  return request(`/users/${username}/follow`, {
    method: "DELETE"
  });
}

export function updateProfile(payload) {
  return request("/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}
