"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function ActivationAccount() {
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get("token") : null;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const activateAccount = async () => {
      try {
        if (!token) {
          throw new Error("No activation token provided");
        }

        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/activate/${token}`
        );

         // Handle both success cases (new activation and already verified)
         setIsSuccess(true);
         Swal.fire({
          title: "Success!",
          text: data.message,
          icon: "success",
          confirmButtonText: "Continue to Login",
        }).then((result) => {
          if (result.isConfirmed) {
            // Clear any password reset tokens from storage
            localStorage.removeItem('resetToken');
            sessionStorage.removeItem('resetToken');
            router.push("/login"); // Force redirect to login page
          }
        });
      } catch (error: any) {
        // Special handling for already verified case
        if (error.response?.data?.message?.includes("already verified")) {
          setIsSuccess(true);
          Swal.fire({
            title: "Already Verified",
            text: "Your account was already activated",
            icon: "info",
            confirmButtonText: "Continue to Login",
          }).then(() => {
            router.push("/login");
          });
          return;
        }
        
         // Handle other errors
        let errorMessage = error.response?.data?.message || error.message;
        Swal.fire({
          title: "Activation Failed",
          text: error.message,
          icon: "error",
          confirmButtonText: "OK",
        }).then(() => {
          router.push("/register");
        });
      } finally {
        setIsLoading(false);
      }
    };

  // Only run once when component mounts
if (token && isLoading) {
      activateAccount();
    }
  }, [token, router, isLoading]);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4"
                    > Activating your account...
                </h1>
                <p> Please wait while we verify your account </p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        {isSuccess ? (
          <>
            <h1 className="text-2xl font-bold mb-4"
                > Activation Successful!
            </h1>
            <p> You can now login to your account </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4"
                > Activation Failed
            </h1>
            <p> Please try registering again </p>
          </>
        )}
      </div>
    </div>
  );
}