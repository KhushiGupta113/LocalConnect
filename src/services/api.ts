import { Platform } from 'react-native';
import type { SessionUser, LoginValues, RegistrationValues } from '../types/user';
import type { FeedPost, FeedCategory, FeedSort } from '../types/post';
import type { Comment, AppNotification } from '../types/community';
import type { DiscoverEvent, DiscoverGroup, DiscoverTopic } from './discover';
import { images } from '../constants/images';

// For Android emulator, localhost is 10.0.2.2; for iOS/Web it is localhost
const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
let API_BASE_URL = `http://${DEFAULT_HOST}:5000/api/v1`;

let authToken: string | null = null;

export function setApiBaseUrl(url: string) {
  API_BASE_URL = url;
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; errors?: any }> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const message = json?.message || `Request failed with status ${response.status}`;
      return { success: false, message, errors: json?.errors };
    }

    return json;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { success: false, message: 'Request timed out. Please check your connection.' };
    }
    return { success: false, message: error.message || 'Network request failed' };
  }
}

// ----------------- Auth API -----------------

export async function apiRegister(values: RegistrationValues): Promise<
  { success: true; user: SessionUser; token: string } | { success: false; message: string }
> {
  const res = await request<{ user: SessionUser; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(values),
  });

  if (res.success && res.data) {
    setAuthToken(res.data.token);
    return { success: true, user: res.data.user, token: res.data.token };
  }
  return { success: false, message: res.message || 'Registration failed' };
}

export async function apiLogin(values: LoginValues): Promise<
  { success: true; user: SessionUser; token: string } | { success: false; message: string }
> {
  const res = await request<{ user: SessionUser; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(values),
  });

  if (res.success && res.data) {
    setAuthToken(res.data.token);
    return { success: true, user: res.data.user, token: res.data.token };
  }
  return { success: false, message: res.message || 'Login failed' };
}

export async function apiGetMe(): Promise<SessionUser | null> {
  const res = await request<{ user: SessionUser }>('/auth/me');
  if (res.success && res.data) {
    return res.data.user;
  }
  return null;
}

export async function apiUpdateProfile(patch: Partial<SessionUser>): Promise<
  { success: true; user: SessionUser } | { success: false; message: string }
> {
  const res = await request<{ user: SessionUser }>('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });

  if (res.success && res.data) {
    return { success: true, user: res.data.user };
  }
  return { success: false, message: res.message || 'Failed to update profile' };
}

export async function apiToggleFollow(delta: 1 | -1): Promise<number | null> {
  const res = await request<{ followingCount: number }>('/users/follow', {
    method: 'POST',
    body: JSON.stringify({ delta }),
  });
  return res.success && res.data ? res.data.followingCount : null;
}

// ----------------- Posts API -----------------

export async function apiGetFeed(params?: {
  category?: FeedCategory;
  search?: string;
  location?: string;
  sort?: FeedSort;
}): Promise<FeedPost[] | null> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'all') query.append('category', params.category);
  if (params?.search) query.append('search', params.search);
  if (params?.location) query.append('location', params.location);
  if (params?.sort) query.append('sort', params.sort);

  const qs = query.toString();
  const res = await request<FeedPost[]>(`/posts${qs ? `?${qs}` : ''}`);
  if (res.success && res.data) {
    return res.data;
  }
  return null;
}

export async function apiCreatePost(input: {
  body: string;
  category: string;
  location: string;
  photos: string[];
  urgent: boolean;
  poll?: string;
}): Promise<{ success: true; post: FeedPost } | { success: false; message: string }> {
  const res = await request<FeedPost>('/posts', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (res.success && res.data) {
    return { success: true, post: res.data };
  }
  return { success: false, message: res.message || 'Failed to publish post' };
}

export async function apiTogglePostLike(postId: string): Promise<
  { appreciated: boolean; appreciation: number } | null
> {
  const res = await request<{ appreciated: boolean; appreciation: number }>(`/posts/${postId}/like`, {
    method: 'POST',
  });
  return res.success && res.data ? res.data : null;
}

export async function apiTogglePostBookmark(postId: string): Promise<boolean | null> {
  const res = await request<{ saved: boolean }>(`/posts/${postId}/bookmark`, {
    method: 'POST',
  });
  return res.success && res.data ? res.data.saved : null;
}

export async function apiGetSavedPosts(): Promise<FeedPost[] | null> {
  const res = await request<FeedPost[]>('/posts/saved');
  return res.success && res.data ? res.data : null;
}

export async function apiGetMyPosts(): Promise<FeedPost[] | null> {
  const res = await request<FeedPost[]>('/posts/mine');
  return res.success && res.data ? res.data : null;
}

// ----------------- Comments API -----------------

export async function apiGetComments(postId: string): Promise<Comment[] | null> {
  const res = await request<Comment[]>(`/comments/post/${postId}`);
  return res.success && res.data ? res.data : null;
}

export async function apiAddComment(
  postId: string,
  body: string,
  parentId?: string
): Promise<{ success: true; comment: Comment } | { success: false; message: string }> {
  const res = await request<Comment>(`/comments/post/${postId}`, {
    method: 'POST',
    body: JSON.stringify({ body, parentId }),
  });

  if (res.success && res.data) {
    return { success: true, comment: res.data };
  }
  return { success: false, message: res.message || 'Failed to add comment' };
}

export async function apiToggleCommentLike(commentId: string): Promise<
  { liked: boolean; likes: number } | null
> {
  const res = await request<{ liked: boolean; likes: number }>(`/comments/${commentId}/like`, {
    method: 'POST',
  });
  return res.success && res.data ? res.data : null;
}

// ----------------- Discover API -----------------

export async function apiGetEvents(params?: {
  radius?: number;
  hub?: string;
  search?: string;
}): Promise<DiscoverEvent[] | null> {
  const query = new URLSearchParams();
  if (params?.radius) query.append('radius', String(params.radius));
  if (params?.hub) query.append('hub', params.hub);
  if (params?.search) query.append('search', params.search);

  const qs = query.toString();
  const res = await request<DiscoverEvent[]>(`/discover/events${qs ? `?${qs}` : ''}`);
  return res.success && res.data ? res.data : null;
}

export async function apiToggleEventRSVP(eventId: string): Promise<
  { attending: boolean; going: number } | null
> {
  const res = await request<{ attending: boolean; going: number }>(`/discover/events/${eventId}/rsvp`, {
    method: 'POST',
  });
  return res.success && res.data ? res.data : null;
}

export async function apiGetMyRSVPs(): Promise<string[] | null> {
  const res = await request<string[]>('/discover/events/rsvps/mine');
  return res.success && res.data ? res.data : null;
}

export async function apiGetGroups(params?: {
  radius?: number;
  hub?: string;
  search?: string;
}): Promise<DiscoverGroup[] | null> {
  const query = new URLSearchParams();
  if (params?.radius) query.append('radius', String(params.radius));
  if (params?.hub) query.append('hub', params.hub);
  if (params?.search) query.append('search', params.search);

  const qs = query.toString();
  const res = await request<DiscoverGroup[]>(`/discover/groups${qs ? `?${qs}` : ''}`);
  return res.success && res.data ? res.data : null;
}

export async function apiToggleGroup(groupId: string): Promise<
  { joined: boolean; members: number } | null
> {
  const res = await request<{ joined: boolean; members: number }>(`/discover/groups/${groupId}/join`, {
    method: 'POST',
  });
  return res.success && res.data ? res.data : null;
}

export async function apiGetMyGroups(): Promise<string[] | null> {
  const res = await request<string[]>('/discover/groups/joined/mine');
  return res.success && res.data ? res.data : null;
}

export async function apiGetTopics(): Promise<DiscoverTopic[] | null> {
  const res = await request<DiscoverTopic[]>('/discover/topics');
  return res.success && res.data ? res.data : null;
}

// ----------------- Notifications API -----------------

export async function apiGetNotifications(): Promise<
  { notifications: AppNotification[]; unreadCount: number } | null
> {
  const res = await request<{ notifications: AppNotification[]; unreadCount: number }>('/notifications');
  return res.success && res.data ? res.data : null;
}

export async function apiMarkNotificationRead(id: string): Promise<boolean> {
  const res = await request(`/notifications/${id}/read`, { method: 'PATCH' });
  return res.success;
}

export async function apiMarkAllNotificationsRead(): Promise<boolean> {
  const res = await request('/notifications/read-all', { method: 'PATCH' });
  return res.success;
}

// ----------------- Image Upload API -----------------

export async function apiUploadImage(fileUri: string): Promise<string | null> {
  try {
    const filename = fileUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    const formData = new FormData();
    formData.append('image', {
      uri: fileUri,
      name: filename,
      type,
    } as any);

    const res = await request<{ url: string }>('/upload/image', {
      method: 'POST',
      body: formData,
    });

    if (res.success && res.data) {
      return res.data.url;
    }
    return null;
  } catch (error) {
    console.warn('Image upload error:', error);
    return null;
  }
}

