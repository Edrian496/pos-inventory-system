"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      toast(error.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-5xl md-h-[470px] bg-white rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div className="w-full max-w-5xl p-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center p-6">
            LOGIN
          </h2>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-11  right-3 flex items-center text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 bg-green-800 hover:bg-green-900 text-white font-medium rounded-md flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            {"Don’t have an account?"}
            {"  "}
            <a href="/signup" className="text-blue-600 hover:underline">
              Sign up
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
