import React from "react";
import { Button } from "@/components/ui/button";
import { SignUpSchema } from "@/schema/authschema/signUpFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Route, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { registerUser, googleSignIn } from "@/state/slices/authSlice";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { useAuth } from "@/contexts/authContext";

const Signup: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { isLoading } = useAppSelector((state) => state.auth);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: { username: "", email: "", password: "", profileUrl: undefined },
  });

  const onSubmit = (data: z.infer<typeof SignUpSchema>) => {
    dispatch(registerUser(data))
      .unwrap()
      .then(() => {
        toast.success("Account created! Please verify your email.");
        navigate(`/verify/${data.email}`);
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  const handleGoogleSuccess = async (access_token: string) => {
    setGoogleLoading(true);
    dispatch(googleSignIn({ access_token }))
      .unwrap()
      .then(async () => {
        toast.success("Account created with Google");
        try { await refreshUser(); } catch (e) {}
        navigate("/", { replace: true });
      })
      .catch((error: any) => {
        toast.error("Google sign-up failed", { description: error });
      })
      .finally(() => setGoogleLoading(false));
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden px-5 py-12">

      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[500px] rounded-full bg-violet-600/[0.07] blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-orange-500/[0.05] blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 via-rose-500 to-violet-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Route className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Road<span className="text-gradient-brand">Mapper</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-1.5" style={{ fontFamily: 'Syne, sans-serif' }}>
              Create your account
            </h1>
            <p className="text-sm text-white/40">Start your learning journey today — it's free</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-white/50 uppercase tracking-wider">
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="johndoe"
                        type="text"
                        className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-orange-500/40 focus:ring-orange-500/20 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-rose-400 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-white/50 uppercase tracking-wider">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        type="email"
                        className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-orange-500/40 focus:ring-orange-500/20 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-rose-400 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-white/50 uppercase tracking-wider">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Create a strong password"
                        type="password"
                        className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-orange-500/40 focus:ring-orange-500/20 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-rose-400 text-xs" />
                  </FormItem>
                )}
              />

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-1">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-violet-600 text-white border-0 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 hover:opacity-90 transition-all duration-300 disabled:opacity-60"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>
          </Form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-xs text-white/25 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          <GoogleAuthButton
            variant="signup"
            loading={googleLoading}
            onAccessToken={handleGoogleSuccess}
            onError={() => toast.error("Google sign-up was cancelled")}
          />

          <p className="mt-6 text-center text-sm text-white/35">
            Already have an account?{" "}
            <Link to="/login" className="text-orange-400/80 hover:text-orange-400 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
