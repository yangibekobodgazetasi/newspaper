import type { Metadata } from 'next';
import AboutArticle from '@/components/about/AboutArticle';
import { getAboutContent } from '@/lib/about';
import { buildMetadata } from '@/lib/seo';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: AboutPageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const content = await getAboutContent('umumiy', locale);
  return buildMetadata({ locale, path: '/gazeta-haqida', title: content.title, description: content.intro });
}

export default async function AboutPage(props: AboutPageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  const content = await getAboutContent('umumiy', locale);
  return <AboutArticle {...content} />;
}
