import type { Metadata } from 'next';
import { Building2 } from 'lucide-react';
import AboutArticle from '@/components/about/AboutArticle';
import { getAboutContent } from '@/lib/about';
import { resolveImageUrl } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import styles from './page.module.scss';

interface PartnershipPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: PartnershipPageProps): Promise<Metadata> {
  const content = await getAboutContent('hamkorlik', locale);
  return buildMetadata({ locale, path: '/gazeta-haqida/hamkorlik', title: content.title, description: content.intro });
}

export default async function PartnershipPage({ params: { locale } }: PartnershipPageProps) {
  const content = await getAboutContent('hamkorlik', locale);
  return (
    <AboutArticle {...content}>
      {content.partners && (
        <div className={styles.partners}>
          {content.partners.map((p) => {
            // Logotip admin panelda yuklangan bo'lsa — o'shani ko'rsatamiz,
            // bo'lmasa avvalgi standart ikonka saqlanadi (fallback yo'qotilmadi).
            const logo = resolveImageUrl(p.logo);
            return (
              <div key={p.id} className={styles.partner}>
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt={p.name} className={styles.logo} />
                ) : (
                  <Building2 size={20} className={styles.icon} strokeWidth={1.6} />
                )}
                <span>{p.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </AboutArticle>
  );
}
