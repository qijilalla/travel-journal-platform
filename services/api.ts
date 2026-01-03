import { JournalEntry, User, Comment } from '../types';

// Azure Function App URL - 部署后替换为你的真实 URL
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  'https://journal-api-136-brfqayekezakf0cm.germanywestcentral-01.azurewebsites.net/api';

// --- 本地用户管理 (简化版，实际可用 Azure AD B2C) ---
let currentUser: User | null = null;

export const login = async (username: string): Promise<User> => {
  const isAdmin = username.toLowerCase() === 'admin';
  const user: User = {
    id: isAdmin ? 'admin' : 'u' + Date.now(),
    username,
    isAdmin
  };
  currentUser = user;
  localStorage.setItem('user', JSON.stringify(user));
  return user;
};

export const register = async (username: string): Promise<User> => {
  return login(username);
};

export const getCurrentUser = (): User | null => {
  if (currentUser) return currentUser;
  const stored = localStorage.getItem('user');
  if (stored) {
    currentUser = JSON.parse(stored);
    return currentUser;
  }
  return null;
};

// --- Azure Cosmos DB 数据服务 ---

export const getJournals = async (): Promise<JournalEntry[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/journals`);
    if (!response.ok) throw new Error('Failed to fetch journals');
    return await response.json();
  } catch (error) {
    console.error('Error fetching journals:', error);
    return [];
  }
};

export const createJournal = async (entry: Omit<JournalEntry, 'id' | 'likes' | 'comments'>): Promise<JournalEntry> => {
  const response = await fetch(`${API_BASE_URL}/journals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  if (!response.ok) throw new Error('Failed to create journal');
  return await response.json();
};

export const updateJournal = async (entry: JournalEntry): Promise<JournalEntry> => {
  const response = await fetch(`${API_BASE_URL}/journals/${entry.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  if (!response.ok) throw new Error('Failed to update journal');
  return await response.json();
};

export const deleteJournal = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/journals/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete journal');
};

// --- Azure Blob Storage 图片上传 ---

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || 'Failed to upload image');
  }
  const data = await response.json();
  return data.url;
};

// --- 社交功能 (存储在 Cosmos DB) ---

export const toggleLike = async (journalId: string, userId: string): Promise<string[]> => {
  const response = await fetch(`${API_BASE_URL}/journals/${journalId}`);
  const journal = await response.json();
  
  const likes = journal.likes || [];
  const index = likes.indexOf(userId);
  if (index > -1) {
    likes.splice(index, 1);
  } else {
    likes.push(userId);
  }
  
  await fetch(`${API_BASE_URL}/journals/${journalId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...journal, likes })
  });
  
  return likes;
};

export const addComment = async (journalId: string, comment: Omit<Comment, 'id' | 'date'>): Promise<Comment> => {
  const response = await fetch(`${API_BASE_URL}/journals/${journalId}`);
  const journal = await response.json();
  
  const newComment: Comment = {
    ...comment,
    id: 'c' + Date.now(),
    date: new Date().toISOString().split('T')[0]
  };
  
  const comments = [...(journal.comments || []), newComment];
  
  await fetch(`${API_BASE_URL}/journals/${journalId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...journal, comments })
  });
  
  return newComment;
};

export const deleteComment = async (journalId: string, commentId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/journals/${journalId}`);
  const journal = await response.json();
  
  const comments = (journal.comments || []).filter((c: Comment) => c.id !== commentId);
  
  await fetch(`${API_BASE_URL}/journals/${journalId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...journal, comments })
  });
};
