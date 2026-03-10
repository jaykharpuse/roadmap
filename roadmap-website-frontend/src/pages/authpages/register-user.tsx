import { Button } from "@/components/ui/button";

import { SignUpSchema } from "@/schema/authschema/signUpFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";


import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { registerUser } from "@/state/slices/authSlice";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Signup: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
//   const { toast } = useToast();
  const { isLoading } = useAppSelector((state) => state.auth);
  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      profileUrl: undefined,
    },
  });
  const onSubmit = (data: z.infer<typeof SignUpSchema>) => {
      dispatch(registerUser(data))
      .unwrap()
      .then(() => {
        toast.success("Successfully created your account", {
          description: "Please verify your account with OTP",
        });
        navigate(`/verify/${data.email}`);
      })
      .catch((error) => {
        console.log("this is a error ", error);
        toast.error(error);
      });
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0F172A] to-[#020617]">
      <div className="w-full max-w-md p-8 rounded-lg shadow-md bg-[#1E293B] hover:bg-[#0F172A] transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#60A5FA]">
          Sign Up
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-[#E2E8F0]">
                    Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="jhondoe"
                      type="text"
                      className="border-[#1E293B] rounded-md shadow-sm focus:ring-[#3B82F6] bg-[#0F172A] focus:ring-2 text-[#E2E8F0] placeholder-[#64748B]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-[#94A3B8]">
                    Your username.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-[#E2E8F0]">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="enter your email"
                      type="email"
                      className="border-[#1E293B] rounded-md shadow-sm focus:ring-[#3B82F6] bg-[#0F172A] focus:ring-2 text-[#E2E8F0] placeholder-[#64748B]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-[#94A3B8]">
                    Your account email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-[#E2E8F0]">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="enter password"
                      type="password"
                      className="border-[#1E293B] rounded-md shadow-sm focus:ring-[#3B82F6] bg-[#0F172A] focus:ring-2 text-[#E2E8F0] placeholder-[#64748B]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-[#94A3B8]">
                    Create password.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full py-2 bg-[#2563EB] text-white rounded-md shadow hover:bg-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center">
          <span className="text-sm text-[#E2E8F0]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#60A5FA] hover:underline"
            >
              Login here
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};
export default Signup;