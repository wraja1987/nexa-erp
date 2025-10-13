import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("credentials", { redirect: true, email, password, callbackUrl: "/dashboard" });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-violet-700 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <Image src="/logo.svg" alt="Nexa ERP" width={60} height={60} className="mx-auto mb-2" />
          <h1 className="text-2xl font-semibold text-gray-800">Sign in to Nexa ERP</h1>
          <p className="text-sm text-gray-500">Manage your business with the Nexa AI Engine</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            <div className="text-right mt-1">
              <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="flex items-center my-4">
          <hr className="flex-1 border-gray-300" />
          <span className="mx-2 text-sm text-gray-500">or continue with</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        <div className="flex gap-3">
          <button onClick={() => signIn("google")} className="w-1/2 py-2 border rounded-md hover:bg-gray-50">Google</button>
          <button onClick={() => signIn("azure-ad")} className="w-1/2 py-2 border rounded-md hover:bg-gray-50">Microsoft</button>
        </div>

        <p className="text-xs text-gray-400 text-center">© Nexa ERP — All rights reserved</p>
      </div>
    </div>
  );
}
