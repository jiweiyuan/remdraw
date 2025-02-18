import { Button } from '@/components/ui/button.tsx';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useRouter } from '@/routes/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {cn} from "@/lib/utils.ts";
import LogoName from "@/components/shared/logo-name.tsx";

const formSchema = z.object({
    firstName: z.string().min(1, { message: 'First name is required' }),
    secondName: z.string().min(1, { message: 'Second name is required' }),
    email: z.string().email({ message: 'Enter a valid email address' }),
    password: z.string()
        .min(8, { message: 'Password must be at least 8 characters long' })
        .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
        .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
        .regex(/[0-9]/, { message: 'Password must contain at least one number' })
        .regex(/[@$!%*?&#]/, { message: 'Password must contain at least one special character' }),
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const router = useRouter();
  const [loading] = useState(false);
  const defaultValues = {};
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    console.log('data', data);
    router.push('/');
  };

  return (
      <>
          <Card>
              <CardHeader>
                  <div className="flex justify-center mb-4">
                  <LogoName/>
                  </div>
                  <div className="mb-4" />
                  <CardTitle className="text-xl text-center">Create your account</CardTitle>

                  <CardDescription className={"text-center"}>
                      Welcome! Please fill in the details to get started.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <Form {...form}>
                      <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="w-full space-y-4"
                      >
                          {/* First Name and Second Name in the same line */}
                          <div className="flex space-x-2">
                              <FormField
                                  control={form.control}
                                  name="firstName"

                                  render={({ field }) => (
                                      <FormItem className={cn("w-1/2 space-y-1")}>
                                          <FormLabel className={"mb-0 pb-0"}>First Name</FormLabel>
                                          <FormControl>
                                              <Input
                                                  placeholder="First Name"
                                                  disabled={loading}
                                                  {...field}
                                              />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                              <FormField
                                  control={form.control}
                                  name="secondName"
                                  render={({ field }) => (
                                      <FormItem className={cn("w-1/2 space-y-1")}>
                                          <FormLabel>Second Name</FormLabel>
                                          <FormControl>
                                              <Input
                                                  placeholder="Second Name"
                                                  disabled={loading}
                                                  {...field}
                                              />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                          </div>

                          {/* Email Input */}
                          <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                  <FormItem className={cn("space-y-1")}>
                                      <FormLabel>Email</FormLabel>
                                      <FormControl>
                                          <Input
                                              type="email"
                                              placeholder="Enter your email..."
                                              disabled={loading}
                                              {...field}
                                          />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />

                          {/* Password Input */}
                          <FormField
                              control={form.control}
                              name="password"
                              render={({ field }) => (
                                  <FormItem className={cn("space-y-1")}>
                                      <FormLabel>Password</FormLabel>
                                      <FormControl>
                                          <Input
                                              type="password"
                                              placeholder="Enter your password..."
                                              disabled={loading}
                                              {...field}
                                          />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />

                          <Button disabled={loading} className="ml-auto w-full" type="submit">
                              Continue
                          </Button>
                      </form>
                  </Form>

                  <p className="text-sm text-muted-foreground mt-4 text-center">
                      By clicking continue, you agree to our{' '}
                      <Button variant="link" className={cn("p-0 m-0")}>Terms of Service
                      </Button>
                      {' '}and{' '}
                        <Button variant="link" className={cn("p-0 m-0")}>Privacy Policy</Button>
                      .
                  </p>
                  <div className="mt-4 text-sm text-center">
                      Already have an account?{" "}
                      <Button variant={"link"}
                                className={cn("p-0 m-0")}
                                onClick={() => router.push('/login')}

                      >Log In</Button>
                  </div>
              </CardContent>
          </Card>
      </>
  );
}
