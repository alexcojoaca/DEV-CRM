import { SiteThemeProvider } from "@/components/site";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteThemeProvider defaultTheme="minimal">{children}</SiteThemeProvider>;
}
