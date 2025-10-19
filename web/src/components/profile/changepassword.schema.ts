import * as Yup from "yup";

export const ChangePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(7, "Password must be 7 characters at minimum")
    .matches(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});