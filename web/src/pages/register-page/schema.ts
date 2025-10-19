import * as Yup from "yup";

export const RegisterSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address format")
    .required("Email cannot be empty"),
  password: Yup.string()
    .min(5, "Password must be 5 characters at minimum")
    .matches(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .required("Password cannot be empty"),
  firstName: Yup.string().required("cannot be empty"),
  lastName: Yup.string().required("cannot be empty"),
  roleId: Yup.number().oneOf([1, 2], "Role must be either 1 or 2")
  .required("Role is required")
  .typeError("Role must be a number"),
  referred_by: Yup.string().notRequired() // Explicitly make it optional
});
