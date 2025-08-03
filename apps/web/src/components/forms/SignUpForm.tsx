"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);

    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    if (!email || !password || !confirmPassword) {
      await delay(500); // 0.5 second delay before hiding loader
      setLoading(false);
      toast("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      await delay(500); // 0.5 second delay before hiding loader
      setLoading(false);
      toast("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });

    setLoading(false); // Always set after async op

    if (error) {
      toast(error.message);
    } else {
      toast("Check your email for confirmation.");
      router.push("/signin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-5xl md:h-[480px] bg-white rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div className="w-full max-w-5xl p-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            SIGN UP
          </h2>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500  text-gray-800 placeholder-gray-400"
            />
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 pr-12 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500  text-gray-800 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-12 right-3 flex items-center text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full px-4 py-3 pr-12 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-12 right-3 flex items-center text-gray-500"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="w-full py-3 bg-green-800 hover:bg-green-900 text-white font-medium rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Signing up...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </div>
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/signin" className="text-blue-600 hover:underline">
              Sign in
            </a>
          </p>
        </div>

        <div className="w-full h-full">
          <Image
            src="/BACKGROUND.png"
            alt="Background"
            width={1000}
            height={1000}
            className="w-full h-full object-fill"
          />
        </div>
      </div>
    </div>
  );
}
