import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LoginFormSchema } from "@/schema/authschema/LoginFormSchema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/authContext";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { toast } from "sonner";
import { loginUser } from "@/state/slices/authSlice";

const Login: React.FC = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  const { isLoading } = useAppSelector((state) => state.auth);

  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof LoginFormSchema>) => {
    const from = (location.state as any)?.from?.pathname || "/";
    dispatch(loginUser(data))
      .unwrap()
      .then(async () => {
        toast.success("Successfully Logged In", {
          description: "Logged in successfully.",
        });
        // refresh auth context user (will silently fail if not available)
        try {
          await refreshUser();
        } catch (e) {}
        navigate(from, { replace: true });
      })
      .catch((error: any) => {
        toast.error("Login Error", {
          description: error,
        });
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0F172A] to-[#020617]">
      <div className="w-full max-w-md p-8 rounded-lg shadow-md bg-[#1E293B] hover:bg-[#0F172A] transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#60A5FA]">
          Login
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      placeholder="you@example.com"
                      type="email"
                      className="border-[#1E293B] rounded-md shadow-sm focus:ring-[#3B82F6] bg-[#0F172A] focus:ring-2 text-[#E2E8F0] placeholder-[#64748B]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-[#94A3B8]">
                    Your email address or username.
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
                    Your account password.
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
                "Login"
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center space-y-2">
          <div>
            <span className="text-sm text-[#E2E8F0]">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#60A5FA] hover:underline">
                Register here
              </Link>
            </span>
          </div>
          <div>
            <span className="text-sm text-[#E2E8F0]">
              Forgot password?{" "}
              <Link
                to="/forgot-password"
                className="text-[#60A5FA] hover:underline"
              >
                Click here
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
