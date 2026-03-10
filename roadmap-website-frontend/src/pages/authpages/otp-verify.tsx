import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";


import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { verifyUser } from "@/state/slices/authSlice";
// toast removed; not used in this component

export const VerifyFormSchema = z.object({
  code: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
  email: z.string().email("invalid email"),
});

const Verify: React.FC = () => {
  const dispatch = useAppDispatch();
  const { email } = useParams();
  
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof VerifyFormSchema>>({
    resolver: zodResolver(VerifyFormSchema),
    defaultValues: {
      code: "",
      email: email,
    },
  });

  function onSubmit(data: z.infer<typeof VerifyFormSchema>) {
    dispatch(verifyUser(data))
      .unwrap()
      .then(() => {
        // toast({
        //   title: <p></p>,
        //   description: "Your Account has been verified successfully",
        // });
        navigate("/");
      })
      .catch(() => {
        // Handle verification error (UI toast removed)
      });
  }
  
  const { isLoading } = useAppSelector((state) => state.auth);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0F172A] to-[#020617]">
      <div className="w-full max-w-md p-8 rounded-lg shadow-md bg-[#1E293B] hover:bg-[#0F172A] transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#60A5FA]">
          Verify Your Account
        </h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-2/3 space-y-6 mx-auto"
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#E2E8F0]">One-Time Password</FormLabel>
                  <FormControl>
                    <InputOTP 
                      maxLength={6} 
                      {...field}
                      className="justify-center"
                    >
                      <InputOTPGroup className="gap-2">
                        {[...Array(6)].map((_, index) => (
                          <InputOTPSlot 
                            key={index} 
                            index={index}
                            className="border-[#334155] bg-[#0F172A] text-[#E2E8F0] hover:border-[#3B82F6] focus:border-[#3B82F6]"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormDescription className="text-[#94A3B8]">
                    Please enter the one-time password sent to your Email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit"
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                "Verify"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Verify;