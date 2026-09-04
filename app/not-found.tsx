"use client";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/layout/SiteShell";
import { useLanguage } from "@/contexts/language-context";

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <Container className="py-24 text-center">
      <p className="text-sm font-medium text-[color:var(--sea)]">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t("errors.pageNotFound")}</h1>
      <p className="mt-3 text-[color:var(--muted)]">
        {t("errors.pageNotFound")}
      </p>
      <div className="mt-8">
        <ButtonLink href="/">{t("errors.home")}</ButtonLink>
      </div>
    </Container>
  );
}
