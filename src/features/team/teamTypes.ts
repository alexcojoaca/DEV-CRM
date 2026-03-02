export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatarDataUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
