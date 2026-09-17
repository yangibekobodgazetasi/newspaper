'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { setApiErrorHandler } from '@/lib/api';
import styles from './Toast.module.scss';

type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info } as const;

/** Xato uzoqroq turadi — odam o'qib ulgurishi kerak. */
const DURATIONS: Record<ToastTone, number> = { success: 3200, error: 5200, info: 4000 };

/** Shu oraliqda AYNAN bir xil xabar takrorlansa, yangi toast ochilmaydi. */
const DEDUPE_WINDOW_MS = 4000;

/**
 * Butun admin panel uchun YAGONA bildirishnoma tizimi.
 *
 * Ikki yo'l bilan ishlaydi:
 *  1. `useToast()` — muvaffaqiyatli amallar uchun (yaratildi/saqlandi/o'chirildi).
 *  2. API xatolari — `lib/api.ts` shu yerga ulanadi va har qanday muvaffaqiyatsiz
 *     so'rov (401/403/404/409/422/429/500, tarmoq xatosi) avtomatik ko'rsatiladi.
 *     Ya'ni komponentlar xatoni qo'lda ushlab, o'zicha ko'rsatishi SHART EMAS.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  // Oxirgi ko'rsatilgan xabarlar — takrorlanishning oldini olish uchun.
  const recent = useRef(new Map<string, number>());
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((tone: ToastTone, message: string) => {
    const text = message.trim();
    if (!text) return;

    const key = `${tone}:${text}`;
    const now = Date.now();
    const lastShown = recent.current.get(key);
    if (lastShown && now - lastShown < DEDUPE_WINDOW_MS) return;
    recent.current.set(key, now);

    const id = nextId.current++;
    setItems((list) => [...list, { id, tone, message: text }]);

    const timer = setTimeout(() => {
      dismiss(id);
      timers.current.delete(timer);
    }, DURATIONS[tone]);
    timers.current.add(timer);
  }, [dismiss]);

  const api = useMemo<ToastApi>(() => ({
    success: (m: string) => push('success', m),
    error: (m: string) => push('error', m),
    info: (m: string) => push('info', m),
  }), [push]);

  // API qatlamini shu tizimga ulaymiz.
  useEffect(() => {
    setApiErrorHandler((err) => push('error', err.message));
    return () => setApiErrorHandler(null);
  }, [push]);

  // Komponent yo'q qilinganda osilib qolgan taymerlarni tozalaymiz.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* `aria-live` — skrinrider yangi xabarni o'qiydi */}
      <div className={styles.stack} role="status" aria-live="polite">
        {items.map((item) => {
          const Icon = ICONS[item.tone];
          return (
            <div key={item.id} className={`${styles.toast} ${styles[item.tone]}`}>
              <Icon size={17} className={styles.icon} />
              <span className={styles.message}>{item.message}</span>
              <button
                className={styles.close}
                onClick={() => dismiss(item.id)}
                aria-label="Yopish"
                type="button"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast faqat <ToastProvider> ichida ishlatiladi');
  return ctx;
}
