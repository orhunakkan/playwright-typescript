export interface ApiResponse<T = undefined> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
}

export interface LoginData {
  id: string;
  name: string;
  email: string;
  token: string;
}

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
}

export interface NoteData {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}
