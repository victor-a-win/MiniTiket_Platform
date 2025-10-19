"use client";

import { useState } from "react";
import axios from "axios";
import { useAppSelector, useAppDispatch} from "@/lib/redux/hook";
import { updateProfilePicture } from "@/lib/redux/features/authSlice";
import Swal from "sweetalert2";
import { getCookie } from "cookies-next";
import { fetchUser } from "@/lib/redux/features/authSlice";
import { persistor } from "@/lib/redux/store";

export default function ProfilePictureUpload() {
    const dispatch = useAppDispatch();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const user = useAppSelector((state) => state.auth.user);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            Swal.fire({
                title: "Error!",
                text: "Please select a file first",
                icon: "error",
                confirmButtonText: "OK",
            });
        return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

    try {
        // Get token from cookies
        const token = getCookie('access_token');
        if (!token) {
            throw new Error("Authentication token not found");
        }

        // Show loading
        Swal.fire({
            title: "Uploading...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
        }
        });

        const response = await axios.patch(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/avatar`,
            formData,
            {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
                },
            }
        );

        // Update Redux state with new profile picture
        if (response.data?.fileName) {
            dispatch(updateProfilePicture(response.data.fileName));
        // Force refresh of user data
            dispatch(fetchUser());
        // Force clear persisted state
            persistor.flush().then(() => {
            persistor.persist();
            });           
        }

        Swal.fire({
            title: "Success!",
            text: "Profile picture updated successfully",
            icon: "success",
            confirmButtonText: "OK",
        })
        } catch (error: any) {
        // Error handling
        Swal.fire({
            title: "Error!",
            text: error.response?.data?.message || error.message || "Failed to update profile picture",
            icon: "error",
            confirmButtonText: "OK",
            });
        } finally {
        setIsUploading(false);
        }
    };

    console.log('User profile picture:', user?.profile_picture);
    console.log('Constructed URL:', `${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/w_200,h_200,c_fill/${user?.profile_picture}`);
    
    return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg">
        {user?.profile_picture ? (
            <img
                src={`${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/w_200,h_200,c_fill/${user.profile_picture}`}
                alt ="Profile Picture"
                className="w-32 h-32 rounded-full object-cover"
                key={user.profile_picture} // Add key to force re-render
            />
            
        ) : (
            // fallback UI if no profile picture
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No Image</span>
            </div>
        )}
        <div className="flex flex-col gap-2 w-full">
            <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            disabled={isUploading}
            />
            <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
                ${(!selectedFile || isUploading) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
            {isUploading ? "Uploading..." : "Update Profile Picture"}
            </button>
        </div>
    </div>
    );
}