"use client";

import { ChangePasswordSchema } from "./changepassword.schema";
import { Formik, Form, Field, FormikProps } from "formik";
import axios from "axios";
import Swal from "sweetalert2";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hook";
import { getCookie } from "cookies-next";
import { useState } from "react";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function ChangePasswordForm() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const initialValues = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const token = getCookie('access_token');
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/change-password`,
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        {
        headers: {
          Authorization: `Bearer ${token}`, // Add authorization header
        },
      }
      );

      Swal.fire({
        title: "Success!",
        text: response.data.message,
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-xl font-semibold mb-4"
        > Change Password
      </h2>
      <Formik
        initialValues={initialValues}
        validationSchema={ChangePasswordSchema} 
        onSubmit={handleSubmit}
      >
        {(props: FormikProps<typeof initialValues>) => {
          const { isSubmitting, touched, errors, handleChange, handleBlur  } = props;
          
          return (
            <Form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700"
                  > Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    name="currentPassword"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="mt-1 block w-full p-2 border rounded-md pr-10"
                    placeholder="•••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  >
                    {showPassword.current ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
                {touched.currentPassword && errors.currentPassword && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.currentPassword}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700"
                  > New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    name="newPassword"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="mt-1 block w-full p-2 border rounded-md pr-10"
                    placeholder="•••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  >
                    {showPassword.new ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
                {touched.newPassword && errors.newPassword && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.newPassword}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700"
                  > Confirm New Password
                </label>
              <div className="relative">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    name="confirmPassword"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="mt-1 block w-full p-2 border rounded-md pr-10"
                    placeholder="•••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  >
                    {showPassword.confirm ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Changing Password..." : "Change Password"}
              </button>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}