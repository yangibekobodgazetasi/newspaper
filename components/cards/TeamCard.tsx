import { BadgeCheck } from 'lucide-react';
import { resolveImageUrl } from '@/lib/api';
import type { TeamMember } from '@/types';
import styles from './TeamCard.module.scss';

interface TeamCardProps {
  member: TeamMember;
}

export default function TeamCard({ member }: TeamCardProps) {
  const photo = resolveImageUrl(member.photo);
  const initials = member.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className={styles.card}>
      <div className={styles.photoWrap}>
        {photo ? (
          <div className={styles.photo} style={{ backgroundImage: `url(${photo})` }} />
        ) : (
          <div className={styles.photoFallback}>{initials}</div>
        )}
        <BadgeCheck className={styles.verified} size={18} />
      </div>
      <h3 className={styles.name}>{member.name}</h3>
      <div className={styles.role}>{member.role}</div>
    </div>
  );
}
