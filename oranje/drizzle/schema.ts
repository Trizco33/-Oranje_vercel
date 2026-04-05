import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Categories ──────────────────────────────────────────────────────────────
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 50 }),
  description: text("description"),
  coverImage: text("coverImage"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ─── Partners ────────────────────────────────────────────────────────────────
export const partners = mysqlTable("partners", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  plan: mysqlEnum("plan", ["Essencial", "Destaque", "Premium"]).notNull(),
  status: mysqlEnum("status", ["pending", "active", "inactive"]).default("pending").notNull(),
  contactName: varchar("contactName", { length: 200 }),
  contactWhatsapp: varchar("contactWhatsapp", { length: 20 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  logoUrl: text("logoUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;

// ─── Places ──────────────────────────────────────────────────────────────────
export const places = mysqlTable("places", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  categoryId: int("categoryId").references(() => categories.id),
  partnerId: int("partnerId").references(() => partners.id),
  slug: varchar("slug", { length: 200 }),
  shortDesc: text("shortDesc"),
  longDesc: text("longDesc"),
  tags: json("tags").$type<string[]>(),
  priceRange: varchar("priceRange", { length: 10 }),
  openingHours: text("openingHours"),
  address: text("address"),
  city: varchar("city", { length: 100 }).default("Holambra"),
  state: varchar("state", { length: 100 }).default("SP"),
  country: varchar("country", { length: 100 }).default("Brasil"),
  phone: varchar("phone", { length: 30 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  instagram: varchar("instagram", { length: 100 }),
  website: text("website"),
  mapsUrl: text("mapsUrl"),
  lat: float("lat"),
  lng: float("lng"),
  coverImage: text("coverImage"),
  images: json("images").$type<string[]>(),
  isFree: boolean("isFree").default(false).notNull(),
  isRecommended: boolean("isRecommended").default(false).notNull(),
  isPartner: boolean("isPartner").default(false).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  dataPending: boolean("dataPending").default(false).notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  rating: float("rating").default(0),
  reviewCount: int("reviewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  nameCityIdx: uniqueIndex("places_name_city_idx").on(table.name, table.city),
}));

export type Place = typeof places.$inferSelect;
export type InsertPlace = typeof places.$inferInsert;

// ─── Place Photos ────────────────────────────────────────────────────────────
export const placePhotos = mysqlTable("place_photos", {
  id: int("id").autoincrement().primaryKey(),
  placeId: int("placeId").notNull().references(() => places.id),
  url: text("url").notNull(),
  caption: text("caption"),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlacePhoto = typeof placePhotos.$inferSelect;

// ─── Events ──────────────────────────────────────────────────────────────────
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  startsAt: timestamp("startsAt").notNull(),
  endsAt: timestamp("endsAt"),
  location: text("location"),
  mapsUrl: text("mapsUrl"),
  coverImage: text("coverImage"),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  tags: json("tags").$type<string[]>(),
  price: varchar("price", { length: 50 }),
  status: mysqlEnum("status", ["active", "cancelled", "past"]).default("active").notNull(),
  alertSent: boolean("alertSent").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// ─── Vouchers ────────────────────────────────────────────────────────────────
export const vouchers = mysqlTable("vouchers", {
  id: int("id").autoincrement().primaryKey(),
  placeId: int("placeId").notNull().references(() => places.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  code: varchar("code", { length: 50 }),
  qrPayload: text("qrPayload"),
  discount: varchar("discount", { length: 50 }),
  startsAt: timestamp("startsAt"),
  endsAt: timestamp("endsAt"),
  isActive: boolean("isActive").default(true).notNull(),
  usageCount: int("usageCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Voucher = typeof vouchers.$inferSelect;
export type InsertVoucher = typeof vouchers.$inferInsert;

// ─── Ads ─────────────────────────────────────────────────────────────────────
export const ads = mysqlTable("ads", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  linkUrl: text("linkUrl"),
  placement: mysqlEnum("placement", ["footer_banner", "offers_page", "home_banner"]).notNull(),
  startsAt: timestamp("startsAt"),
  endsAt: timestamp("endsAt"),
  isActive: boolean("isActive").default(true).notNull(),
  clickCount: int("clickCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Ad = typeof ads.$inferSelect;
export type InsertAd = typeof ads.$inferInsert;

// ─── Favorites ───────────────────────────────────────────────────────────────
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  placeId: int("placeId").notNull().references(() => places.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;

// ─── Routes (Roteiros) ───────────────────────────────────────────────────────
export const routes = mysqlTable("routes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  placeIds: json("placeIds").$type<number[]>(),
  highlights: json("highlights").$type<string[]>(),
  placeNotes: json("placeNotes").$type<Record<string, string>>(),
  duration: varchar("duration", { length: 50 }),
  theme: varchar("theme", { length: 100 }),
  isPublic: boolean("isPublic").default(false).notNull(),
  coverImage: text("coverImage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Route = typeof routes.$inferSelect;
export type InsertRoute = typeof routes.$inferInsert;

// ─── Notifications ───────────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content"),
  type: mysqlEnum("type", ["event_new", "event_reminder", "voucher", "general"]).default("general").notNull(),
  relatedId: int("relatedId"),
  relatedType: varchar("relatedType", { length: 50 }),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  placeId: int("placeId").notNull().references(() => places.id),
  userId: int("userId").notNull().references(() => users.id),
  rating: int("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  isVerified: boolean("isVerified").default(false).notNull(), // User visited the place
  helpfulCount: int("helpfulCount").default(0),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ─── Magic Links ─────────────────────────────────────────────────────────────
export const magicLinks = mysqlTable("magic_links", {
  token: varchar("token", { length: 64 }).primaryKey().notNull(),
  userId: int("userId").notNull().references(() => users.id),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MagicLink = typeof magicLinks.$inferSelect;
export type InsertMagicLink = typeof magicLinks.$inferInsert;

// ─── Admin Logs ──────────────────────────────────────────────────────────────
export const adminLogs = mysqlTable("admin_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(), // e.g., "create_place", "update_event", "delete_voucher"
  entityType: varchar("entityType", { length: 50 }).notNull(), // e.g., "place", "event", "voucher"
  entityId: int("entityId").notNull(), // ID do lugar, evento, etc
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;


// ── Drivers (Motoristas/Transporte) ──────────────────────────────────────────
export const drivers = mysqlTable("drivers", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  photoUrl: text("photoUrl"),
  vehicleModel: varchar("vehicleModel", { length: 100 }),
  vehicleColor: varchar("vehicleColor", { length: 50 }),
  plate: varchar("plate", { length: 20 }),
  capacity: int("capacity"),
  serviceType: varchar("serviceType", { length: 100 }).notNull(),
  region: varchar("region", { length: 100 }).notNull(),
  area: text("area"),
  notes: text("notes"),
  status: mysqlEnum("status", ["PENDING", "ACTIVE", "REJECTED"]).default("PENDING").notNull(),
  isPartner: boolean("isPartner").default(false).notNull(),
  partnerUntil: timestamp("partnerUntil"),
  isVerified: boolean("isVerified").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  statusIdx: index("status_idx").on(table.status),
  isPartnerIdx: index("isPartner_idx").on(table.isPartner),
}));

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = typeof drivers.$inferInsert;


// ─── Articles ────────────────────────────────────────────────────────────────
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImageUrl: text("coverImageUrl"),
  seoTitle: varchar("seoTitle", { length: 255 }),
  seoDescription: varchar("seoDescription", { length: 255 }),
  seoKeywords: varchar("seoKeywords", { length: 500 }),
  category: varchar("category", { length: 100 }).default("Geral"),
  published: boolean("published").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: index("slug_idx").on(table.slug),
  publishedIdx: index("published_idx").on(table.published),
  categoryIdx: index("category_idx").on(table.category),
}));

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

// ─── Article Backups ──────────────────────────────────────────────────────────
export const articleBackups = mysqlTable("article_backups", {
  id: int("id").autoincrement().primaryKey(),
  originalArticleId: int("originalArticleId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImageUrl: text("coverImageUrl"),
  seoTitle: varchar("seoTitle", { length: 255 }),
  seoDescription: varchar("seoDescription", { length: 255 }),
  seoKeywords: varchar("seoKeywords", { length: 500 }),
  category: varchar("category", { length: 100 }),
  published: boolean("published").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  backupReason: varchar("backupReason", { length: 50 }).notNull(), // "create", "update", "manual"
  backupDate: timestamp("backupDate").defaultNow().notNull(),
}, (table) => ({
  originalArticleIdx: index("original_article_idx").on(table.originalArticleId),
  backupDateIdx: index("backup_date_idx").on(table.backupDate),
}));

export type ArticleBackup = typeof articleBackups.$inferSelect;
export type InsertArticleBackup = typeof articleBackups.$inferInsert;

// ─── Site Content (CMS) ──────────────────────────────────────────────────────
export const siteContent = mysqlTable("site_content", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(), // e.g., "hero_title", "about_text", "faq_1_question"
  value: text("value").notNull(), // JSON for complex data
  section: varchar("section", { length: 50 }).notNull(), // e.g., "hero", "about", "faq"
  updatedBy: int("updatedBy").notNull().references(() => users.id),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteContent = typeof siteContent.$inferSelect;
export type InsertSiteContent = typeof siteContent.$inferInsert;

// ─── Site Pages (CMS) ────────────────────────────────────────────────────────
export const sitePages = mysqlTable("site_pages", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 255 }),
  content: text("content").notNull(),
  coverImageUrl: text("coverImageUrl"),
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: text("metaDescription"),
  metaKeywords: text("metaKeywords"),
  published: boolean("published").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  createdBy: int("createdBy").notNull().references(() => users.id),
  updatedBy: int("updatedBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SitePage = typeof sitePages.$inferSelect;
export type InsertSitePage = typeof sitePages.$inferInsert;

// ─── Site SEO ────────────────────────────────────────────────────────────────
export const siteSeo = mysqlTable("site_seo", {
  id: int("id").autoincrement().primaryKey(),
  page: varchar("page", { length: 100 }).notNull().unique(), // e.g., "home", "blog", "parceiros"
  metaTitle: varchar("metaTitle", { length: 255 }).notNull(),
  metaDescription: text("metaDescription").notNull(),
  metaKeywords: text("metaKeywords"),
  ogImage: text("ogImage"),
  ogTitle: varchar("ogTitle", { length: 255 }),
  ogDescription: text("ogDescription"),
  canonical: text("canonical"),
  index: boolean("index").default(true).notNull(),
  updatedBy: int("updatedBy").notNull().references(() => users.id),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSeo = typeof siteSeo.$inferSelect;
export type InsertSiteSeo = typeof siteSeo.$inferInsert;

// ─── Site Route Features (CMS-controlled site roteiro showcase) ──────────────
// Each row pins a real app route to the site's "Passeios" block.
// Admins pick the route, write optional editorial copy, set order & flags.
export const siteRouteFeatures = mysqlTable("site_route_features", {
  id: int("id").autoincrement().primaryKey(),
  routeId: int("routeId").notNull().references(() => routes.id),
  label: varchar("label", { length: 200 }),       // Override title shown on site (falls back to route.title)
  subtitle: text("subtitle"),                       // Short editorial line (optional)
  ctaText: varchar("ctaText", { length: 100 }),   // Button label (optional, fallback to default)
  isFeatured: boolean("isFeatured").default(false).notNull(), // Single featured/hero slot
  isActive: boolean("isActive").default(true).notNull(),      // Show on site
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteRouteFeature = typeof siteRouteFeatures.$inferSelect;
export type InsertSiteRouteFeature = typeof siteRouteFeatures.$inferInsert;

// ─── Push Subscriptions ───────────────────────────────────────────────────────
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: varchar("auth", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

// ─── Receptivo Oranje — Guided Tours ─────────────────────────────────────────
// Independent of the existing "roteiros" feature.
// Each guided_tour is a curated walking experience with ordered stops and
// per-stop editorial narratives. Designed to scale: 1 pilot now, N later.

export const guidedTours = mysqlTable("guided_tours", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),       // 'holambra-romantica'
  name: varchar("name", { length: 255 }).notNull(),                // 'Holambra Romântica'
  tagline: varchar("tagline", { length: 255 }),                    // 'O passeio mais bonito de Holambra'
  description: text("description"),                                 // Opening editorial text
  theme: varchar("theme", { length: 100 }),                        // 'romantica'
  duration: varchar("duration", { length: 50 }),                   // '3 a 4 horas'
  coverImage: text("coverImage"),
  extensionPlaceIds: json("extensionPlaceIds").$type<number[]>(),  // IDs para bloco "Se quiser ir além"
  status: varchar("status", { length: 20 }).default("draft").notNull(), // 'active' | 'draft' | 'archived'
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GuidedTour = typeof guidedTours.$inferSelect;
export type InsertGuidedTour = typeof guidedTours.$inferInsert;

export const guidedTourStops = mysqlTable("guided_tour_stops", {
  id: int("id").autoincrement().primaryKey(),
  tourId: int("tourId").notNull().references(() => guidedTours.id),
  placeId: int("placeId").notNull().references(() => places.id),
  stopOrder: int("stopOrder").notNull(),                           // 1, 2, 3…
  narrative: text("narrative"),                                     // Editorial mini-text per stop
  tip: text("tip"),                                                 // Practical optional tip
  bestMoment: varchar("bestMoment", { length: 255 }),             // 'Entardecer', 'Manhã cedo'
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GuidedTourStop = typeof guidedTourStops.$inferSelect;
export type InsertGuidedTourStop = typeof guidedTourStops.$inferInsert;
