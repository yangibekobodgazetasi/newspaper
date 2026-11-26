'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { ChevronDown, Menu, MoreHorizontal, X, Home, Send } from 'lucide-react';
import { navigation } from '@/data/navigation';
import type { NavItem as NavItemType } from '@/types';
import styles from './Nav.module.scss';

/**
 * "Priority+" navigatsiya: 768px (tablet) dan 1400px+ gacha bo'lgan oraliqda
 * menyu to'liq sig'maganda oxirgi bandlar birma-bir "..." menyusiga tushadi —
 * hamburger'ga to'g'ridan-to'g'ri sakrab o'tish o'rniga.
 *
 * Ishlash tartibi: ko'rinmas o'lchov qatori (`measureRef`) har bir bandning
 * "tabiiy" (siqilmagan) kengligini beradi — bu kengliklar konteyner qanchalik
 * torayishidan qat'i nazar o'zgarmaydi. Ko'rinadigan qator (`linksRef`) esa
 * `flex:1; min-width:0` tufayli haqiqiy mavjud joyni beradi. Ikkalasini
 * solishtirib, nechta band sig'ishini hisoblaymiz; qolganlari `overflowItems`
 * sifatida "..." tugmasi ostidagi ro'yxatga tushadi.
 */
export default function Nav() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const wrapRef = useRef<HTMLElement>(null);

  // SSR/hydratsiyada hammasi ko'rinadi deb hisoblanadi, JS o'lchagach to'g'rilanadi.
  const [visibleCount, setVisibleCount] = useState(navigation.length);

  const linksRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const recalc = useCallback(() => {
    const container = linksRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const available = container.offsetWidth;
    const measureChildren = Array.from(measure.children) as HTMLElement[];
    // Oxirgi element — faqat o'lchov uchun qo'shilgan "..." tugmasi namunasi.
    const moreWidth = measureChildren[measureChildren.length - 1]?.offsetWidth ?? 0;
    const widths = measureChildren.slice(0, -1).map((el) => el.offsetWidth);

    const total = widths.reduce((sum, w) => sum + w, 0);
    if (total <= available) {
      setVisibleCount(widths.length);
      return;
    }

    let sum = 0;
    let count = 0;
    for (let i = 0; i < widths.length; i++) {
      sum += widths[i];
      // "..." tugmasi uchun ham joy qoldirilishi kerak — bandlar oxirigacha sig'masa.
      if (sum + moreWidth > available) break;
      count = i + 1;
    }
    setVisibleCount(count);
  }, []);

  // ResizeObserver callback'i ichida to'g'ridan-to'g'ri `recalc()` chaqirilsa,
  // u DOM'ni (bandlar sonini) sinxron o'zgartiradi — bu esa BIR XIL kuzatuv
  // siklida yana bir marta o'lcham o'zgarishini keltirib chiqarishi mumkin.
  // Ketma-ket tez kelgan bir nechta bildirishnoma shu tufayli bir-birini
  // "yutib yuborib", oxirgi holat noto'g'ri (eskirgan) kengliklar asosida
  // hisoblanib qolishi mumkin edi. Har bir chaqiruvni keyingi animatsiya
  // kadriga kechiktirib, faqat ENG OXIRGISI ishga tushishini ta'minlaymiz.
  const scheduleRecalc = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      recalc();
    });
  }, [recalc]);

  useLayoutEffect(() => {
    recalc();
    const container = linksRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => scheduleRecalc());
    ro.observe(container);
    // `ResizeObserver` — asosiy signal, lekin qo'shimcha ishonchlilik uchun
    // oyna `resize` hodisasi ham zaxira sifatida tinglanadi (masalan brauzer
    // ekran kattaligini o'zgartirish sabablari ResizeObserver kutayotgan
    // "kuzatilayotgan elementning o'zi" emas, balki faqat oynaning o'zi bo'lsa).
    window.addEventListener('resize', scheduleRecalc);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', scheduleRecalc);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [recalc, scheduleRecalc]);

  // Til almashganda bandlar matni (demak kengligi) o'zgaradi, lekin konteyner
  // o'lchami o'zgarmasligi mumkin — ResizeObserver bunda ishga tushmaydi,
  // shuning uchun qayta hisoblashni qo'lda ham chaqiramiz.
  useEffect(() => {
    scheduleRecalc();
  }, [locale, scheduleRecalc]);

  useEffect(() => {
    if (!moreOpen) return;
    function onDocClick(e: MouseEvent) {
      if (e.target instanceof Node && moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMoreOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [moreOpen]);

  // `position: sticky; top: 0` bo'lgan nav tepaga yopishganda uning `top` qiymati 0 bo'ladi.
  useEffect(() => {
    const update = () => {
      const top = wrapRef.current?.getBoundingClientRect().top ?? 1;
      setStuck(top <= 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const visibleItems = navigation.slice(0, visibleCount);
  const overflowItems = navigation.slice(visibleCount);

  return (
    <nav ref={wrapRef} className={`${styles.navWrap} ${stuck ? styles.stuck : ''}`}>
      <div className={styles.nav}>
        <button className={styles.burger} onClick={() => setMobileOpen(true)} aria-label={t('common.menu')}>
          <Menu size={20} />
        </button>

        <div className={styles.links} ref={linksRef}>
          {visibleItems.map((item, i) => (
            <NavItem key={item.href} item={item} pathname={pathname} isFirst={i === 0} />
          ))}

          {overflowItems.length > 0 && (
            <div className={`${styles.item} ${styles.more}`} ref={moreRef}>
              <button onClick={() => setMoreOpen((v) => !v)} aria-expanded={moreOpen} aria-label={t('common.more')}>
                <MoreHorizontal size={16} />
              </button>
              <div className={`${styles.dropdown} ${moreOpen ? styles.open : ''}`}>
                {overflowItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)}>
                    {t(`nav.${item.labelKey}`)}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Ko'rinmas o'lchov qatori: real bandlar bilan bir xil uslub/shrift,
              lekin ekranda ko'rinmaydi va bosib bo'lmaydi. Konteyner qanchalik
              torayishidan qat'i nazar har bir bandning haqiqiy (siqilmagan)
              kengligini o'lchash uchun kerak. */}
          <div className={styles.measure} ref={measureRef} aria-hidden="true">
            {navigation.map((item, i) => (
              <NavItem key={item.href} item={item} pathname={pathname} isFirst={i === 0} />
            ))}
            <div className={`${styles.item} ${styles.more}`}>
              <button tabIndex={-1}>
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
        </div>

        <Link href="/aloqalar/murojaat" className={styles.cta}>
          <Send size={14} />
          {t('nav.submitRequest')}
        </Link>
      </div>

      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} pathname={pathname} />}
    </nav>
  );
}

function NavItem({ item, pathname, isFirst }: { item: NavItemType; pathname: string; isFirst: boolean }) {
  const t = useTranslations('nav');
  const isCurrent = pathname === item.href;

  return (
    <div className={`${styles.item} ${isCurrent ? styles.current : ''}`}>
      {item.children ? (
        <button>
          {t(item.labelKey)} <ChevronDown size={12} className={styles.caret} />
        </button>
      ) : (
        <Link href={item.href}>
          {isFirst && <Home size={14} />}
          {t(item.labelKey)}
        </Link>
      )}

      {item.children && (
        <div className={styles.dropdown}>
          {item.children.map((child) => (
            <Link key={child.href} href={child.href}>{t(child.labelKey)}</Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileMenu({ onClose, pathname }: { onClose: () => void; pathname: string }) {
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');

  return (
    <div className={styles.mobileMenu}>
      <div className={styles.mobileHeader}>
        <span>{tCommon('menu')}</span>
        <button onClick={onClose} aria-label={tCommon('close')}><X size={22} /></button>
      </div>
      <div className={styles.mobileLinks}>
        {navigation.map((item) => (
          <div key={item.href} className={styles.mobileGroup}>
            <Link href={item.href} onClick={onClose} className={pathname === item.href ? styles.mobileCurrent : ''}>
              {tNav(item.labelKey)}
            </Link>
            {item.children && (
              <div className={styles.mobileChildren}>
                {item.children.map((child) => (
                  <Link key={child.href} href={child.href} onClick={onClose}>{tNav(child.labelKey)}</Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
