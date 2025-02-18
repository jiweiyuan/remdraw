
import AuthLayout from "@/components/layout/auth-layout.tsx";
import {EmailVerificationForm} from "@/pages/auth/verify/componets/password-verification-form.tsx";

export  default function VerifyPage() {
    return (
        <AuthLayout>
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[420px]">
                <EmailVerificationForm/>
            </div>
        </AuthLayout>
    );
}