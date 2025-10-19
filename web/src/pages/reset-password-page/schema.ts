import * as Yup from "yup";

export const ResetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, "Password must be 8 characters at minimum")
    .matches(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .required("New Password cannot be empty"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required")
});