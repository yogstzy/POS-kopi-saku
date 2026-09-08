// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah halaman refresh saat tombol ditekan
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Jika berhasil, simpan data sederhana di memori browser (localStorage)
        localStorage.setItem("userSession", JSON.stringify(data.user));
        // Arahkan otomatis ke halaman mesin kasir
        router.push("/pos");
      } else {
        // Tampilkan pesan error dari backend
        setErrorMsg(data.error);
      }
    } catch (error) {
      setErrorMsg("Koneksi bermasalah, silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* Header Logo/Judul */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Kopi Saku</h2>
          <p className="text-gray-500 mt-2">Masuk untuk memulai shift Anda</p>
        </div>

        {/* Notifikasi Error */}
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <p className="text-red-700 text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition outline-none text-gray-700"
              placeholder="Masukkan username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition outline-none text-gray-700"
              placeholder="Masukkan password"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl text-white font-bold text-lg shadow-md transition-all ${
              isLoading ? "bg-amber-400 cursor-not-allowed" : "bg-amber-700 hover:bg-amber-800 hover:shadow-lg"
            }`}
          >
            {isLoading ? "Memeriksa..." : "MASUK"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">© 2026 Kopi Saku. Developed By Yoga</p>
        </div>
      </div>
    </div>
  );
}