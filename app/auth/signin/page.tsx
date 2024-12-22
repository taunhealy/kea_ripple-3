import { SignInButton } from "@/app/components/auth/SignInButton";

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-sm space-y-6 p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>
        <SignInButton />
      </div>
    </div>
  );
}
