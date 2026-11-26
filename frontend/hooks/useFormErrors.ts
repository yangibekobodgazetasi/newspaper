'use client';

import { useState } from 'react';

export interface FieldRule {
  required?: boolean;
  email?: boolean;
  pattern?: RegExp;
}

export interface ValidationMessages {
  required: string;
  invalidEmail: string;
  invalidPattern: string;
}

/**
 * Native `required`/`pattern` brauzer popup'lari o'rniga ilova ichida boshqariladigan
 * forma validatsiyasi: input qizil border, field ostida custom xabar, foydalanuvchi
 * to'ldirganda xato holati avtomatik tozalanadi.
 */
export function useFormErrors(rules: Record<string, FieldRule>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(form: HTMLFormElement, messages: ValidationMessages): boolean {
    const data = new FormData(form);
    const next: Record<string, string> = {};

    for (const [name, rule] of Object.entries(rules)) {
      const value = String(data.get(name) || '').trim();

      if (rule.required && !value) {
        next[name] = messages.required;
      } else if (value && rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        next[name] = messages.invalidEmail;
      } else if (value && rule.pattern && !rule.pattern.test(value)) {
        next[name] = messages.invalidPattern;
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
