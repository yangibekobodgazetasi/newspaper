'use client';

import { useState } from 'react';

export interface FieldRule {
  required?: boolean;
  email?: boolean;
  pattern?: RegExp;
  message?: string; // pattern buzilganda ko'rsatiladigan maxsus xabar
}

const DEFAULT_MESSAGES = {
  required: "Bu maydon to'ldirilishi shart.",
  invalidEmail: 'Email manzili noto\'g\'ri formatda.',
  invalidPattern: "Format noto'g'ri kiritildi.",
};

/**
 * Admin panel formalarida native `required`/`pattern` brauzer popup'lari o'rniga
 * ilova ichida boshqariladigan validatsiya: input qizil border, FormField ostida
 * xabar, foydalanuvchi to'ldirganda xato holati avtomatik tozalanadi.
 */
export function useFormErrors(rules: Record<string, FieldRule>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(form: HTMLFormElement): boolean {
    const data = new FormData(form);
    const next: Record<string, string> = {};

    for (const [name, rule] of Object.entries(rules)) {
      const value = String(data.get(name) || '').trim();

      if (rule.required && !value) {
        next[name] = DEFAULT_MESSAGES.required;
      } else if (value && rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        next[name] = DEFAULT_MESSAGES.invalidEmail;
      } else if (value && rule.pattern && !rule.pattern.test(value)) {
        next[name] = rule.message ?? DEFAULT_MESSAGES.invalidPattern;
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function clearError(name: string) {
    setErrors((prev) => {
      if (!(name in prev)) return prev;
      const rest = { ...prev };
      delete rest[name];
      return rest;
    });
  }

  function reset() {
    setErrors({});
  }

  return { errors, validate, clearError, reset };
}
