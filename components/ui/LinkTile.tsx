import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import styles from './LinkTile.module.scss';

interface LinkTileProps {
  href: string;
  label: string;
  description: string;
  icon?: LucideIcon;
}

/** Bo'lim indeks sahifalari uchun umumiy kartochka (masalan /aloqalar, /jamoa). */
export default function LinkTile({ href, label, description, icon: Icon }: LinkTileProps) {
  return (
    <Link href={href} className={styles.tile}>
      {Icon && <Icon className={styles.icon} size={22} strokeWidth={1.6} />}
      <div className={styles.text}>
        <h4>{label}</h4>
        <p>{description}</p>
      </div>
      <ArrowRight size={16} className={styles.arrow} />
    </Link>
  );
}
