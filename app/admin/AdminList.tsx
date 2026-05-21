"use client";

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { LeadStatus, LeadWithBuild } from "@/lib/supabase";

type RealtimeLeadRow = {
  id: string;
  name: string;
  phone: string;
};

function playNotificationBeep() {
  try {
    const AudioContextClass = window.AudioContext ?? (window as Window & {
      webkitAudioContext?: typeof AudioContext;
    }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 880;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.45);
  } catch {
    // ignore audio errors
  }
}

function showBrowserNotification(lead: RealtimeLeadRow) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    return;
  }
  try {
    new Notification("Новая заявка", {
      body: `${lead.name} — ${lead.phone}`,
      tag: `lead-${lead.id}`,
    });
  } catch {
    // ignore notification errors
  }
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Готово",
};

const STATUS_BADGE_CLASSES: Record<LeadStatus, string> = {
  new: "bg-accent/15 text-accent",
  in_progress: "bg-yellow-500/15 text-yellow-300",
  done: "bg-emerald-500/15 text-emerald-300",
};

const NEXT_STATUS: Record<LeadStatus, LeadStatus | null> = {
  new: "in_progress",
  in_progress: "done",
  done: null,
};

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "Asia/Yekaterinburg",
  dateStyle: "short",
  timeStyle: "short",
});

type Filters = { status?: string; kind?: string };

function FilterPill({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-xs transition ${
        active
          ? "bg-accent text-white"
          : "bg-white/5 text-white/70 hover:bg-white/10"
      }`}
    >
      {label}
    </Link>
  );
}

export function AdminList({
  leads,
  filters,
}: {
  leads: LeadWithBuild[];
  filters: Filters;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const highlightTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {
        // ignore permission errors
      });
    }
  }, []);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return;

    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const channel = supabase
      .channel("leads-inserts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leads" },
        (payload) => {
          const lead = payload.new as RealtimeLeadRow;
          playNotificationBeep();
          showBrowserNotification(lead);

          setHighlightedIds((current) => {
            const next = new Set(current);
            next.add(lead.id);
            return next;
          });

          const existing = highlightTimers.current.get(lead.id);
          if (existing) clearTimeout(existing);
          const timer = setTimeout(() => {
            setHighlightedIds((current) => {
              const next = new Set(current);
              next.delete(lead.id);
              return next;
            });
            highlightTimers.current.delete(lead.id);
          }, 5000);
          highlightTimers.current.set(lead.id, timer);

          router.refresh();
        },
      )
      .subscribe();

    return () => {
      const timersSnapshot = highlightTimers.current;
      timersSnapshot.forEach((timer) => clearTimeout(timer));
      timersSnapshot.clear();
      supabase.removeChannel(channel);
    };
  }, [router]);

  const buildHref = (key: "status" | "kind", value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const query = params.toString();
    return query ? `/admin?${query}` : "/admin";
  };

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    setPendingId(id);
    try {
      const response = await fetch(`/api/admin/leads/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        router.refresh();
      }
    } finally {
      setPendingId(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-medium text-white">Заявки</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-white/60 transition hover:text-white"
          >
            Выйти
          </button>
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-white/40">Статус:</span>
            <FilterPill
              href={buildHref("status", null)}
              label="Все"
              active={!filters.status}
            />
            {(["new", "in_progress", "done"] as LeadStatus[]).map((status) => (
              <FilterPill
                key={status}
                href={buildHref("status", status)}
                label={STATUS_LABELS[status]}
                active={filters.status === status}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-white/40">Тип:</span>
            <FilterPill
              href={buildHref("kind", null)}
              label="Все"
              active={!filters.kind}
            />
            <FilterPill
              href={buildHref("kind", "repair")}
              label="Ремонт"
              active={filters.kind === "repair"}
            />
            <FilterPill
              href={buildHref("kind", "order")}
              label="Заказ сборки"
              active={filters.kind === "order"}
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl bg-[#131313] shadow-frame">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-white/40">
                <th className="p-4">Дата</th>
                <th className="p-4">Имя</th>
                <th className="p-4">Телефон</th>
                <th className="p-4">Сборка</th>
                <th className="p-4">Статус</th>
                <th className="p-4 text-right">Действие</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const next = NEXT_STATUS[lead.status];
                const isHighlighted = highlightedIds.has(lead.id);
                return (
                  <tr
                    key={lead.id}
                    className={`border-t border-white/5 text-sm transition-colors duration-700 ${
                      isHighlighted ? "bg-accent/10" : ""
                    }`}
                  >
                    <td className="p-4 text-white/70">
                      {dateFormatter.format(new Date(lead.created_at))}
                    </td>
                    <td className="p-4 text-white">{lead.name}</td>
                    <td className="p-4 font-mono text-white/85">{lead.phone}</td>
                    <td className="p-4">
                      {lead.build ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-accent">{lead.build.sku}</span>
                          <span className="text-xs text-white/50">
                            {lead.build.cpu} / {lead.build.gpu}
                          </span>
                        </div>
                      ) : (
                        <span className="text-white/40">— ремонт</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${STATUS_BADGE_CLASSES[lead.status]}`}
                      >
                        {STATUS_LABELS[lead.status]}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {next ? (
                        <button
                          type="button"
                          disabled={pendingId === lead.id}
                          onClick={() => handleStatusChange(lead.id, next)}
                          className="rounded-full bg-accent px-4 py-2 text-xs text-white transition hover:bg-accent/85 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          → {STATUS_LABELS[next]}
                        </button>
                      ) : (
                        <span className="text-xs text-white/30">завершено</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {leads.length === 0 ? (
            <p className="p-8 text-center text-white/40">Заявок нет</p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
