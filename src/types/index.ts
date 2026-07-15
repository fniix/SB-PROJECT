// ═══════════════════════════════════════════════════════════════════════
// SB Project — Supabase Database Types (Special Needs Platform)
// These types represent the database schema used across the application.
// ═══════════════════════════════════════════════════════════════════════

// ── Auth / Profiles ──────────────────────────────────────────────────

export type UserRole = 'parent' | 'beneficiary' | 'specialist' | 'admin'

export interface UserProfile {
  id: string
  role: UserRole
  full_name: string
  email: string
  avatar_url?: string
  phone?: string
  created_at: string
  updated_at?: string
}

export interface ParentProfile {
  id: string
  user_id: string
  created_at: string
}

// ── Beneficiaries (Persons with Special Needs) ───────────────────────

export interface Beneficiary {
  id: string
  parent_id: string
  full_name: string
  date_of_birth?: string
  gender?: string
  conditions?: string[] // e.g., 'Autism', 'ADHD', 'Down Syndrome'
  communication_level?: string // e.g., 'Verbal', 'Non-verbal', 'AAC'
  literacy_level?: string // e.g., 'Can read and write', 'Pre-literate'
  independence_level?: string
  support_needed?: string[] // e.g., 'Academic', 'Behavioral', 'Speech', 'Occupational'
  preferred_language?: string
  learning_style?: string
  notes?: string
  avatar_url?: string
  created_at: string
  updated_at?: string
}

// ── Specialists (Service Providers) ──────────────────────────────────

export interface SpecialistProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  phone?: string
  bio?: string
  specialties: string[] // e.g., 'Speech Therapist', 'Behavioral Analyst', 'Special Ed Teacher'
  conditions_handled: string[] // e.g., 'Autism', 'ADHD'
  age_groups: string[] // e.g., 'Early Childhood', 'School Age', 'Adults'
  languages: string[]
  session_types: string[] // e.g., 'online', 'in_person_home', 'in_person_center'
  price_per_hour: number
  rating?: number
  total_sessions?: number
  total_reviews?: number
  verified: boolean
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  avatar_url?: string
  created_at: string
  updated_at?: string
}

export interface SpecialistApplication {
  id: string
  user_id: string
  full_name: string
  email: string
  phone?: string
  bio?: string
  specialties: string[]
  conditions_handled: string[]
  age_groups: string[]
  languages: string[]
  session_types: string[]
  price_per_hour: number
  cv_url?: string
  certificate_urls?: string[]
  license_number?: string // E.g., Saudi Commission for Health Specialties
  available_days: string[]
  available_time: string
  bank_name?: string
  iban?: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes?: string
  reviewed_at?: string
  reviewed_by?: string
  created_at: string
}

// ── Bookings / Sessions ──────────────────────────────────────────────

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled' | 'no_show'
export type SessionType = 'online' | 'in_person_home' | 'in_person_center'

export interface Booking {
  id: string
  parent_id: string
  beneficiary_id: string
  specialist_id: string
  service_type: string // e.g., 'Speech Therapy', 'Academic Support'
  date: string
  time: string
  duration_minutes: number
  session_type: SessionType
  status: BookingStatus
  goal?: string
  notes?: string
  meeting_link?: string // For online sessions
  address?: string // For in-person sessions
  price: number
  platform_fee?: number
  paid: boolean
  payment_method?: string
  cancelled_by?: string
  cancel_reason?: string
  created_at: string
  updated_at?: string
  // Joined fields
  beneficiary?: Pick<Beneficiary, 'full_name'>
  specialist_profile?: Pick<SpecialistProfile, 'full_name' | 'avatar_url'>
}

// ── IEP & Session Reports ────────────────────────────────────────────

// Individualized Education/Therapy Plan (IEP)
export interface IndividualPlan {
  id: string
  beneficiary_id: string
  specialist_id: string
  parent_id: string
  long_term_goals: string[]
  short_term_goals: string[]
  current_level: string
  review_date: string
  status: 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
}

export interface SessionReport {
  id: string
  booking_id: string
  specialist_id: string
  beneficiary_id: string
  parent_id: string
  topics_covered: string
  goals_addressed: string[]
  performance_summary: string
  progress_score: number // 1-10 or percentage
  homework_assigned?: string
  next_session_plan?: string
  internal_notes?: string // Only for the specialist
  parent_summary: string
  attendance: 'present' | 'absent' | 'late'
  created_at: string
}

// ── Progress Reports ─────────────────────────────────────────────────

export interface ProgressReport {
  id: string
  beneficiary_id: string
  parent_id: string
  specialist_id: string
  skill_area: string // e.g., 'Communication', 'Motor Skills'
  score?: number
  notes?: string
  created_at: string
}

// ── Wallet / Payments ────────────────────────────────────────────────

export type TransactionType = 'top_up' | 'session_payment' | 'refund' | 'platform_fee' | 'specialist_payout'

export interface WalletTransaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  balance_after: number
  description: string
  booking_id?: string
  stripe_session_id?: string
  created_at: string
}

export interface Wallet {
  id: string
  user_id: string
  balance: number
  currency: string
  updated_at: string
}

// ── Support Tickets ──────────────────────────────────────────────────

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface SupportTicket {
  id: string
  user_id: string
  subject: string
  message: string
  category: string
  status: TicketStatus
  priority: TicketPriority
  admin_reply?: string
  resolved_at?: string
  created_at: string
}

// ── Notifications ────────────────────────────────────────────────────

export type NotificationType = 'booking' | 'report' | 'payment' | 'system' | 'reminder' | 'iep_update'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  action_url?: string
  created_at: string
}

// ── Reviews / Ratings ────────────────────────────────────────────────

export interface SpecialistReview {
  id: string
  booking_id: string
  specialist_id: string
  parent_id: string
  beneficiary_id: string
  rating: number // 1-5
  comment?: string
  professionalism_rating?: number // 1-5
  communication_rating?: number // 1-5
  effectiveness_rating?: number // 1-5
  created_at: string
}
