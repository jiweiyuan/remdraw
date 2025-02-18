import UserSignupForm from "./components/user-signup-form.tsx"
import AuthLayout from "@/components/layout/auth-layout.tsx";

export  default function SignUpPage() {

    return (
        <AuthLayout>
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[420px]">
                <UserSignupForm/>
            </div>
        </AuthLayout>
    );
}