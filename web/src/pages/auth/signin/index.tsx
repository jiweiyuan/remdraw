
import UserLoginForm from "./components/user-login-form.tsx";
import AuthLayout from "@/components/layout/auth-layout.tsx";

export default function SignInPage() {
  return (
      <AuthLayout>
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[420px]">
              <UserLoginForm/>
          </div>
      </AuthLayout>
  );
}
