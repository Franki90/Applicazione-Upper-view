import bcrypt from "bcryptjs";
import {
  CouponBorderStyle,
  CouponLayout,
  CouponPattern,
  CouponType,
  OfferStatus,
  PrismaClient,
  Role,
  SubscriptionStatus
} from "@prisma/client";

const prisma = new PrismaClient();

const categorySeed = [
  {
    id: "food_restaurants",
    icon: "utensils",
    nameIt: "Food & Ristoranti",
    nameEn: "Food & Restaurants",
    nameDe: "Essen & Restaurants",
    nameFr: "Food & Restaurants",
    nameEs: "Comida y Restaurantes",
    descriptionIt: "Offerte per bar, ristoranti, aperitivi e delivery locale.",
    descriptionEn: "Deals for bars, restaurants, aperitivo spots, and local delivery.",
    descriptionDe: "Angebote fur Bars, Restaurants, Aperitivo und lokale Lieferung.",
    descriptionFr: "Offres pour bars, restaurants, aperitifs et livraison locale.",
    descriptionEs: "Ofertas para bares, restaurantes, aperitivos y delivery local."
  },
  {
    id: "shopping_retail",
    icon: "bag",
    nameIt: "Shopping & Retail",
    nameEn: "Shopping & Retail",
    nameDe: "Shopping & Einzelhandel",
    nameFr: "Shopping & Retail",
    nameEs: "Compras y Retail",
    descriptionIt: "Moda, accessori, tecnologia e negozi locali.",
    descriptionEn: "Fashion, accessories, tech, and local stores.",
    descriptionDe: "Mode, Accessoires, Technik und lokale Laden.",
    descriptionFr: "Mode, accessoires, tech et commerces locaux.",
    descriptionEs: "Moda, accesorios, tecnologia y tiendas locales."
  },
  {
    id: "beauty_personal_care",
    icon: "sparkles",
    nameIt: "Beauty & Personal Care",
    nameEn: "Beauty & Personal Care",
    nameDe: "Beauty & Pflege",
    nameFr: "Beaute & Soins",
    nameEs: "Belleza y Cuidado Personal",
    descriptionIt: "Saloni, estetica, benessere e trattamenti personal care.",
    descriptionEn: "Salons, beauty centers, wellness, and personal care services.",
    descriptionDe: "Salons, Kosmetik, Wellness und Pflegeleistungen.",
    descriptionFr: "Salons, esthetique, bien-etre et soins personnels.",
    descriptionEs: "Salones, estetica, bienestar y cuidado personal."
  },
  {
    id: "fitness_sports",
    icon: "dumbbell",
    nameIt: "Fitness & Sports",
    nameEn: "Fitness & Sports",
    nameDe: "Fitness & Sport",
    nameFr: "Fitness & Sports",
    nameEs: "Fitness y Deportes",
    descriptionIt: "Palestre, sport club, attivita outdoor e wellness fisico.",
    descriptionEn: "Gyms, sports clubs, outdoor activities, and physical wellness.",
    descriptionDe: "Fitnessstudios, Sportclubs, Outdoor-Aktivitaten und Wellness.",
    descriptionFr: "Salles, clubs sportifs, activites outdoor et bien-etre physique.",
    descriptionEs: "Gimnasios, clubes deportivos y actividades al aire libre."
  },
  {
    id: "professional_services",
    icon: "briefcase",
    nameIt: "Professional Services",
    nameEn: "Professional Services",
    nameDe: "Professionelle Services",
    nameFr: "Services Professionnels",
    nameEs: "Servicios Profesionales",
    descriptionIt: "Consulenza, professionisti e servizi specializzati.",
    descriptionEn: "Consulting, professionals, and specialized services.",
    descriptionDe: "Beratung, Fachleute und spezialisierte Dienstleistungen.",
    descriptionFr: "Conseil, professionnels et services specialises.",
    descriptionEs: "Consultoria, profesionales y servicios especializados."
  },
  {
    id: "home_living",
    icon: "home",
    nameIt: "Home & Living",
    nameEn: "Home & Living",
    nameDe: "Home & Living",
    nameFr: "Maison & Living",
    nameEs: "Hogar y Living",
    descriptionIt: "Arredo, casa, giardino e comfort quotidiano.",
    descriptionEn: "Furniture, home, garden, and everyday comfort.",
    descriptionDe: "Wohnen, Haus, Garten und alltaglicher Komfort.",
    descriptionFr: "Mobilier, maison, jardin et confort quotidien.",
    descriptionEs: "Muebles, hogar, jardin y confort diario."
  },
  {
    id: "mobility_automotive",
    icon: "car",
    nameIt: "Mobility & Automotive",
    nameEn: "Mobility & Automotive",
    nameDe: "Mobilitat & Automotive",
    nameFr: "Mobilite & Automobile",
    nameEs: "Movilidad y Automocion",
    descriptionIt: "Auto, mobilita urbana e servizi di trasporto.",
    descriptionEn: "Cars, urban mobility, and transportation services.",
    descriptionDe: "Autos, urbane Mobilitat und Transportdienste.",
    descriptionFr: "Voitures, mobilite urbaine et services de transport.",
    descriptionEs: "Autos, movilidad urbana y servicios de transporte."
  },
  {
    id: "education_work",
    icon: "book-open",
    nameIt: "Education & Work",
    nameEn: "Education & Work",
    nameDe: "Bildung & Arbeit",
    nameFr: "Education & Travail",
    nameEs: "Educacion y Trabajo",
    descriptionIt: "Corsi, formazione e strumenti professionali.",
    descriptionEn: "Courses, training, and professional tools.",
    descriptionDe: "Kurse, Ausbildung und berufliche Werkzeuge.",
    descriptionFr: "Cours, formation et outils professionnels.",
    descriptionEs: "Cursos, formacion y herramientas profesionales."
  },
  {
    id: "family_kids",
    icon: "baby",
    nameIt: "Family & Kids",
    nameEn: "Family & Kids",
    nameDe: "Familie & Kinder",
    nameFr: "Famille & Enfants",
    nameEs: "Familia y Ninos",
    descriptionIt: "Attivita, prodotti e servizi per famiglie e bambini.",
    descriptionEn: "Activities, products, and services for families and kids.",
    descriptionDe: "Aktivitaten, Produkte und Services fur Familien und Kinder.",
    descriptionFr: "Activites, produits et services pour familles et enfants.",
    descriptionEs: "Actividades, productos y servicios para familias y ninos."
  },
  {
    id: "events_leisure",
    icon: "ticket",
    nameIt: "Events & Leisure",
    nameEn: "Events & Leisure",
    nameDe: "Events & Freizeit",
    nameFr: "Evenements & Loisirs",
    nameEs: "Eventos y Ocio",
    descriptionIt: "Eventi, cultura, intrattenimento e tempo libero.",
    descriptionEn: "Events, culture, entertainment, and leisure.",
    descriptionDe: "Events, Kultur, Unterhaltung und Freizeit.",
    descriptionFr: "Evenements, culture, divertissement et loisirs.",
    descriptionEs: "Eventos, cultura, entretenimiento y ocio."
  },
  {
    id: "tourism_hospitality",
    icon: "plane",
    nameIt: "Tourism & Hospitality",
    nameEn: "Tourism & Hospitality",
    nameDe: "Tourismus & Hospitality",
    nameFr: "Tourisme & Hospitality",
    nameEs: "Turismo y Hospitalidad",
    descriptionIt: "Hotel, esperienze, viaggi e ospitalita in Ticino.",
    descriptionEn: "Hotels, experiences, travel, and hospitality in Ticino.",
    descriptionDe: "Hotels, Erlebnisse, Reisen und Gastfreundschaft im Tessin.",
    descriptionFr: "Hotels, experiences, voyages et hospitality au Tessin.",
    descriptionEs: "Hoteles, experiencias, viajes y hospitalidad en Ticino."
  },
  {
    id: "sustainability_local",
    icon: "leaf",
    nameIt: "Sustainability & Local",
    nameEn: "Sustainability & Local",
    nameDe: "Nachhaltigkeit & Lokal",
    nameFr: "Durabilite & Local",
    nameEs: "Sostenibilidad y Local",
    descriptionIt: "Brand locali, green economy e iniziative sostenibili.",
    descriptionEn: "Local brands, green economy, and sustainable initiatives.",
    descriptionDe: "Lokale Marken, Green Economy und nachhaltige Initiativen.",
    descriptionFr: "Marques locales, economie verte et initiatives durables.",
    descriptionEs: "Marcas locales, economia verde e iniciativas sostenibles."
  },
  {
    id: "job_opportunities",
    icon: "briefcase-business",
    nameIt: "Job Opportunities",
    nameEn: "Job Opportunities",
    nameDe: "Jobangebote",
    nameFr: "Opportunites d'emploi",
    nameEs: "Oportunidades Laborales",
    descriptionIt: "Posizioni aperte, collaborazioni e annunci lavoro.",
    descriptionEn: "Open positions, collaborations, and job listings.",
    descriptionDe: "Offene Stellen, Kooperationen und Jobanzeigen.",
    descriptionFr: "Postes ouverts, collaborations et offres d'emploi.",
    descriptionEs: "Vacantes, colaboraciones y ofertas de empleo."
  },
  {
    id: "business_partnerships",
    icon: "handshake",
    nameIt: "Business Partnerships",
    nameEn: "Business Partnerships",
    nameDe: "Business Partnerschaften",
    nameFr: "Partenariats Business",
    nameEs: "Alianzas Empresariales",
    descriptionIt: "Partnership commerciali, B2B e networking locale.",
    descriptionEn: "Commercial partnerships, B2B, and local networking.",
    descriptionDe: "Business-Partnerschaften, B2B und lokales Networking.",
    descriptionFr: "Partenariats commerciaux, B2B et networking local.",
    descriptionEs: "Alianzas comerciales, B2B y networking local."
  }
];

async function main() {
  for (const category of categorySeed) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: category,
      create: category
    });
  }

  const passwordHash = await bcrypt.hash("Pass12345", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ticino.market" },
    update: {},
    create: {
      email: "admin@ticino.market",
      name: "Admin Ticino",
      role: Role.ADMIN,
      passwordHash
    }
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@ticino.market" },
    update: {},
    create: {
      email: "customer@ticino.market",
      name: "Giulia Bianchi",
      role: Role.CUSTOMER,
      passwordHash,
      selectedCategoryIds: ["food_restaurants", "events_leisure", "sustainability_local"]
    }
  });

  const vendorUser = await prisma.user.upsert({
    where: { email: "vendor@ticino.market" },
    update: {},
    create: {
      email: "vendor@ticino.market",
      name: "Marco Bernasconi",
      role: Role.VENDOR,
      passwordHash
    }
  });

  const vendor = await prisma.vendorProfile.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      businessName: "Bistro Lago",
      description: "Aperitivi, brunch e local food sul lungolago.",
      category: "food",
      categoryIds: ["food_restaurants", "events_leisure"],
      address: "Riva A. Caccia 10",
      city: "Lugano",
      area: "Centro",
      phone: "+41 91 000 00 00",
      email: "vendor@ticino.market",
      website: "https://bistrolago.example",
      socialLinks: { instagram: "@bistrolago", facebook: "bistrolago" },
      openingHours: {
        mon: "09:00-22:00",
        tue: "09:00-22:00",
        wed: "09:00-22:00",
        thu: "09:00-23:00",
        fri: "09:00-23:00",
        sat: "10:00-23:00",
        sun: "10:00-20:00"
      },
      logoUrl: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=200&q=80",
      primaryColor: "#4F46E5",
      secondaryColor: "#22C55E",
      accentColor: "#06B6D4",
      backgroundColor: "#F9FAFB",
      latitude: 46.0037,
      longitude: 8.9511,
      isProfileCompleted: true
    }
  });

  await prisma.subscription.upsert({
    where: { vendorId: vendor.id },
    update: {
      status: SubscriptionStatus.ACTIVE,
      monthlyPriceCents: 2500,
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    },
    create: {
      vendorId: vendor.id,
      status: SubscriptionStatus.ACTIVE,
      monthlyPriceCents: 2500,
      currency: "CHF",
      startedAt: new Date(),
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    }
  });

  const createdOffers: { id: string; title: string }[] = [];

  const offers = [
    {
      title: "Aperitivo lago 2x1",
      category: "food",
      categoryIds: ["food_restaurants", "events_leisure"],
      description: "Due cocktail al prezzo di uno da lunedi a giovedi.",
      includedItems: ["2 cocktail", "stuzzichini", "posto vista lago"],
      terms: "Valido solo su prenotazione.",
      originalPrice: 24,
      discountedPrice: 12,
      discountPercentage: 50,
      startDate: new Date("2026-04-25"),
      endDate: new Date("2026-06-20"),
      validUntil: new Date("2026-06-20"),
      location: "Lugano centro",
      city: "Lugano",
      latitude: 46.0037,
      longitude: 8.9511,
      imageUrls: [
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80"
      ],
      images: [
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80"
      ],
      maxCouponDownloads: 400,
      usageLimitPerCustomer: 1
    },
    {
      title: "Weekend fitness pass",
      category: "fitness",
      categoryIds: ["fitness_sports"],
      description: "Ingresso palestra weekend con trainer onboarding.",
      includedItems: ["Ingresso palestra", "assessment", "programma base"],
      terms: "Una sola attivazione per cliente.",
      originalPrice: 49,
      discountedPrice: 29,
      discountPercentage: 40.8,
      startDate: new Date("2026-04-25"),
      endDate: new Date("2026-05-12"),
      validUntil: new Date("2026-05-12"),
      location: "Locarno nord",
      city: "Locarno",
      latitude: 46.1702,
      longitude: 8.7995,
      imageUrls: [
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80"
      ],
      images: [
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80"
      ],
      maxCouponDownloads: 200,
      usageLimitPerCustomer: 1
    }
  ];

  for (const offer of offers) {
    const created = await prisma.offer.create({
      data: {
        vendorId: vendor.id,
        ...offer,
        status: OfferStatus.APPROVED
      }
    });

    createdOffers.push({ id: created.id, title: created.title });

    await prisma.coupon.create({
      data: {
        offerId: created.id,
        vendorId: vendor.id,
        type: CouponType.GENERATED,
        title: `${created.title} Coupon`,
        subtitle: "Mostra questo coupon in cassa",
        couponCode: `TD-${created.id.slice(-6).toUpperCase()}`,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${created.id}`,
        couponImageUrl: null,
        couponPdfUrl: null,
        uploadedFileUrl: null,
        layout: CouponLayout.MODERN,
        pattern: CouponPattern.GRADIENT,
        primaryColor: "#4F46E5",
        secondaryColor: "#22C55E",
        textColor: "#111827",
        backgroundColor: "#F9FAFB",
        borderStyle: CouponBorderStyle.SOLID,
        validityStart: created.startDate,
        validityEnd: created.endDate,
        terms: created.terms,
        maxDownloads: created.maxCouponDownloads
      }
    });
  }

  console.log({
    admin: admin.email,
    customer: customer.email,
    vendor: vendorUser.email,
    offers: createdOffers
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
