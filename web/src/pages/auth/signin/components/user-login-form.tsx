import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from '@/routes/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {login} from "@/request/auth.ts";
import {setToken} from "@/lib/token.ts";
import {Card, CardContent, CardDescription, CardHeader} from '@/components/ui/card';
import LogoName from "@/components/shared/logo-name.tsx";
import {cn} from "@/lib/utils.ts";
import {useToast} from "@/components/ui/use-toast.ts";

const formSchema = z.object({
  email: z.string().min(1, { message: 'Email is required' })
      .email({ message: 'Enter a valid email address'}),
    password: z.string().min(1, { message: 'Password is required' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserLoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading] = useState(false);
  const defaultValues = {
    email: '',
    password: ''
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async () => {
    const data = form.getValues();
    if (data?.password === '' && data?.email === '') {
        return
    }
    const response = await login(data);
    if (response.success && response.token) {
        setToken(response.token);
        router.push('/dashboard');
    } else if (response.message) {
        form.setError('email', {
            message: response.message
        });
    } else {
        toast({
            title: 'Network Error',
            description: 'An error occurred, please try again',
            duration: 3000,
        })
    }
  };

  return (
      <Card>
          <CardHeader>
              <div className="flex justify-center mb-6">

                  <LogoName/>
              </div>
              <CardDescription className={"text-center"}>
                  Please Enter your email and password to login
              </CardDescription>
          </CardHeader>
          <CardContent>
              <Form {...form}>
                  <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="w-full space-y-2"
                  >
                      <FormField
                          control={form.control}
                          name="email"
                          render={({field}) => (
                              <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                      <Input
                                          type="email"
                                          placeholder="Enter your email..."
                                          disabled={loading}
                                          {...field}
                                      />
                                  </FormControl>
                                  <FormMessage/>
                              </FormItem>
                          )}
                      />

                      <FormField
                          control={form.control}
                          name="password"
                          render={({field}) => (
                              <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                      <Input
                                          type="password"
                                          placeholder="Enter your password..."
                                          disabled={loading}
                                          {...field}
                                      />
                                  </FormControl>
                                  <FormMessage/>
                              </FormItem>
                          )}
                      />

                      <Button disabled={loading} className="ml-auto w-full" type="submit"
                              onSubmit={onSubmit}
                      >
                          Login
                      </Button>
                  </form>
              </Form>
              <div className="mt-4 text-sm text-center">
                  No account?{" "}
                  <Button variant={"link"} className={cn("p-0 m-0")}
                          onClick={() => router.push('/signup')}
                  >Sign Up</Button>
              </div>
          </CardContent>

      </Card>
  );
}

