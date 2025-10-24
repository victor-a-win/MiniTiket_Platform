"use client";

import { useState } from "react";
import { Formik, Form, Field } from "formik";
import Swal from "sweetalert2";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const ResetPasswordSchema = {
  newPassword: {
    minLength: 8,
    pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/,
    message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  }
};

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePasswordReset = async (newPassword: string) => {
    setIsSubmitting(true);
    
    Swal.fire({
      title: "Processing...",
      html: "Please wait while we reset your password",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/reset-password-loggedin`, 
        { newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );
      
      Swal.fire({
        title: "Success!",
        text: "Your password has been reset successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (err: any) {
      console.error("Password reset error:", err);
      Swal.fire({
        title: "Error!",
        text: err.response?.data?.message || "Failed to reset password. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
      <p className="text-sm text-gray-600 mb-4">
        Set a new password for your account. You will be logged out after resetting your password.
      </p>
      
      <Formik
        initialValues={{ newPassword: "", confirmPassword: "" }}
        onSubmit={(values, { resetForm }) => {
          if (values.newPassword !== values.confirmPassword) {
            Swal.fire({
              title: "Error!",
              text: "Passwords don't match",
              icon: "error",
              confirmButtonText: "OK",
            });
            return;
          }

          if (values.newPassword.length < ResetPasswordSchema.newPassword.minLength) {
            Swal.fire({
              title: "Error!",
              text: `Password must be at least ${ResetPasswordSchema.newPassword.minLength} characters long`,
              icon: "error",
              confirmButtonText: "OK",
            });
            return;
          }

          if (!ResetPasswordSchema.newPassword.pattern.test(values.newPassword)) {
            Swal.fire({
              title: "Error!",
              text: ResetPasswordSchema.newPassword.message,
              icon: "error",
              confirmButtonText: "OK",
            });
            return;
          }

          handlePasswordReset(values.newPassword);
          resetForm();
        }}
      > 
        {({ handleChange, handleBlur, values }) => (
          <Form className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Field
                  type={showPassword.new ? "text" : "password"}
                  name="newPassword"
                  id="newPassword"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.newPassword}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your new password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isSubmitting}
                >
                  {showPassword.new ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Field
                  type={showPassword.confirm ? "text" : "password"}
                  name="confirmPassword"
                  id="confirmPassword"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.confirmPassword}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm your new password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isSubmitting}
                >
                  {showPassword.confirm ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Resetting Password..." : "Reset Password"}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  // Clear form
                  values.newPassword = "";
                  values.confirmPassword = "";
                }}
                className="bg-gray-500 text-white py-3 px-6 rounded-md hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                disabled={isSubmitting}
              >
                Clear
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}