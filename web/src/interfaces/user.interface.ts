export interface IUser {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  roleName: string; // This should be "User" or "Event Organizer"
  profile_picture?: string;
  referral_code: string;
  user_points: number;
  discount_coupons?: {
    name: string;
    description: string;
    discount_percentage: number;
  }[];
  PointTransactions: Array<{
    id: number;
    amount: number;
    expiry_date: string;
    CreatedAt: string;
    is_expired: boolean;
  }>;
  token: string;
  // Add any additional fields from your Prisma schema
  is_verified?: boolean;
  roleId?: number;
}

// Add interface for the transformed user used by new components
export interface TransformedUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ORGANIZER" | "CUSTOMER";
  pointsBalance: number;
  organizer: {
    displayName: string;
    bio: string | null;
    ratingsAvg: number;
  } | null;
}
