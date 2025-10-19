export interface IUser {
    id?: number;
    email: string;
    first_name: string;
    last_name: string;
    roleName: string;
    profile_picture?: string; //This will now store the full Cloudinary URL
    referral_code: string;
    user_points: number;
    discount_coupons?: { 
        name: string; 
        description: string; 
        discount_percentage: number }[];
    PointTransactions: Array<{
        id: number;
        amount: number;
        expiry_date: string;
        CreatedAt: string;
        is_expired: boolean;
    }>;
    token: string;
}
