import * as Yup from "yup";

export const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address format")
    .required("Email cannot be empty"),
  password: Yup.string()
    .min(3, "Password must be 3 characters at minimum")
    .matches(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/,
      "Incorrect Password"
    )
    .required("Password cannot be empty"),
});
