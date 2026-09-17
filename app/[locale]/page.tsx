import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { MessageSquareText, HelpCircle, BarChart3, Info } from 'lucide-react';
import { SITE_NAME, buildMetadata } from '@/lib/seo';
import Hero from '@/components/cards/Hero';
import SectionHead from '@/components/ui/SectionHead';
import FilterableNewsSection from '@/components/news/FilterableNewsSection';
import Widget from '@/components/cards/Widget';
import ServiceCard from '@/components/cards/ServiceCard';
import ArchiveStrip from '@/components/cards/ArchiveStrip';
import StatsWidget from '@/components/cards/StatsWidget';
import TrendingWidget from '@/components/cards/TrendingWidget';
import TeamCard from '@/components/cards/TeamCard';
import Button from '@/components/ui/Button';

import { getNewsByCategory, getFeaturedNews } from '@/lib/news';
import { getSortedIssues } from '@/lib/issues';
import { getTeam } from '@/lib/team';
import { getHomePromo, getHomeStats } from '@/lib/home';

import styles from './page.module.scss';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: HomePageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale });
  return {
    ...buildMetadata({
      locale,
      path: '/',
      title: `${SITE_NAME} — ${t('masthead.tagline')}`,
      description: t('seo.home.description'),
    }),
    title: { absolute: `${SITE_NAME} — ${t('masthead.tagline')}` },
  };
}

export default async function HomePage(props: HomePageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations();

  const [kundalik, featured, rahbariyat, elonlar, issues, team, promo, stats] = await Promise.all([
    getNewsByCategory('kundalik-yangiliklar', 24, locale),
    getFeaturedNews(locale),
    getNewsByCategory('rahbariyat-bayonotlari', 24, locale),
    getNewsByCategory('elonlar', 24, locale),
    getSortedIssues(),
    getTeam(locale),
    getHomePromo(locale),
    getHomeStats(),
  ]);

  // Hero karuseli: "Bosh material" deb belgilangan yangiliklar; bo'lmasa kundalikdagi birinchisi bilan almashtiramiz
  const heroSlides = featured.length > 0 ? featured : kundalik.slice(0, 1);
  const sideStories = kundalik.filter((n) => !heroSlides.some((h) => h.id === n.id)).slice(0, 3);
  const trending = kundalik.slice(0, 4);

  return (
    <>
      <main className={styles.main}>
        <Hero slides={heroSlides} latestIssue={issues[0]} sideStories={sideStories} />

        <div className={styles.newsLayout}>
          <div>
            <SectionHead title={t('home.dailyNews')} seeAllHref="/yangiliklar/kundalik-yangiliklar" />
            <FilterableNewsSection items={kundalik} />
          </div>

          <div>
            <Widget
              title={t('home.leadershipStatements')}
              variant="video"
              seeAllHref="/yangiliklar/rahbariyat-bayonotlari"
              items={rahbariyat.slice(0, 3).map((n) => ({
                href: `/yangiliklar/rahbariyat-bayonotlari/${n.slug}`,
                title: n.title,
                meta: n.publishedAt,
              }))}
            />
            <Widget
              title={t('home.announcements')}
              variant="timeline"
              seeAllHref="/yangiliklar/elonlar"
              items={elonlar.slice(0, 3).map((n) => ({
                href: `/yangiliklar/elonlar/${n.slug}`,
                title: n.title,
                meta: n.publishedAt,
              }))}
            />
            <Widget title={t('nav.servicesSubscribe')}>
              <p className={styles.subscribeText}>
                {t('home.subscribeWidgetText')}
              </p>
              <Button href="/xizmatlar/obuna" variant="primary" fullWidth>{t('common.subscribe')}</Button>
            </Widget>
          </div>
        </div>

        <div className={styles.servicesLayout}>
          <div>
            <SectionHead title={t('home.interactiveServices')} seeAllHref="/xizmatlar" />
            <div className={styles.services}>
              <ServiceCard color="green" icon={BarChart3} title={t('nav.servicesSurvey')} description={t('home.surveyDescription')} href="/xizmatlar/sorov" />
              <ServiceCard color="blue" icon={MessageSquareText} title={t('nav.servicesForum')} description={t('home.forumDescription')} href="/xizmatlar/forum" />
              <ServiceCard color="purple" icon={HelpCircle} title={t('nav.servicesQa')} description={t('home.qaDescription')} href="/xizmatlar/savol-javob" />
              <ServiceCard color="orange" icon={Info} title={t('services.faqShort')} description={t('home.faqDescription')} href="/xizmatlar/ttbs" />
            </div>
          </div>
          <div className={styles.trendingWrap}>
            <TrendingWidget items={trending} />
          </div>
        </div>
      </main>

      <div className={styles.archiveWrap}>
        <ArchiveStrip issues={issues.slice(0, 8)} promo={promo} />
        <StatsWidget
          stats={[
            { label: t('home.discussions'), value: stats.discussions },
            { label: t('home.subscribers'), value: stats.subscribers },
          ]}
        />
      </div>

      <main className={styles.main} style={{ paddingTop: 0 }}>
        <SectionHead title={t('home.ourTeam')} seeAllHref="/jamoa" seeAllLabel={t('home.fullTeam')} />
        <div className={styles.team}>
          {team.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>
      </main>
    </>
  );
}
