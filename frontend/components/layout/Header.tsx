import UtilityBar from './UtilityBar';
import Masthead from './Masthead';
import Nav from './Nav';

interface HeaderProps {
  /** Oxirgi son qatori — RootLayout bazadan olib uzatadi. */
  issueLine?: string;
}

/**
 * Header barcha sahifalarda bir xil — RootLayout ichida bir marta chaqiriladi.
 *
 * MUHIM: `<Nav>` ataylab `<header>` DAN TASHQARIDA turadi. `Nav.module.scss` dagi
 * `position: sticky` ishlashi uchun uning containing block'i skroll qilinadigan
 * sohani qamrab olishi shart. `<header>` balandligi aynan uchta bolasiga teng
 * bo'lgani uchun nav "yopishib turadigan" masofa nolga teng bo'lib qolar edi —
 * ya'ni sticky CSS'i bor edi, lekin hech qachon ishlamasdi.
 * `<nav>` HTML'da body'ning bevosita bolasi sifatida to'liq valid landmark.
 */
export default function Header(props: HeaderProps) {
  return (
    <>
      <header>
        <UtilityBar />
        <Masthead {...props} />
      </header>
      <Nav />
    </>
  );
}
