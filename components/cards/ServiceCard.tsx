import { Link } from '@/i18n/navigation';
import type { LucideIcon } from 'lucide-react';
import styles from './ServiceCard.module.scss';

type ServiceColor = 'green' | 'blue' | 'purple' | 'orange';

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  color?: ServiceColor;
}

export default function ServiceCard({ icon: Icon, title, description, href, color = 'blue' }: ServiceCardProps) {
  return (
    <Link href={href} className={styles.card}>
      <span className={`${styles.iconWrap} ${styles[color]}`}>
        <Icon size={22} strokeWidth={2} />
      </span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.desc}>{description}</p>
    </Link>
  );
}
