export type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
};

export type UserRegion = {
  id: number;
  user_id: string;
  city: string;
  created_at?: string;
};
