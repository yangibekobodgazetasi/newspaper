import { useLocale } from 'next-intl';
import { MessageCircle } from 'lucide-react';
import type { ForumTopic } from '@/types';
import { formatRelativeDate } from '@/lib/services';
import styles from './ForumTopicItem.module.scss';

export default function ForumTopicItem({ topic }: { topic: ForumTopic }) {
  const locale = useLocale();

  return (
    <div className={styles.item}>
      <div className={styles.head}>
        <h4>{topic.title}</h4>
        <span className={styles.replies}>
          <MessageCircle size={13} /> {topic.replyCount}
        </span>
      </div>
      <p className={styles.body}>{topic.body}</p>
      <div className={styles.meta}>
        <span>{topic.authorName}</span>
        <span>{formatRelativeDate(topic.createdAt, locale)}</span>
      </div>
    </div>
  );
}
