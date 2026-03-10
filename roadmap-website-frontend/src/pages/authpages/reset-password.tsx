
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ResetPasswordSchema } from "@/schema/authschema/ResetpasswordFormSchema";

import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { resetPassword } from "@/state/slices/authSlice";
import { toast } from "sonner";

// Define the schema using zod

type ResetPasswordForm = z.infer<typeof ResetPasswordSchema>;

const ResetPassword: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  const { token } = useParams();


  const navigate = useNavigate();

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      token: token,
    },
  });

const onSubmit = (data: ResetPasswordForm) => {
  dispatch(resetPassword(data))
      .unwrap()
      .then(() => {
      toast.success("Password reset successful", {
        description: "Please go to the login page.",
      });
      navigate("/login");
    })
    .catch((error) => {
      toast.error("Reset Failed", {
        description: error || "Something went wrong.",
      });
    });
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0F172A] to-[#020617]">
      <div className="w-full max-w-md p-8 rounded-lg shadow-md bg-[#1E293B] hover:bg-[#0F172A] transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#60A5FA]">Reset Password</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-[#E2E8F0]">
                    New Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter new password"
                      type="password"
                      className="border-[#1E293B] rounded-md shadow-sm focus:ring-[#3B82F6] bg-[#0F172A] focus:ring-2 text-[#E2E8F0] placeholder-[#64748B]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Confirm new password"
                      type="password"
                      className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-indigo-400 dark:placeholder-gray-400"
                      {...field}
                    />
                  </FormControl>
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
                "Reset Password"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ResetPassword;
