"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const REPO_URL = "https://github.com/MuhammadNiazAli/nextjs-supabase-starter";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  const productLinks: FooterLink[] = [
    { label: t("navbar.pricing"), href: "/pricing" },
    { label: t("navbar.login"), href: "/login" },
    { label: t("navbar.signup"), href: "/signup" },
  ];

  const resourceLinks: FooterLink[] = [
    { label: t("footer.links.docs"), href: `${REPO_URL}#readme`, external: true },
    { label: t("footer.links.license"), href: `${REPO_URL}/blob/main/LICENSE`, external: true },
    {
      label: t("footer.links.codeOfConduct"),
      href: `${REPO_URL}/blob/main/CODE_OF_CONDUCT.md`,
      external: true,
    },
  ];

  const communityLinks: FooterLink[] = [
    {
      label: t("footer.links.contribute"),
      href: `${REPO_URL}/blob/main/CONTRIBUTING.md`,
      external: true,
    },
    { label: t("footer.links.issues"), href: `${REPO_URL}/issues`, external: true },
    { label: t("footer.links.discussions"), href: `${REPO_URL}/discussions`, external: true },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t-4 border-primary bg-gray-950 text-gray-300">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-x-10">
          <div className="footer-col col-span-2 md:col-span-1" style={{ animationDelay: "0ms" }}>
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-extrabold text-white">
              {t("navbar.brand")}
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-400">
              {t("footer.tagline")}
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              <SocialLink href={REPO_URL} label="GitHub">
                <GithubIcon className="h-4 w-4" />
              </SocialLink>
              <SocialLink href={`${REPO_URL}/issues`} label="Issues">
                <IssueIcon className="h-4 w-4" />
              </SocialLink>
              <SocialLink href={`${REPO_URL}/discussions`} label="Discussions">
                <ChatIcon className="h-4 w-4" />
              </SocialLink>
            </div>
          </div>

          <FooterColumn title={t("footer.columns.product")} links={productLinks} delay={80} />
          <FooterColumn title={t("footer.columns.resources")} links={resourceLinks} delay={140} />
          <FooterColumn title={t("footer.columns.community")} links={communityLinks} delay={200} />
        </div>

        <div
          className="footer-col mt-12 flex flex-col items-center gap-5 border-t border-white/10 pt-6 text-center sm:flex-row sm:justify-between sm:text-left"
          style={{ animationDelay: "240ms" }}
        >
          <p className="text-xs text-gray-500">
            &copy; {year} {t("navbar.brand")}. {t("footer.text")}
          </p>

          <div className="flex items-center gap-3">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-gray-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-white"
            >
              <GithubIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12" />
              {t("footer.starOnGithub")}
            </a>
            <button
              type="button"
              onClick={scrollToTop}
              aria-label={t("footer.backToTop")}
              className="group inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-gray-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-white"
            >
              <ArrowUpIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  delay,
}: {
  title: string;
  links: FooterLink[];
  delay: number;
}) {
  return (
    <div className="footer-col" style={{ animationDelay: `${delay}ms` }}>
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">
        {title}
      </h3>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 transition-colors duration-200 hover:text-white"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-sm text-gray-400 transition-colors duration-200 hover:text-white"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-gray-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-white"
    >
      {children}
    </a>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 5.02 3.26 9.28 7.77 10.78.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.16.69-3.83-1.34-3.83-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.73 2.65 1.23 3.3.94.1-.73.4-1.23.72-1.51-2.52-.29-5.17-1.26-5.17-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.16a10.9 10.9 0 0 1 5.73 0c2.19-1.47 3.15-1.16 3.15-1.16.62 1.57.23 2.73.11 3.02.73.79 1.17 1.8 1.17 3.04 0 4.35-2.66 5.31-5.19 5.59.41.35.77 1.04.77 2.1 0 1.52-.01 2.74-.01 3.11 0 .3.2.66.79.55A11.26 11.26 0 0 0 23.25 11.75C23.25 5.48 18.27.5 12 .5Z" />
    </svg>
  );
}

function IssueIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7.5v5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="16.3" r="0.9" fill="currentColor" />
    </svg>
  );
}

function ChatIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 19V5m0 0-6 6m6-6 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
