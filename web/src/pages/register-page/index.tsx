"use client";

import Swal from "sweetalert2";
import { Formik, Form, Field, FormikProps } from "formik";
import axios from "axios";

import { RegisterSchema } from "./schema";
import { IRegister } from "./type";
import { useState } from "react";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import "./register.styles.css";

export default function Register() {
  const [showPassword, setShowPassword] = useState({password: false});
  const initialValues: IRegister = {
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    roleId: 1 as number, // Default to role 1
    referred_by: "",
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const onRegister = async (values: IRegister) => {
    // Show loading alert
    Swal.fire({
      title: "Processing...",
      html: "Please wait while we create your account",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/register`,
        {
          email: values.email,
          password: values.password,
          first_name: values.firstName,
          last_name: values.lastName,
          roleId: Number(values.roleId),
          referred_by: values.referred_by
        }
      );

      // Close loading and show success
      Swal.fire({
        title: "Registration Successful!",
        html: 
          `<div>
            <p>${data.message}</p>
              <div class="mt-4">
                We've sent an activation link to your email (${values.email}).
              </div>
              <div class="mt-2">
                Please check your inbox and click the activation link to verify your account.
              </div>
          </div>`
        ,
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        window.location.reload(); // Refresh register page
      });
    } catch (err: any) {
      // Close loading and show error
      Swal.fire({
        title: "Error!",
        text: err.response?.data?.message || err.message,
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        window.location.reload(); // Refresh register page
      });
    }
  };

  return (
     <div className="Register-Styles flex flex-col sm:flex-row justify-center items-center 
                    sm:justify-evenly sm:gap-3 sm:p-2"
      >
      <div className="mt-5 sm:py-12 sm:px-12">
        <img  className="h-35 w-60 object-contain object-center
                         sm:h-72 sm:min-w-9 sm:object-cover ... sm:size-96 sm:rounded-lg sm:basis-96"
          src="register_page_pic_v2.jpg" alt="Register Picture"
        />
      </div>
    <div 
      className="sm:basis-128 mt-6 sm:mt-2
                flex flex-col justify-center justify-items-center items-center 
                gap-2 sm:gap-5"
      >
      <p className="text-xl sm:text-3xl sm:pt-10"
        > Create your TuneInLive account
      </p>
      <Formik
        initialValues={initialValues}
        validationSchema={RegisterSchema}
        onSubmit={(values) => {
          onRegister(values);
        }}
      >
        {(props: FormikProps<IRegister>) => {
          const { isSubmitting, values, handleChange, handleBlur, touched, errors } = props;

          return (
            <Form className="w-full max-w-md">
              <div className="flex flex-col gap-2 mb-3">
                <label>Email :</label>
                <Field
                  type="email"
                  name="email"
                  onChange={handleChange}
                  value={values.email}
                  className="p-2 border rounded"
                  placeholder="name@gmail.com"
                />
                {touched.email && errors.email ? (
                  <div className="text-red-500">*{errors.email}</div>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 mb-3">
                <label>Password :</label>
                <div className="relative">
                  <input
                    type={showPassword.password ? "text" : "password"}
                    name="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                    className="p-2 border rounded w-full pr-10"
                    placeholder="•••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('password')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword.password ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
                {touched.password && errors.password ? (
                  <div className="text-red-500">*{errors.password}</div>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 mb-3">
                <label>First Name :</label>
                <Field
                  type="text"
                  name="firstName"
                  onChange={handleChange}
                  value={values.firstName}
                  className="p-2 border rounded"
                />
                {touched.firstName && errors.firstName ? (
                  <div className="text-red-500">*{errors.firstName}</div>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 mb-3">
                <label>Last Name :</label>
                <Field
                  type="text"
                  name="lastName"
                  onChange={handleChange}
                  value={values.lastName}
                  className="p-2 border rounded"
                />
                {touched.lastName && errors.lastName ? (
                  <div className="text-red-500">*{errors.lastName}</div>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 mb-3">
                <label>Role :</label>
                <Field
                  as="select"
                  name="roleId"
                  onChange={handleChange}
                  value={values.roleId}
                  className="p-2 border rounded"
                >
                  <option value={1}>Role 1 (Customer)</option>
                  <option value={2}>Role 2 (Event Organizer)</option>
                </Field>
                {touched.roleId && errors.roleId ? (
                  <div className="text-red-500">*{errors.roleId}</div>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 mb-3">
                <label>Referred by (optional) :</label>
                <Field
                  type="text"
                  name="referred_by"
                  onChange={handleChange}
                  value={values.referred_by}
                  className="p-2 border rounded"
                  placeholder="Example: TIX-NUMBERS"
                />
                {touched.referred_by && errors.referred_by ? (
                  <div className="text-red-500">*{errors.referred_by}</div>
                ) : null}
              </div>
              
              <button
                className={`w-full bg-blue-900 text-white py-2 px-4 rounded
                           hover:bg-blue-400 transition-colors 
                           ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                type="submit"
                disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
              </button>
            </Form>
          );
        }}
      </Formik>
      <p className="text-gray-500 mb-5 text-sm sm:text-base"
        > Already have an account? 
          <a href="/login" className="text-blue-900 hover:underline"
            > Login here
          </a>
      </p>
    </div>
  </div>
  );
}
