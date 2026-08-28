import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/layout/SiteShell";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="text-sm font-medium text-[color:var(--sea)]">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 text-[color:var(--muted)]">
        This route is not part of the Phase 1 scaffold.
      </p>
      <div className="mt-8">
        <ButtonLink href="/">Back to home</ButtonLink>
      </div>
    </Container>
  );
}
