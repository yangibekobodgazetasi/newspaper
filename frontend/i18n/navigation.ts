import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale-aware Link/router/pathname — Header, Nav, Footer va til-switcher
 * keyingi bosqichda `next/link`/`next/navigation` o'rniga shulardan foydalanadi.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
