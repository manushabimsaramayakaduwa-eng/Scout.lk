export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'leader' | 'scout';
  email?: string;
  whatsapp?: string;
  nic?: string;
  parentPhone?: string;
  approved?: boolean;
  loginCount?: number;
  lastLogin?: string;
}

export type ScoutPosition = 
  | 'Member'
  | 'Patrol Leader'
  | 'Asst. Patrol Leader'
  | 'Asst. Troop Leader'
  | 'Troop Quatermaster'
  | 'Troop Treasure'
  | 'Senior';

export interface ScoutMember {
  id: string;
  firstName: string;
  lastName: string;
  scoutPhoto?: string; // base64 or URL
  dob: string;
  dateJoined?: string;
  membershipNo: string;
  patrol: string;
  nic?: string;
  position: ScoutPosition;
  address: string;
  parentName: string;
  relationship: string;
  parentPhone: string;
  whatsapp: string;
  email: string;
  badgesEarned: string[]; // List of badge IDs
  awardsEarned: string[]; // List of award IDs
  loginCount?: number;
  lastLogin?: string;
}

export interface Badge {
  id: string;
  name: string;
  category: string;
  description: string;
  photoUrl?: string; // base64 or URL
}

export interface Award {
  id: string;
  name: string;
  description: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  description: string;
  type: 'Meeting' | 'Camp' | 'Service' | 'Ceremony' | 'Training';
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
  date: string;
  type?: 'image' | 'video';
}

export interface PhotoAlbum {
  id: string;
  name: string;
  description: string;
  photos: Photo[];
}

export interface LibraryDoc {
  id: string;
  title: string;
  category: string;
  fileSize: string;
  downloadUrl: string;
  addedBy: string;
  addedAt: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: 'admin' | 'leader' | 'scout';
  text: string;
  timestamp: string; // ISO string
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  presentIds: string[]; // Scout IDs
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user: string;
  notifiedEmail: boolean;
  notifiedWhatsapp: boolean;
}

export interface StorageStatus {
  email: string;
  usedBytes: number;
  totalBytes: number;
  isFull: boolean;
  reportDigestEnabled?: boolean;
  reportDigestFrequency?: 'daily' | 'weekly';
}

export interface MemberReport {
  id: string;
  type: 'Wrong Personal Details' | 'App Bug / Technical Issue' | 'E-Library Feedback' | 'Other Issue';
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  reporterName: string;
  reporterId: string;
  reporterRole: 'admin' | 'leader' | 'scout';
  timestamp: string;
  status: 'Pending' | 'Resolved';
  resolutionDetails?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

