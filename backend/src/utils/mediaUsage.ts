import { prisma } from '../lib/prisma';

/**
 * Rasm qaysi yozuvlarda ishlatilayotganini sanaydi.
 *
 * MUHIM: `News.coverImage`, `Issue.coverImage`, `TeamMember.photo`, `MediaItem.imageUrl` —
 * bularning hammasi oddiy `String?` maydon, MediaAsset'ga foreign key EMAS. Ya'ni baza
 * darajasida hech qanday himoya yo'q: rasm o'chirilsa, o'sha yozuvlar mavjud bo'lmagan
 * faylga ishora qilib qoladi (dangling URL) va saytda buzilgan rasm ko'rinadi.
 * Shuning uchun referensial butunlik shu yerda, qo'lda tekshiriladi.
 *
 * Yangi rasm maydoni qo'shilsa, uni SHU RO'YXATGA HAM qo'shish kerak.
 *
 * `staticContent` — statik sahifalarning JSON tarkibi ichidagi rasmlar (hamkor
 * logotiplari, bosh sahifa promo foni). Ular alohida ustunda emas, `Json` blob ichida
 * yashaydi, shuning uchun ustun bo'yicha `count` qilib bo'lmaydi: jadval kichik
 * (bir necha o'nlab qator), shu sababli tarkib matn sifatida tekshiriladi.
 */
export async function countAssetUsages(url: string) {
  const [news, issues, team, gallery, staticRows] = await Promise.all([
    prisma.news.count({ where: { coverImage: url } }),
    prisma.issue.count({ where: { coverImage: url } }),
    prisma.teamMember.count({ where: { photo: url } }),
    prisma.mediaItem.count({ where: { imageUrl: url } }),
    prisma.staticContentTranslation.findMany({ select: { key: true, data: true } }),
  ]);

  const staticKeys = [
    ...new Set(
      staticRows
        .filter((row: { key: string; data: unknown }) => JSON.stringify(row.data ?? null).includes(url))
        .map((row: { key: string }) => row.key)
    ),
  ];
  const staticContent = staticKeys.length;

  const labels: string[] = [];
  if (news) labels.push(`${news} ta yangilik`);
  if (issues) labels.push(`${issues} ta gazeta soni`);
  if (team) labels.push(`${team} ta jamoa a'zosi`);
  if (gallery) labels.push(`${gallery} ta galereya fotolavhasi`);
  if (staticContent) labels.push(`${staticContent} ta sahifa tarkibi (${staticKeys.join(', ')})`);

  return {
    news,
    issues,
    team,
    gallery,
    staticContent,
    total: news + issues + team + gallery + staticContent,
    labels,
  };
}
