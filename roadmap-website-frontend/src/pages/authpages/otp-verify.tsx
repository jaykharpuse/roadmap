import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, ShieldCheck } from "lucide-react";
import appLogo from "@/assets/app_logo.svg";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { verifyUser } from "@/state/slices/authSlice";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const VerifyFormSchema = z.object({
  code: z.string().min(6, { message: "Your one-time password must be 6 characters." }),
  email: z.string().email("invalid email"),
});

const Verify: React.FC = () => {
  const dispatch = useAppDispatch();
  const { email } = useParams();
  const navigate = useNavigate();
  const { isLoading } = useAppSelector((state) => state.auth);

  const form = useForm<z.infer<typeof VerifyFormSchema>>({
    resolver: zodResolver(VerifyFormSchema),
    defaultValues: { code: "", email: email },
  });

  function onSubmit(data: z.infer<typeof VerifyFormSchema>) {
    dispatch(verifyUser(data))
      .unwrap()
      .then(() => {
        toast.success("Account verified!");
        navigate("/login");
      })
      .catch((error: any) => {
        toast.error("Verification failed", { description: error || "Invalid or expired OTP." });
      });
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden px-5">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-violet-600/[0.07] blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-orange-500/[0.05] blur-[100px]" />
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
          <div className="mb-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-5">
              <ShieldCheck className="w-7 h-7 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1.5" style={{ fontFamily: 'Syne, sans-serif' }}>
              Verify your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to{" "}
              <span className="text-foreground/70 font-medium">{email}</span>
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="text-center">
                    <FormLabel className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
                      One-Time Password
                    </FormLabel>
                    <FormControl>
                      <div className="flex justify-center mt-2">
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup className="gap-2">
                            {[...Array(6)].map((_, index) => (
                              <InputOTPSlot
                                key={index}
                                index={index}
                                className="w-11 h-11 rounded-xl border-border dark:border-white/[0.1] bg-muted/50 dark:bg-white/[0.04] text-foreground text-base font-bold focus:border-orange-500/50 focus:ring-orange-500/20"
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground mt-2">
                      Check your email inbox for the verification code.
                    </FormDescription>
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
                  "Verify Account"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
};

export default Verify;
