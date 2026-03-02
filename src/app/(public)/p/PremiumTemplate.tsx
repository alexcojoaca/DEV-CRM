"use client";

import { useState, useEffect } from "react";
import { getSiteConfig } from "@/features/site/siteConfig";
import type { Property } from "@/features/properties/propertyTypes";
import {
  Hero,
  SiteHeader,
  FeaturedProperties,
  AboutAgent,
  Testimonials,
  CTASection,
  Footer,
} from "@/components/site";

export function PremiumTemplate() {
  const [config, setConfig] = useState(getSiteConfig());

  useEffect(() => {
    setConfig(getSiteConfig());
  }, []);

  const {
    logoDataUrl,
    coverImageDataUrl,
    agencyName,
    agencyPhone,
    agencyEmail,
    aboutAgency,
    properties,
    teamMembers,
  } = config;

  const featuredList = properties.filter(
    (p: Property) => (p as Property & { featuredOnSite?: boolean }).featuredOnSite
  ).slice(0, 6);

  const firstAgent = teamMembers[0];
  const navLinks = [
    { label: "Proprietăți", href: "#proprietati" },
    { label: "Despre", href: "#despre" },
    { label: "Contact", href: "#contact" },
  ];

  const footerLinks = [
    { label: "Proprietăți", href: "#proprietati" },
    { label: "Despre noi", href: "#despre" },
    { label: "Contact", href: "#contact" },
  ];

  const testimonials = [
    {
      quote: "Profesionalism și atenție la detalii. Am găsit exact ce căutam.",
      author: "Maria P.",
      role: "Cumpărător",
    },
    {
      quote: "Recomand cu căldură. Echipa a fost mereu disponibilă și eficientă.",
      author: "Andrei M.",
      role: "Proprietar",
    },
  ];

  return (
    <>
      <SiteHeader
        agencyName={agencyName || "Agenția Mea"}
        logoUrl={logoDataUrl}
        phone={agencyPhone}
        navLinks={navLinks}
        ctaLabel="Sună"
        ctaHref={agencyPhone ? `tel:${agencyPhone.replace(/\s/g, "")}` : "#contact"}
      />

      <Hero
        headline="Găsește-ți locuința ideală"
        subheadline={
          aboutAgency
            ? aboutAgency.slice(0, 120) + (aboutAgency.length > 120 ? "..." : "")
            : "Oferte selectate. Suntem alături de tine la fiecare pas."
        }
        backgroundImage={coverImageDataUrl}
        searchPlaceholder="Locație, zonă sau oraș"
        primaryCtaLabel="Caută proprietăți"
        primaryCtaHref="#proprietati"
        secondaryCtaLabel="Contact"
        secondaryCtaHref="#contact"
        showScrollIndicator
      />

      <section id="proprietati">
        <FeaturedProperties
          title="Proprietăți selectate"
          subtitle="Descoperă oferte actualizate, cu prezentări de calitate și suport dedicat."
          properties={featuredList.length > 0 ? featuredList : properties.slice(0, 6)}
        />
      </section>

      {firstAgent && (
        <section id="despre">
          <AboutAgent
            name={firstAgent.name}
            role={firstAgent.role}
            imageUrl={firstAgent.avatarDataUrl}
            bio={aboutAgency || "Agent imobiliar dedicat, cu experiență în vânzări și închirieri."}
            trustIndicators={[
              { label: "Tranzacții finalizate", value: "200+" },
              { label: "Ani experiență", value: "10+" },
            ]}
          />
        </section>
      )}

      <Testimonials title="Ce spun clienții" items={testimonials} />

      <CTASection
        headline="Gata să începi?"
        subheadline="Spune-ne ce cauți și te ajutăm să găsești locuința potrivită."
        primaryLabel="Contactează-ne"
        primaryHref="#contact"
        secondaryLabel="Vezi toate ofertele"
        secondaryHref="#proprietati"
        variant="dark"
      />

      <Footer
        agencyName={agencyName || "Agenția Mea"}
        phone={agencyPhone}
        email={agencyEmail}
        links={footerLinks}
      />
    </>
  );
}
