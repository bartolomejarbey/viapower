import { getCompany } from "@/lib/company";

export async function JsonLd() {
  const company = await getCompany();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${company.url}/#organization`,
        name: company.legalName,
        alternateName: company.name,
        url: company.url,
        email: company.email,
        telephone: company.phone,
        foundingDate: String(company.founded),
        address: {
          "@type": "PostalAddress",
          streetAddress: company.address.street,
          addressLocality: company.address.city,
          postalCode: company.address.zip,
          addressCountry: "CZ",
        },
        sameAs: [company.facebook],
      },
      {
        "@type": "LocalBusiness",
        "@id": `${company.url}/#localbusiness`,
        name: company.name,
        image: company.image.startsWith("http") ? company.image : `${company.url}${company.image}`,
        url: company.url,
        telephone: company.phone,
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          streetAddress: company.address.street,
          addressLocality: company.address.city,
          postalCode: company.address.zip,
          addressCountry: "CZ",
        },
        areaServed: "CZ",
      },
      {
        "@type": "WebSite",
        "@id": `${company.url}/#website`,
        url: company.url,
        name: company.name,
        inLanguage: "cs-CZ",
        publisher: { "@id": `${company.url}/#organization` },
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
