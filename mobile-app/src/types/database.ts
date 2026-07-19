/**
 * Supabase Database Types — BabyGrow schema
 */

export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';
export type Gender = 'male' | 'female';
export type StuntingRisk = 'normal' | 'at_risk' | 'stunted' | 'severe';

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  puskesmas: string | null;
  district: string | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChildRow {
  id: string;
  parent_id: string;
  name: string;
  gender: Gender;
  date_of_birth: string;
  birth_weight: number | null;
  birth_height: number | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MeasurementRow {
  id: string;
  child_id: string;
  height_cm: number;
  weight_kg: number | null;
  head_circumference_cm: number | null;
  z_score_hfa: number | null;
  z_score_wfa: number | null;
  z_score_wfh: number | null;
  stunting_risk: StuntingRisk | null;
  source: 'mqtt' | 'ble' | 'manual' | 'ai_vision';
  device_id: string | null;
  measured_at: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string; email: string; full_name: string };
        Update: Partial<ProfileRow>;
      };
      children: {
        Row: ChildRow;
        Insert: Omit<ChildRow, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<ChildRow>;
      };
      measurements: {
        Row: MeasurementRow;
        Insert: Omit<MeasurementRow, 'id' | 'created_at'> & { id?: string };
        Update: Partial<MeasurementRow>;
      };
    };
  };
}
