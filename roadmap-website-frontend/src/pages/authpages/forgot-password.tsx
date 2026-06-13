import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ForgotPasswordSchema } from "@/schema/authschema/ForgotPasswordFormSchema";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { forgotPassword } from "@/state/slices/authSlice";
import { toast } from "sonner";
import { Loader2, ArrowRight, MailCheck } from "lucide-react";
import appLogo from "@/assets/app_logo.svg";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ForgotPassword: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isBackToLogin, setIsBackToLogin] = useState<boolean>(false);
  const { isLoading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: z.infer<typeof ForgotPasswordSchema>) => {
    dispatch(forgotPassword(data))
      .unwrap()
      .then(() => {
        setIsBackToLogin(true);
        toast.success("Reset link sent!", { description: "Check your inbox." });
      })
      .catch((error) => toast.error("Invalid email", { description: error }));
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden px-5">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-rose-500/[0.06] blur-[120px]" />
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 via-rose-500 to-violet-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <img src={appLogo} alt="Tutoreez Logo" className="w-full h-full object-contain p-1" />
            </div>
            <span className="text-xl font-bold text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>
              Tutor<span className="text-gradient-brand">eez</span>
            </span>
          </Link>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          {isBackToLogin ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-violet-500/20 border border-border flex items-center justify-center mx-auto mb-5">
                <MailCheck className="w-7 h-7 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                Check your inbox
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                We sent a password reset link to your email address.
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="w-full h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-violet-600 text-white border-0 shadow-lg shadow-orange-500/20 hover:opacity-90"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-foreground mb-1.5" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Reset password
                </h1>
                <p className="text-sm text-muted-foreground">We'll send a reset link to your email</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="you@example.com"
                            type="email"
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
                        Send Reset Link <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </Form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link to="/login" className="text-orange-400/80 hover:text-orange-400 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
