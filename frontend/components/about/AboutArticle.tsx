import type { ReactNode } from 'react';
import styles from './AboutArticle.module.scss';

interface AboutArticleProps {
  title: string;
  intro: string;
  body: string[];
  children?: ReactNode; // goals ro'yxati, hamkorlar grid va h.k. uchun maxsus blok
}

/** "Gazeta haqida"ning barcha 4 sahifasida ishlatiladigan umumiy maqola qobig'i — DRY. */
export default function AboutArticle({ title, intro, body, children }: AboutArticleProps) {
  return (
    <article>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.intro}>{intro}</p>
      <div className={styles.body}>
        {body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
      {children}
    </article>
  );
}
