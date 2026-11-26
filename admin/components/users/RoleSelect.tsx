'use client';

import { useState } from 'react';
import { ACTIVE_ADMIN_ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/lib/permissions';
import Select from '@/components/ui/Select';
import styles from './RoleSelect.module.scss';

interface RoleSelectProps {
  name: string;
  defaultValue?: string;
  invalid?: boolean;
  onChange?: () => void;
}

/**
 * Rol tanlash — FAQAT amaldagi 3 ta rol ko'rsatiladi (eskirgan DIZAYNER/MODERATOR
 * ro'yxatda yo'q). Tanlangan rolning nima qila olishi darhol tagida yoziladi:
 * rol nomining o'zi ("Muxbir") huquqlar haqida hech narsa aytmaydi va shu sababli
 * noto'g'ri rol berib qo'yish oson edi.
 */
export default function RoleSelect({ name, defaultValue, invalid, onChange }: RoleSelectProps) {
  const [role, setRole] = useState(defaultValue ?? ACTIVE_ADMIN_ROLES[0]);

  return (
    <>
      <Select
        name={name}
        defaultValue={defaultValue}
        invalid={invalid}
        onChange={(e) => {
          setRole(e.target.value);
          onChange?.();
        }}
      >
        {ACTIVE_ADMIN_ROLES.map((value) => (
          <option key={value} value={value}>{ROLE_LABELS[value]}</option>
        ))}
      </Select>
      <p className={styles.description}>{ROLE_DESCRIPTIONS[role]}</p>
    </>
  );
}
