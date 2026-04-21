export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,16}$/;

export const PASSWORD_HINT = "8–16 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.";

export function validatePassword(password) {
  if (!PASSWORD_REGEX.test(password)) return PASSWORD_HINT;
  return null;
}
