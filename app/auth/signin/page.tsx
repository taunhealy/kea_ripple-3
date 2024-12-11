import { signIn } from "next-auth/react";

const handleSignIn = () => {
  signIn("google", {
    callbackUrl: "/",
    prompt: "consent",
  });
};

export default function SignIn() {
  return <div>SignIn</div>;
}
