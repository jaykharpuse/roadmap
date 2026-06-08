import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ResetPasswordSchema } from "@/schema/authschema/ResetpasswordFormSchema";
import { Loader2, Route, KeyRound, ArrowRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { resetPassword } from "@/state/slices/authSlice";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

type ResetPasswordForm = z.infer<typeof ResetPasswordSchema>;

const ResetPassword: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  const { token } = useParams();
  const navigate = useNavigate();

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "", token: token },
  });

  const onSubmit = (data: ResetPasswordForm) => {
    dispatch(resetPassword(data))
      .unwrap()
      .then(() => {
        toast.success("Password reset successful");
        navigate("/login");
      })
      .catch((error) => {
        toast.error("Reset failed", { description: error || "Something went wrong." });
      });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden px-5">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-orange-500/[0.06] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-600/[0.06] blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 via-rose-500 to-violet-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Route className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>
              Tutor<span className="text-gradient-brand">eez</span>
            </span>
          </Link>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          <div className="mb-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-violet-500/20 border border-border flex items-center justify-center mx-auto mb-5">
              <KeyRound className="w-7 h-7 text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1.5" style={{ fontFamily: 'Syne, sans-serif' }}>
              Set new password
            </h1>
            <p className="text-sm text-muted-foreground">Choose a strong password for your account</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter new password"
                        type="password"
                        className="h-11 bg-muted/50 dark:bg-white/[0.04] border-border dark:border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:border-orange-500/40 focus:ring-orange-500/20 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-rose-400 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Confirm new password"
                        type="password"
                        className="h-11 bg-muted/50 dark:bg-white/[0.04] border-border dark:border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:border-orange-500/40 focus:ring-orange-500/20 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-rose-400 text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-violet-600 text-white border-0 shadow-lg shadow-orange-500/20 hover:opacity-90 disabled:opacity-60"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Reset Password <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
