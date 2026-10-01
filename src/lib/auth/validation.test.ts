import { describe, it, expect } from "vitest";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./validation";

describe("Auth Validation Schemas", () => {
  describe("signInSchema", () => {
    it("accepts valid email and password", () => {
      const res = signInSchema.safeParse({
        email: "user@example.com",
        password: "SecretPassword1",
      });
      expect(res.success).toBe(true);
    });

    it("rejects invalid email formats", () => {
      const res = signInSchema.safeParse({
        email: "invalid-email",
        password: "SecretPassword1",
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.flatten().fieldErrors.email).toBeDefined();
      }
    });

    it("rejects empty password", () => {
      const res = signInSchema.safeParse({
        email: "user@example.com",
        password: "",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("signUpSchema", () => {
    it("accepts valid sign up data", () => {
      const res = signUpSchema.safeParse({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        password: "Password123",
        confirmPassword: "Password123",
      });
      expect(res.success).toBe(true);
    });

    it("rejects mismatched passwords", () => {
      const res = signUpSchema.safeParse({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        password: "Password123",
        confirmPassword: "PasswordDifferent",
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.flatten().fieldErrors.confirmPassword).toContain(
          "Passwords do not match"
        );
      }
    });

    it("rejects short password (< 8 chars)", () => {
      const res = signUpSchema.safeParse({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        password: "Pass1",
        confirmPassword: "Pass1",
      });
      expect(res.success).toBe(false);
    });

    it("rejects password without number", () => {
      const res = signUpSchema.safeParse({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        password: "PasswordOnly",
        confirmPassword: "PasswordOnly",
      });
      expect(res.success).toBe(false);
    });

    it("rejects password without uppercase letter", () => {
      const res = signUpSchema.safeParse({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("forgotPasswordSchema", () => {
    it("accepts valid email", () => {
      expect(
        forgotPasswordSchema.safeParse({ email: "hello@splug.ng" }).success
      ).toBe(true);
    });

    it("rejects empty email", () => {
      expect(forgotPasswordSchema.safeParse({ email: "" }).success).toBe(false);
    });
  });

  describe("resetPasswordSchema", () => {
    it("accepts matching strong passwords", () => {
      expect(
        resetPasswordSchema.safeParse({
          password: "NewPassword2026",
          confirmPassword: "NewPassword2026",
        }).success
      ).toBe(true);
    });

    it("rejects mismatched passwords", () => {
      expect(
        resetPasswordSchema.safeParse({
          password: "NewPassword2026",
          confirmPassword: "DifferentPassword2026",
        }).success
      ).toBe(false);
    });
  });
});
