"use client";

import ChangePasswordForm from "../../components/profile/changepasswordform";
import { useEffect } from "react";
import ProfilePictureUpload from "@/components/profile/profilepictureupload";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hook";
import { fetchUser, logout } from "@/lib/redux/features/authSlice";
import { persistor } from "@/lib/redux/store";
import { IUser } from "@/interfaces/user.interface";

export default function Profile() {
    const dispatch = useAppDispatch();
    const { user, status } = useAppSelector((state) => ({
        ...state.auth,
        user: {
            ...state.auth.user,
            discount_coupons: Array.isArray(state.auth.user?.discount_coupons)
                ? state.auth.user.discount_coupons 
                : [],
            PointTransactions: Array.isArray(state.auth.user?.PointTransactions)
                ? state.auth.user.PointTransactions
                : [],
        } as IUser,
    }));

    useEffect(() => {
        const loadProfile = async () => {
            try {
                await dispatch(fetchUser());
                 // Force persist to storage
                await persistor.flush();
            } catch (err) {
                // Handle token expiration
                dispatch(logout());
                window.location.href = "/login";
            }
        };

        // Load profile when component mounts or user changes
         if (!user?.PointTransactions || status === 'idle') {
            loadProfile();
        }
    }, [dispatch, status, user?.PointTransactions]); // Add PointTransactions to dependencies

    if (!user) {
        return <div>Error loading profile</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <ProfilePictureUpload />
                </div>

                <div className="md:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {user?.first_name} {user?.last_name}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700"
                                    > Email
                                </label>
                                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700"
                                    > Role
                                </label>
                                <p className="mt-1 text-sm text-gray-900">{user?.roleName}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700"
                                    > Referral Code
                                </label>
                                    <p className="mt-1 text-sm text-gray-900 font-mono">
                                        {user?.referral_code || "N/A"}
                                    </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700"
                                    > User Points
                                </label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {user?.user_points?.toLocaleString() || "0"} points
                                </p>
                                <div className="mt-2 space-y-1">
                                     {user?.PointTransactions?.filter(t => !t.is_expired).map(transaction => (
                                        <div key={transaction.id} className="text-xs text-gray-500">
                                            {transaction.amount.toLocaleString()} points expiring{" "} 
                                            {new Date(transaction.expiry_date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700"
                                    > Active Discount
                                </label>
                                    {user?.discount_coupons && user.discount_coupons.length > 0 ? (
                                        <div className="mt-1 text-sm text-gray-900">
                                            <ul>
                                                {(user.discount_coupons ?? []).map((coupon, index) => (
                                                    <li key={index}>
                                                        <strong>{coupon.name}</strong>: {coupon.description} - {coupon.discount_percentage}% off
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                       <p className="mt-1 text-sm text-gray-900">
                                             "No active discount coupon"
                                        </p>
                                    )}
                            </div>

                        </div>
                    </div>
                    <ChangePasswordForm />
                </div>
            </div>
        </div>
    );
}