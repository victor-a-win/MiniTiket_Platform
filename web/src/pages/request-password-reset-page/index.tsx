"use client";

import { Formik, Form, Field } from "formik";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function RequestPasswordReset() {
  const router = useRouter();

  const handleSubmit = async (values: { email: string }) => {
     try {
      Swal.fire({
        title: "Sending...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/request-password-reset`, 
        { email: values.email }
      );
      
      Swal.fire({
        title: "Success!",
        text: "Password reset link sent to your email",
        icon: "success",
      }).then(() => 
        router.push("/login"));
    } catch (err: any) {
      Swal.fire({
        title: "Error!",
        text: err.response?.data?.message || err.message,
        icon: "error",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-lg font-bold mb-6 text-center"
          > Reset Password
        </h2>
        <p className="mb-6 text-center">
          Enter your email to receive a password reset link
        </p>

        <Formik
          initialValues={{ email: "" }}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="block mb-1">
                  Email
                </label>
                <Field
                  name="email"
                  type="email"
                  required
                  placeholder="Your email"
                  className="w-full p-2 border rounded"
              />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-blue-600 text-white py-2 rounded ${
                  isSubmitting ? "opacity-50" : "hover:bg-blue-700"
                }`}
                > {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>

              <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                > Cancel
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}