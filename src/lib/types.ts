export type UserRole = 'student' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash?: string;
  role: UserRole;
  department: string;
  created_at: string;
}

export type EventCategory = 'Technical' | 'Cultural' | 'Sports' | 'Workshop' | 'Seminar';
export type EventStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';

export interface CampusEvent {
  id: number;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  time: string;
  venue: string;
  capacity: number;
  registered_count: number;
  banner_url: string;
  organizer: string;
  price: number;
  status: EventStatus;
  created_at: string;
}

export interface Registration {
  id: number;
  user_id: number;
  event_id: number;
  ticket_code: string;
  status: 'confirmed' | 'cancelled';
  registered_at: string;
  // Join fields
  event_title?: string;
  event_category?: string;
  event_date?: string;
  event_time?: string;
  event_venue?: string;
  user_name?: string;
  user_email?: string;
  user_department?: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  keywords: string;
}

export interface AuthSession {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  department: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
