"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        router.push("/admin");
        router.refresh();
        return;
      }

      const data = await response.json().catch(() => ({}));
      setError(data.message ?? "Неверный пароль");
    } catch {
      setError("Ошибка соединения");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-3xl bg-[#131313] p-8 shadow-frame"
      >
        <h1 className="text-2xl font-medium text-white">Вход в админку</h1>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Пароль"
          autoFocus
          autoComplete="current-password"
          className="w-full rounded-full border border-transparent bg-[#222] px-6 py-4 text-white outline-none transition placeholder:text-white/40 focus:border-accent"
        />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting || !password}
          className="pill-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          Войти
        </button>
      </form>
    </main>
  );
}
