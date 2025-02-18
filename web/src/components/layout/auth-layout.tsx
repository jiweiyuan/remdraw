import {Link} from "react-router-dom";
import {cn} from "@/lib/utils.ts";
import {buttonVariants} from "@/components/ui/button.tsx";
import LogoName from "@/components/shared/logo-name.tsx";
import {Toaster} from "@/components/ui/toaster.tsx";

export  default function AuthLayout({children}) {

    return (
        <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <Link
                to="/public"
                className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'absolute right-4 top-4 hidden md:right-8 md:top-8'
                )}
            >
                Login
            </Link>
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-indigo-50 dark:bg-secondary
        bg-[url('/welcoming.svg')] bg-auto bg-center bg-no-repeat" />
                <LogoName/>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg text-black">
                        </p>
                        <footer className="text-sm"></footer>
                    </blockquote>
                </div>
            </div>
            <div className="flex h-full items-center p-4 lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[420px]">
                    {children}
                    <Toaster />
                </div>
            </div>
        </div>
    );
}