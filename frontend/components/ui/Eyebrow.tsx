import type { ReactNode, ElementType } from 'react';
import styles from './Eyebrow.module.scss';

interface EyebrowProps {
  children: ReactNode;
  as?: ElementType;
}

export default function Eyebrow({ children, as: Tag = 'span' }: EyebrowProps) {
  return <Tag className={styles.eyebrow}>{children}</Tag>;
}
