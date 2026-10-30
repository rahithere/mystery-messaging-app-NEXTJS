"use client";
import { useDebounceCallback } from "usehooks-ts";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signupSchema";
import axios, { AxiosError } from "axios";
import { apiResponse } from "@/types/apiResponse";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@base-ui/react/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
export default function Component() {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //we dont want to set the val of username immediately but with 300ms delay
  const debouncedUsername = useDebounceCallback(setUsername, 300);
  const router = useRouter();

  //zod implementation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage("");

        try {
          const response = await axios.get(
            `/api/check-username-unique?username=${username}`,
          );
          // console.log(response);
          setUsernameMessage(response.data.message);
          console.log(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<apiResponse>;
          setUsernameMessage(
            axiosError.response?.data.message ?? "Error checking username",
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [username]);

  // we get data with onSubmit through handleSubmit
  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      console.log(data);
      const response = await axios.post<apiResponse>(`/api/sign-up`, data);
      toast.success("Success", {
        description: response.data.message,
      });
      router.replace(`/verify/${username}`);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error in signup of user", error);
      const axiosErorr = error as AxiosError<apiResponse>;
      let errorMessage = axiosErorr.response?.data.message;
      toast.error("Signup Failed", {
        description: errorMessage,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Mystery Message
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>
        {/* //form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* //username */}
          <Controller
            name="username"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Username</FieldLabel>
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    debouncedUsername(e.target.value);
                  }}
                  placeholder="Enter username"
                />

                {isCheckingUsername && <Loader2 className="animate-spin" />}

                {!isCheckingUsername && usernameMessage && (
                  <p
                    className={`text-sm ${usernameMessage == "username is unique" ? "text-green-500" : "text-red-500"}`}
                  >
                    {usernameMessage}
                  </p>
                )}

                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />
          {/* //email */}
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input {...field} placeholder="Enter email" />

                {fieldState.error && (
                  <FieldDescription>
                    {fieldState.error.message}
                  </FieldDescription>
                )}
              </Field>
            )}
          />
          {/* //password */}
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Password</FieldLabel>
                <Input
                  {...field}
                  placeholder="Enter password"
                  type="password"
                />

                {fieldState.error && (
                  <FieldDescription>
                    {fieldState.error.message}
                  </FieldDescription>
                )}
              </Field>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
              </>
            ) : (
              "Signup"
            )}
          </Button>
        </form>
        <div className="text-center mt-4">
          <p>
            Already a member?{" "}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
