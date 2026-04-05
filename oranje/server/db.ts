import { and, desc, eq, ilike, inArray, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import type { ResultSetHeader } from "mysql2";
import {
  InsertUser, ads, adminLogs, categories, events, favorites, magicLinks, notifications,
  partners, placePhotos, places, routes, users, vouchers, drivers, siteRouteFeatures,
  type InsertAdminLog, type InsertCategory, type InsertEvent, type InsertMagicLink, type InsertPartner,
  type InsertPlace, type InsertRoute, type InsertVoucher, type MagicLink, type InsertDriver,
  type InsertSiteRouteFeature,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Categories ───────────────────────────────────────────────────────────────
export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0];
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(categories).values(data);
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(categories).where(eq(categories.id, id));
}

// ─── Places ───────────────────────────────────────────────────────────────────
export async function getPlaces(opts?: {
  categoryId?: number;
  search?: string;
  tags?: string[];
  featured?: boolean;
  recommended?: boolean;
  partner?: boolean;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(places).where(eq(places.status, "active"));
  const conditions = [eq(places.status, "active")];
  if (opts?.categoryId) conditions.push(eq(places.categoryId, opts.categoryId));
  if (opts?.featured) conditions.push(eq(places.isFeatured, true));
  if (opts?.recommended) conditions.push(eq(places.isRecommended, true));
  if (opts?.partner) conditions.push(eq(places.isPartner, true));
  if (opts?.search) {
    conditions.push(
      or(
        like(places.name, `%${opts.search}%`),
        like(places.shortDesc, `%${opts.search}%`)
      ) as any
    );
  }
  const result = await db
    .select()
    .from(places)
    .where(and(...conditions))
    .orderBy(desc(places.isFeatured), desc(places.isRecommended), desc(places.rating))
    .limit(opts?.limit ?? 100)
    .offset(opts?.offset ?? 0);
  return result;
}

export async function getPlaceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(places).where(eq(places.id, id)).limit(1);
  return result[0];
}

export async function getPlacePhotos(placeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(placePhotos).where(eq(placePhotos.placeId, placeId)).orderBy(placePhotos.order);
}

export async function createPlace(data: InsertPlace) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(places).values(data);
  // Retornar o lugar criado para logging
  const insertId = (result as any).insertId;
  if (insertId) {
    const createdPlace = await db.select().from(places).where(eq(places.id, Number(insertId))).limit(1);
    return createdPlace[0] || result;
  }
  return result;
}

export async function updatePlace(id: number, data: Partial<InsertPlace>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(places).set({ ...data, updatedAt: new Date() }).where(eq(places.id, id));
}

export async function deletePlace(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(places).set({ status: "inactive" }).where(eq(places.id, id));
}

// ─── Events ───────────────────────────────────────────────────────────────────
export async function getEvents(opts?: { upcoming?: boolean; featured?: boolean; limit?: number }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(events.status, "active")];
  if (opts?.upcoming) conditions.push(sql`${events.startsAt} >= NOW()`);
  if (opts?.featured) conditions.push(eq(events.isFeatured, true));
  return db
    .select()
    .from(events)
    .where(and(...conditions))
    .orderBy(events.startsAt)
    .limit(opts?.limit ?? 50);
}

export async function getEventById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result[0];
}

export async function createEvent(data: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(events).values(data);
  return result;
}

export async function updateEvent(id: number, data: Partial<InsertEvent>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(events).set({ ...data, updatedAt: new Date() }).where(eq(events.id, id));
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(events).set({ status: "cancelled" }).where(eq(events.id, id));
}

// ─── Vouchers ─────────────────────────────────────────────────────────────────
export async function getVouchers(placeId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(vouchers.isActive, true)];
  if (placeId) conditions.push(eq(vouchers.placeId, placeId));
  return db.select().from(vouchers).where(and(...conditions));
}

export async function createVoucher(data: InsertVoucher) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(vouchers).values(data);
}

export async function updateVoucher(id: number, data: Partial<InsertVoucher>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(vouchers).set(data).where(eq(vouchers.id, id));
}

// ─── Ads ──────────────────────────────────────────────────────────────────────
export async function getAds(placement?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(ads.isActive, true)];
  if (placement) conditions.push(eq(ads.placement, placement as any));
  return db.select().from(ads).where(and(...conditions));
}

export async function createAd(data: typeof ads.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(ads).values(data);
}

export async function updateAd(id: number, data: Partial<typeof ads.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(ads).set(data).where(eq(ads.id, id));
}

// ─── Partners ─────────────────────────────────────────────────────────────────
export async function getPartners(status?: string) {
  const db = await getDb();
  if (!db) return [];
  if (status) return db.select().from(partners).where(eq(partners.status, status as any));
  return db.select().from(partners).orderBy(desc(partners.createdAt));
}

export async function createPartner(data: InsertPartner) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(partners).values(data);
}

export async function updatePartner(id: number, data: Partial<InsertPartner>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(partners).set(data).where(eq(partners.id, id));
}

// ─── Favorites ────────────────────────────────────────────────────────────────
export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(favorites).where(eq(favorites.userId, userId));
}

export async function addFavorite(userId: number, placeId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(favorites).values({ userId, placeId }).onDuplicateKeyUpdate({ set: { placeId } });
}

export async function removeFavorite(userId: number, placeId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.placeId, placeId)));
}

// ─── Routes (Roteiros) ────────────────────────────────────────────────────────
export async function getPublicRoutes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(routes).where(eq(routes.isPublic, true)).orderBy(desc(routes.createdAt));
}

export async function getUserRoutes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(routes).where(eq(routes.userId, userId)).orderBy(desc(routes.createdAt));
}

export async function getRouteById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(routes).where(eq(routes.id, id)).limit(1);
  return result[0];
}

export async function createRoute(data: InsertRoute) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(routes).values(data);
  return result;
}

export async function updateRoute(id: number, data: Partial<InsertRoute>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(routes).set({ ...data, updatedAt: new Date() }).where(eq(routes.id, id));
}

export async function deleteRoute(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(routes).where(eq(routes.id, id));
}

// ─── Site Route Features (CMS-controlled site roteiro showcase) ──────────────
export async function getSiteRouteFeatures() {
  const db = await getDb();
  if (!db) return [];
  const features = await db
    .select()
    .from(siteRouteFeatures)
    .where(eq(siteRouteFeatures.isActive, true))
    .orderBy(desc(siteRouteFeatures.isFeatured), siteRouteFeatures.sortOrder);
  if (features.length === 0) return [];
  const routeIds = features.map((f) => f.routeId);
  const routeRows = await db.select().from(routes).where(inArray(routes.id, routeIds));
  const routeMap = new Map(routeRows.map((r) => [r.id, r]));
  return features
    .map((f) => ({ ...f, route: routeMap.get(f.routeId) ?? null }))
    .filter((f) => f.route && f.route.isPublic);
}

export async function getAllSiteRouteFeatures() {
  const db = await getDb();
  if (!db) return [];
  const features = await db
    .select()
    .from(siteRouteFeatures)
    .orderBy(siteRouteFeatures.sortOrder);
  if (features.length === 0) return [];
  const routeIds = features.map((f) => f.routeId);
  const routeRows = await db.select().from(routes).where(inArray(routes.id, routeIds));
  const routeMap = new Map(routeRows.map((r) => [r.id, r]));
  return features.map((f) => ({ ...f, route: routeMap.get(f.routeId) ?? null }));
}

export type SaveSiteRouteFeatureInput = {
  id?: number;
  routeId: number;
  label?: string | null;
  subtitle?: string | null;
  ctaText?: string | null;
  imageUrl?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  sortOrder?: number;
};

export async function saveSiteRouteFeature(data: SaveSiteRouteFeatureInput) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const { id, ...values } = data;
  if (id) {
    await db.update(siteRouteFeatures).set({ ...values, updatedAt: new Date() }).where(eq(siteRouteFeatures.id, id));
    return { id };
  }
  const [result] = await db.insert(siteRouteFeatures).values(values) as unknown as [ResultSetHeader];
  return { id: result.insertId };
}

export async function deleteSiteRouteFeature(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(siteRouteFeatures).where(eq(siteRouteFeatures.id, id));
}

// ─── Notifications ────────────────────────────────────────────────────────────
export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function createNotification(data: typeof notifications.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(notifications).values(data);
}

export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

export async function broadcastEventNotification(eventId: number, title: string, content: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const allUsers = await db.select({ id: users.id }).from(users);
  const notifs = allUsers.map(u => ({
    userId: u.id,
    title,
    content,
    type: "event_new" as const,
    relatedId: eventId,
    relatedType: "event",
  }));
  if (notifs.length > 0) {
    for (const n of notifs) await db.insert(notifications).values(n);
  }
}

// ─── Admin Stats ──────────────────────────────────────────────────────────────
export async function getAdminStats() {
  const db = await getDb();
  if (!db) return { places: 0, events: 0, partners: 0, users: 0 };
  const [placesCount] = await db.select({ count: sql<number>`count(*)` }).from(places).where(eq(places.status, "active"));
  const [eventsCount] = await db.select({ count: sql<number>`count(*)` }).from(events).where(eq(events.status, "active"));
  const [partnersCount] = await db.select({ count: sql<number>`count(*)` }).from(partners).where(eq(partners.status, "active"));
  const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  return {
    places: Number(placesCount?.count ?? 0),
    events: Number(eventsCount?.count ?? 0),
    partners: Number(partnersCount?.count ?? 0),
    users: Number(usersCount?.count ?? 0),
  };
}

// ─── Magic Links ──────────────────────────────────────────────────────────────
export async function createMagicLink(token: string, userId: number, expiresAt: Date): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("[Database] Cannot create magic link: database not available");
  try {
    await db.insert(magicLinks).values({ token, userId, expiresAt });
  } catch (error) {
    console.error("[Database] Failed to create magic link:", error);
    throw error;
  }
}

export async function getMagicLink(token: string): Promise<MagicLink | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(magicLinks).where(eq(magicLinks.token, token));
    return result[0] ?? null;
  } catch (error) {
    console.error("[Database] Failed to get magic link:", error);
    return null;
  }
}

export async function markMagicLinkAsUsed(token: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("[Database] Cannot mark magic link as used: database not available");
  try {
    await db.update(magicLinks).set({ usedAt: new Date() }).where(eq(magicLinks.token, token));
  } catch (error) {
    console.error("[Database] Failed to mark magic link as used:", error);
    throw error;
  }
}

export async function createUserWithEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("[Database] Cannot create user: database not available");
  try {
    const openId = `magic_link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const result = await db.insert(users).values({
      openId,
      email,
      loginMethod: "magic_link",
      lastSignedIn: new Date(),
    });
    const user = await getUserByEmail(email);
    return user;
  } catch (error) {
    console.error("[Database] Failed to create user with email:", error);
    throw error;
  }
}


// ─── Admin Logs ───────────────────────────────────────────────────────────────
export async function logAdminAction(
  userId: number,
  action: string,
  entityType: string,
  entityId: number
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot log admin action: database not available");
    return;
  }
  try {
    await db.insert(adminLogs).values({
      userId,
      action,
      entityType,
      entityId,
    });
  } catch (error) {
    console.error("[Database] Failed to log admin action:", error);
    // Não lançar erro para não quebrar a operação principal
  }
}

export async function getAdminLogs(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get admin logs: database not available");
    return [];
  }
  try {
    const logs = await db
      .select({
        id: adminLogs.id,
        action: adminLogs.action,
        entityType: adminLogs.entityType,
        entityId: adminLogs.entityId,
        createdAt: adminLogs.createdAt,
        userEmail: users.email,
      })
      .from(adminLogs)
      .leftJoin(users, eq(adminLogs.userId, users.id))
      .orderBy(desc(adminLogs.createdAt))
      .limit(limit)
      .offset(offset);
    return logs;
  } catch (error) {
    console.error("[Database] Failed to get admin logs:", error);
    return [];
  }
}


// ── Drivers (Motoristas/Transporte) ──────────────────────────────────────────
export async function getPublicDrivers() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  
  // Fetch all active drivers with explicit select of only public fields
  const allActive = await db.select({
    id: drivers.id,
    name: drivers.name,
    whatsapp: drivers.whatsapp,
    serviceType: drivers.serviceType,
    region: drivers.region,
    capacity: drivers.capacity,
    vehicleModel: drivers.vehicleModel,
    vehicleColor: drivers.vehicleColor,
    notes: drivers.notes,
    photoUrl: drivers.photoUrl,
    createdAt: drivers.createdAt,
  }).from(drivers)
    .where(eq(drivers.status, "ACTIVE"));
  
  // For sorting by partner status, we need full data
  const fullActive = await db.select().from(drivers)
    .where(eq(drivers.status, "ACTIVE"));
  
  // Create a map of id -> full driver for sorting
  const fullMap = new Map(fullActive.map(d => [d.id, d]));
  
  // Sort: valid partners first, then by createdAt desc
  return allActive.sort((a, b) => {
    const aFull = fullMap.get(a.id);
    const bFull = fullMap.get(b.id);
    
    const aIsValidPartner = aFull?.isPartner && aFull?.partnerUntil && new Date(aFull.partnerUntil) > now;
    const bIsValidPartner = bFull?.isPartner && bFull?.partnerUntil && new Date(bFull.partnerUntil) > now;
    
    if (aIsValidPartner && !bIsValidPartner) return -1;
    if (!aIsValidPartner && bIsValidPartner) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function getAllDrivers(filters?: { status?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [];
  
  if (filters?.status) {
    conditions.push(eq(drivers.status, filters.status as any));
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const query = whereClause 
    ? db.select().from(drivers).where(whereClause)
    : db.select().from(drivers);
    
  return query.orderBy(
    desc(drivers.isPartner),
    drivers.partnerUntil ? desc(drivers.partnerUntil) : sql`0`,
    desc(drivers.createdAt)
  );
}

export async function createDriver(data: InsertDriver) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  // Filter out undefined values to avoid MySQL errors
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as InsertDriver;
  
  const insertData = {
    ...cleanData,
    status: "PENDING" as const,
    isVerified: false,
    isActive: true,
  };
  
  // Insert and immediately fetch the created driver
  await db.insert(drivers).values(insertData as any);
  
  // Query back the created driver using whatsapp as unique identifier
  const result = await db.select().from(drivers)
    .where(eq(drivers.whatsapp, data.whatsapp))
    .orderBy(desc(drivers.createdAt))
    .limit(1);
  
  return result[0] || null;
}

export async function updateDriverStatus(id: string, status: "PENDING" | "ACTIVE" | "REJECTED") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.update(drivers)
    .set({ status, updatedAt: new Date() })
    .where(eq(drivers.id, id));
}

export async function updateDriverPartner(id: string, isPartner: boolean, partnerUntil?: Date) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.update(drivers)
    .set({ isPartner, partnerUntil, updatedAt: new Date() })
    .where(eq(drivers.id, id));
}

export async function updateDriver(id: string, data: Partial<InsertDriver>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.update(drivers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(drivers.id, id));
}

export async function deleteDriver(id: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.delete(drivers).where(eq(drivers.id, id));
}

export async function getDriverById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(drivers).where(eq(drivers.id, id));
  return result[0];
}

export async function getPendingDriversCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql`COUNT(*)` }).from(drivers).where(eq(drivers.status, "PENDING"));
  return (result[0]?.count as number) || 0;
}
