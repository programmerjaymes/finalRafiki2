import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Rafiki - Business Directory Platform",
  description: "Register as a business owner in Rafiki, the comprehensive business directory platform for Tanzania",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
