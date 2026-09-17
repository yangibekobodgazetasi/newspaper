import type { Metadata } from 'next';
import AboutArticle from '@/components/about/AboutArticle';
import { getAboutContent } from '@/lib/about';
import { buildMetadata } from '@/lib/seo';

interface AboutPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: AboutPageProps): Promise<Metadata> {
  const content = await getAboutContent('umumiy', locale);
  return buildMetadata({ locale, path: '/gazeta-haqida', title: content.title, description: content.intro });
}

export default async function AboutPage({ params: { locale } }: AboutPageProps) {
  const content = await getAboutContent('umumiy', locale);
  return <AboutArticle {...content} />;
}
