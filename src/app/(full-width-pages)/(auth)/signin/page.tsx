import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Rafiki - Business Directory Platform",
  description: "Sign in to your Rafiki business owner account to manage your business listing",
};

export default function SignIn() {
  return <SignInForm />;
}
