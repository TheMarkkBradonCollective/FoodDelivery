"use client";

import { create, type StoreApi, type UseBoundStore } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BuildingAccess,
  Business,
  CartItem,
  Delivery,
  EarningRecord,
  Notification,
  Order,
  Run,
  RunnerAccessPreference,
  StaffMessage,
  User,
} from "../types/index";
import { customerAccessNotice, matchDeliveryAccess, trimAccessNote } from "../lib/delivery-access";
import type { AccessHold } from "../lib/delivery-access";
import { canScheduleRun } from "../lib/coverage-engine";
import { DEFAULT_LOCATION } from "../data/constants";
import { signOut } from "../lib/supabase/auth";
import type { MarketplaceSnapshot } from "../lib/supabase/marketplace";
import {
  offerDeliveryForOrder,
  persistAccessPreference,
  persistCoverage,
  persistDelivery,
  persistEarning,
  persistFavorite,
  persistNotification,
  persistOrder,
  persistOrderStatus,
  persistRun,
  persistStaffMessage,
  persistNotificationRead,
} from "../lib/supabase/marketplace";

function previewOfferForOrder(order: Order, kitchen: Business, customerName: string): Delivery {
  return {
    id: crypto.randomUUID(),
    orderId: order.id,
    businessId: kitchen.id,
    pickup: kitchen.location,
    dropoff: {
      lat: kitchen.location.lat + 0.008,
      lng: kitchen.location.lng + 0.006,
    },
    distanceMiles: 1.4,
    status: "offered",
    basePay: 4.5,
    distancePay: 1.85,
    tip: order.tip,
    totalEarnings: 4.5 + 1.85 + order.tip,
    estimatedMinutes: kitchen.etaMinutes,
    customerName,
    buildingAccess: order.buildingAccess,
    accessNote: trimAccessNote(order.accessNote),
    accessNotice: order.accessNotice ?? null,
  };
}

export interface AppState {
  user: User | null;
  theme: "light" | "dark";
  location: { lat: number; lng: number };
  businesses: Business[];
  activeRun: Run | null;
  scheduledRuns: Run[];
  runHistory: Run[];
  activeDelivery: Delivery | null;
  pendingDelivery: Delivery | null;
  orders: Order[];
  cart: CartItem[];
  cartBusinessId: string | null;
  favoriteBusinessIds: string[];
  notifications: Notification[];
  earnings: EarningRecord[];
  marketplaceUsers: User[];
  staffMessages: StaffMessage[];
  accessPreference: RunnerAccessPreference | null;
  accessPreferenceUserId: string | null;
  accessHold: AccessHold | null;
  searchQuery: string;
  mapFilter: "all" | "open" | "gap" | "high_demand";
  catalogPreview: boolean;
  authReady: boolean;
  marketplaceReady: boolean;
  onboardingSeen: boolean;
  deliveryAddress: string;
  toast: { message: string; tone: "ok" | "err" } | null;

  setUser: (user: User | null) => void;
  setAccessPreference: (preference: RunnerAccessPreference) => void;
  logout: () => void;
  toggleTheme: () => void;
  setLocation: (location: { lat: number; lng: number }) => void;
  setSearchQuery: (query: string) => void;
  setMapFilter: (filter: AppState["mapFilter"]) => void;
  toggleFavorite: (businessId: string) => void;
  confirmRun: (businessId: string, startTime: string, endTime: string) => boolean;
  checkInRun: () => void;
  checkOutRun: () => void;
  cancelRun: (runId: string) => void;
  acceptDelivery: () => void;
  completeDelivery: () => void;
  addToCart: (businessId: string, item: CartItem) => void;
  removeFromCart: (menuItemId: string) => void;
  updateCartQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (options?: {
    tip?: number;
    address?: string;
    discount?: number;
    fulfillment?: "delivery" | "pickup";
    scheduledFor?: string;
    buildingAccess?: BuildingAccess;
    accessNote?: string;
  }) => Order | null;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  hydrateMarketplace: (snapshot: MarketplaceSnapshot, preview?: boolean) => void;
  updateBusinessCapacity: (businessId: string, ruleId: string, maxRunrs: number) => void;
  updateMenuItem: (businessId: string, itemId: string, patch: { price?: number; name?: string }) => void;
  updateBusinessHours: (businessId: string, hours: string) => void;
  markNotificationRead: (id: string) => void;
  sendStaffMessage: (body: string) => void;
  setAuthReady: (ready: boolean) => void;
  setMarketplaceReady: (ready: boolean) => void;
  setOnboardingSeen: (seen: boolean) => void;
  setDeliveryAddress: (address: string) => void;
  showToast: (message: string, tone?: "ok" | "err") => void;
  clearToast: () => void;
}

function buildStore(
  set: StoreApi<AppState>["setState"],
  get: StoreApi<AppState>["getState"]
) {
  return {
    user: null,
    theme: "light" as const,
    location: DEFAULT_LOCATION,
    businesses: [] as Business[],
    activeRun: null,
    scheduledRuns: [] as Run[],
    runHistory: [] as Run[],
    activeDelivery: null,
    pendingDelivery: null,
    orders: [] as Order[],
    cart: [] as CartItem[],
    cartBusinessId: null,
    favoriteBusinessIds: [] as string[],
    notifications: [] as Notification[],
    earnings: [] as EarningRecord[],
    marketplaceUsers: [] as User[],
    staffMessages: [] as StaffMessage[],
    accessPreference: null as RunnerAccessPreference | null,
    accessPreferenceUserId: null as string | null,
    accessHold: null as AccessHold | null,
    searchQuery: "",
    mapFilter: "all" as const,
    catalogPreview: false,
    authReady: false,
    marketplaceReady: false,
    onboardingSeen: false,
    deliveryAddress: "1 Market St, San Francisco",
    toast: null as { message: string; tone: "ok" | "err" } | null,

    setUser: (user: User | null) => {
      if (!user) {
        set({ user: null });
        return;
      }
      const local =
        get().accessPreferenceUserId === user.id ? get().accessPreference : null;
      const preference = user.accessPreference ?? local ?? undefined;
      set({
        user: preference ? { ...user, accessPreference: preference } : user,
        accessPreference: preference ?? null,
        accessPreferenceUserId: user.id,
      });
    },
    setAccessPreference: (preference: RunnerAccessPreference) => {
      const user = get().user;
      const pending = get().pendingDelivery;
      const order = pending
        ? get().orders.find((item) => item.id === pending.orderId)
        : undefined;
      const decision = pending
        ? matchDeliveryAccess(order?.buildingAccess ?? pending.buildingAccess, preference)
        : null;
      set({
        accessPreference: preference,
        accessPreferenceUserId: user?.id ?? get().accessPreferenceUserId,
        user: user ? { ...user, accessPreference: preference } : user,
        pendingDelivery: decision && !decision.assign ? null : pending,
      });
      if (user && !get().catalogPreview) void persistAccessPreference(user.id, preference);
      get().showToast("Access preferences saved");
    },
    logout: () => {
      void signOut();
      set({
        user: null,
        businesses: [],
        activeRun: null,
        scheduledRuns: [],
        runHistory: [],
        activeDelivery: null,
        pendingDelivery: null,
        orders: [],
        cart: [],
        cartBusinessId: null,
        favoriteBusinessIds: [],
        notifications: [],
        earnings: [],
        marketplaceUsers: [],
        staffMessages: [],
        accessHold: null,
        catalogPreview: false,
        marketplaceReady: false,
        searchQuery: "",
        mapFilter: "all",
      });
    },
    toggleTheme: () =>
      set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
    setLocation: (location: { lat: number; lng: number }) => set({ location }),
    setSearchQuery: (searchQuery: string) => set({ searchQuery }),
    setMapFilter: (mapFilter: AppState["mapFilter"]) => set({ mapFilter }),
    toggleFavorite: (businessId: string) =>
      set((s) => {
        const liked = !s.favoriteBusinessIds.includes(businessId);
        const favoriteBusinessIds = liked
          ? [...s.favoriteBusinessIds, businessId]
          : s.favoriteBusinessIds.filter((id) => id !== businessId);
        if (s.user && !s.catalogPreview) void persistFavorite(s.user.id, businessId, liked);
        return { favoriteBusinessIds };
      }),

    confirmRun: (businessId: string, startTime: string, endTime: string) => {
      const { user, businesses } = get();
      if (!user) return false;

      const business = businesses.find((b) => b.id === businessId);
      if (!business) return false;

      const { available } = canScheduleRun(
        startTime,
        endTime,
        business.coverageRules,
        [...business.scheduledRuns, ...get().scheduledRuns]
      );

      if (!available) return false;

      const newRun: Run = {
        id: crypto.randomUUID(),
        runrId: user.id,
        businessId,
        startTime,
        endTime,
        status: "scheduled",
      };

      set((s) => ({
        scheduledRuns: [...s.scheduledRuns, newRun],
        businesses: s.businesses.map((b) =>
          b.id === businessId
            ? { ...b, scheduledRuns: [...b.scheduledRuns, newRun] }
            : b
        ),
      }));

      if (!get().catalogPreview) void persistRun(newRun);
      get().showToast("RUN booked");
      return true;
    },

    checkInRun: () => {
      const { scheduledRuns, activeRun } = get();
      const next = activeRun ?? scheduledRuns.find((r) => r.status === "scheduled");
      if (!next) return;

      const checkedIn: Run = {
        ...next,
        status: "checked_in",
        checkInTime: new Date().toISOString(),
      };

      set({
        activeRun: checkedIn,
        scheduledRuns: scheduledRuns.filter((r) => r.id !== next.id),
      });
      if (!get().catalogPreview) void persistRun(checkedIn);
    },

    checkOutRun: () => {
      const { activeRun, earnings } = get();
      if (!activeRun) return;

      const totalEarnings = earnings.reduce((sum, e) => sum + e.total, 0);
      const completed: Run = {
        ...activeRun,
        status: "completed",
        checkOutTime: new Date().toISOString(),
        deliveryCount: earnings.length,
        earnings: totalEarnings,
      };

      set((s) => ({
        activeRun: null,
        runHistory: [completed, ...s.runHistory],
      }));
      if (!get().catalogPreview) void persistRun(completed);
    },

    cancelRun: (runId: string) =>
      set((s) => {
        const run = s.scheduledRuns.find((r) => r.id === runId);
        if (run && !s.catalogPreview) void persistRun({ ...run, status: "cancelled" });
        return {
          scheduledRuns: s.scheduledRuns.filter((r) => r.id !== runId),
          businesses: s.businesses.map((b) => ({
            ...b,
            scheduledRuns: b.scheduledRuns.filter((r) => r.id !== runId),
          })),
        };
      }),

    acceptDelivery: () => {
      const { pendingDelivery, user, orders } = get();
      if (!pendingDelivery || !user) return;

      const order = orders.find((item) => item.id === pendingDelivery.orderId);
      const decision = matchDeliveryAccess(
        order?.buildingAccess ?? pendingDelivery.buildingAccess,
        user.accessPreference,
      );
      if (!decision.assign) {
        set({ pendingDelivery: null });
        get().showToast(
          decision.reason === "stairs_required"
            ? "This delivery requires stairs, so it stays unassigned."
            : "This delivery requires an elevator, so it stays unassigned.",
          "err",
        );
        return;
      }

      const notice = decision.notice;
      const accepted: Delivery = {
        ...pendingDelivery,
        runrId: user.id,
        status: "accepted",
        accessNotice: notice,
      };
      set({
        activeDelivery: accepted,
        pendingDelivery: null,
        orders: orders.map((item) =>
          item.id === pendingDelivery.orderId
            ? {
                ...item,
                status: "runr_assigned",
                runrId: user.id,
                accessNotice: notice ?? item.accessNotice,
              }
            : item,
        ),
      });
      if (!get().catalogPreview) {
        void persistDelivery(accepted);
        void persistOrderStatus(pendingDelivery.orderId, "runr_assigned", user.id, notice);
        if (notice && order) {
          const note: Notification = {
            id: crypto.randomUUID(),
            title: "Access on this delivery",
            body: customerAccessNotice(notice),
            type: "delivery",
            read: false,
            createdAt: new Date().toISOString(),
          };
          void persistNotification(order.customerId, note);
        }
      }
      get().showToast(
        notice ? `RUN accepted. ${customerAccessNotice(notice)}` : "RUN accepted",
      );
    },

    completeDelivery: () => {
      const { activeDelivery, earnings, user } = get();
      if (!activeDelivery || !user) return;

      if (activeDelivery.status === "accepted" || activeDelivery.status === "pickup") {
        const next = { ...activeDelivery, status: "delivering" as const };
        set({ activeDelivery: next });
        if (!get().catalogPreview) {
          void persistDelivery(next);
          void persistOrderStatus(activeDelivery.orderId, "picked_up", user.id);
        }
        get().showToast("Picked up");
        return;
      }

      const record = {
        id: crypto.randomUUID(),
        runrId: user.id,
        businessId: activeDelivery.businessId,
        businessName:
          get().businesses.find((b) => b.id === activeDelivery.businessId)?.name ??
          "Business",
        deliveryId: activeDelivery.id,
        basePay: activeDelivery.basePay,
        distancePay: activeDelivery.distancePay,
        tip: activeDelivery.tip || 5.0,
        total: activeDelivery.totalEarnings + (activeDelivery.tip ? 0 : 5.0),
        completedAt: new Date().toISOString(),
      };

      set({
        activeDelivery: null,
        earnings: [...earnings, record],
      });
      if (!get().catalogPreview) {
        void persistDelivery({ ...activeDelivery, status: "completed" });
        void persistEarning(record);
        void persistOrderStatus(activeDelivery.orderId, "delivered", user.id);
      }
      get().showToast("Delivery complete");
    },

    addToCart: (businessId: string, item: CartItem) => {
      set((s) => {
        if (s.cartBusinessId && s.cartBusinessId !== businessId) {
          return { cart: [item], cartBusinessId: businessId };
        }
        const existing = s.cart.find((c) => c.menuItemId === item.menuItemId);
        if (existing) {
          return {
            cart: s.cart.map((c) =>
              c.menuItemId === item.menuItemId
                ? { ...c, quantity: c.quantity + item.quantity }
                : c
            ),
            cartBusinessId: businessId,
          };
        }
        return { cart: [...s.cart, item], cartBusinessId: businessId };
      });
      get().showToast(`Added ${item.name}`);
    },

    removeFromCart: (menuItemId: string) =>
      set((s) => ({
        cart: s.cart.filter((c) => c.menuItemId !== menuItemId),
      })),

    updateCartQuantity: (menuItemId: string, quantity: number) =>
      set((s) => ({
        cart:
          quantity <= 0
            ? s.cart.filter((c) => c.menuItemId !== menuItemId)
            : s.cart.map((c) =>
                c.menuItemId === menuItemId ? { ...c, quantity } : c
              ),
      })),

    clearCart: () => set({ cart: [], cartBusinessId: null }),

    placeOrder: (options?: {
      tip?: number;
      address?: string;
      discount?: number;
      fulfillment?: "delivery" | "pickup";
      scheduledFor?: string;
      buildingAccess?: BuildingAccess;
      accessNote?: string;
    }) => {
      const { cart, cartBusinessId, user, businesses } = get();
      if (!cart.length || !cartBusinessId || !user) return null;

      const kitchen = businesses.find((b) => b.id === cartBusinessId);
      const fulfillment = options?.fulfillment ?? "delivery";
      const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const deliveryFee = fulfillment === "pickup" ? 0 : kitchen?.deliveryFee ?? 2.99;
      const serviceFee = 1.5;
      const tax = subtotal * 0.0875;
      const tip = options?.tip ?? 5.0;
      const discount = Math.min(options?.discount ?? 0, subtotal + deliveryFee + serviceFee + tax + tip);
      const total = Math.max(0, subtotal + deliveryFee + serviceFee + tax + tip - discount);

      const order: Order = {
        id: crypto.randomUUID(),
        customerId: user.id,
        businessId: cartBusinessId,
        items: cart,
        subtotal,
        deliveryFee,
        serviceFee,
        tax,
        tip,
        total,
        status: "new",
        createdAt: new Date().toISOString(),
        deliveryAddress: fulfillment === "pickup" ? kitchen?.address : options?.address,
        fulfillment,
        scheduledFor: options?.scheduledFor,
        buildingAccess: fulfillment === "delivery" ? options?.buildingAccess : undefined,
        accessNote: fulfillment === "delivery" ? trimAccessNote(options?.accessNote) : undefined,
      };

      const note: Notification = {
        id: crypto.randomUUID(),
        title: "Order placed",
        body: `Your order is in — ${get().businesses.find((b) => b.id === cartBusinessId)?.name ?? "marketplace"}`,
        type: "order",
        read: false,
        createdAt: order.createdAt,
      };

      set((s) => ({
        orders: [order, ...s.orders],
        cart: [],
        cartBusinessId: null,
        notifications: [note, ...s.notifications],
      }));

      if (!get().catalogPreview) {
        void persistOrder(order);
        void persistNotification(user.id, note);
        if (kitchen && fulfillment === "delivery") {
          void offerDeliveryForOrder(order, kitchen, user.name);
        }
      } else if (kitchen && fulfillment === "delivery" && !get().pendingDelivery && !get().activeDelivery) {
        set({ pendingDelivery: previewOfferForOrder(order, kitchen, user.name) });
      }

      get().showToast("Order placed");
      return order;
    },

    updateOrderStatus: (orderId: string, status: Order["status"]) => {
      const order = get().orders.find((o) => o.id === orderId);
      const business = order
        ? get().businesses.find((b) => b.id === order.businessId)
        : undefined;
      const customer = get().marketplaceUsers.find((u) => u.id === order?.customerId);
      set((s) => ({
        orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
      }));
      if (!get().catalogPreview) {
        void persistOrderStatus(orderId, status, order?.runrId);
        if (
          order &&
          business &&
          order.fulfillment !== "pickup" &&
          (status === "ready" || status === "runr_assigned")
        ) {
          const already =
            get().pendingDelivery?.orderId === order.id || get().activeDelivery?.orderId === order.id;
          if (!already) {
            void offerDeliveryForOrder(order, business, customer?.name ?? "Customer").then(
              (delivery) => {
                if (delivery && !get().activeDelivery && !get().pendingDelivery) {
                  set({ pendingDelivery: delivery });
                }
              }
            );
          }
        }
      } else if (
        order &&
        business &&
        order.fulfillment !== "pickup" &&
        (status === "ready" || status === "runr_assigned") &&
        !get().pendingDelivery &&
        !get().activeDelivery
      ) {
        set({
          pendingDelivery: previewOfferForOrder(
            order,
            business,
            customer?.name ?? "Customer",
          ),
        });
      }
    },

    hydrateMarketplace: (snapshot: MarketplaceSnapshot, preview = false) =>
      set((s) => {
        if (preview && s.businesses.length > 0 && s.catalogPreview) {
          return {
            businesses: s.businesses,
            catalogPreview: true,
            pendingDelivery: s.activeDelivery ? s.pendingDelivery : snapshot.pendingDelivery,
            accessHold: snapshot.accessHold,
          };
        }
        return {
          catalogPreview: preview,
          businesses: snapshot.businesses,
          orders: snapshot.orders,
          scheduledRuns: snapshot.scheduledRuns,
          runHistory: snapshot.runHistory,
          activeRun: snapshot.activeRun,
          pendingDelivery: snapshot.pendingDelivery,
          activeDelivery: snapshot.activeDelivery,
          accessHold: snapshot.accessHold,
          earnings: snapshot.earnings,
          notifications: snapshot.notifications,
          favoriteBusinessIds: snapshot.favoriteBusinessIds,
          marketplaceUsers: snapshot.profiles,
          staffMessages: snapshot.staffMessages ?? [],
          marketplaceReady: true,
        };
      }),

    updateBusinessCapacity: (businessId: string, ruleId: string, maxRunrs: number) => {
      set((s) => ({
        businesses: s.businesses.map((b) =>
          b.id === businessId
            ? {
                ...b,
                coverageRules: b.coverageRules.map((r) =>
                  r.id === ruleId ? { ...r, maxRunrs } : r
                ),
              }
            : b
        ),
      }));
      if (!get().catalogPreview) void persistCoverage(ruleId, maxRunrs);
    },

    updateMenuItem: (businessId: string, itemId: string, patch: { price?: number; name?: string }) => {
      set((s) => ({
        businesses: s.businesses.map((b) =>
          b.id === businessId
            ? {
                ...b,
                menu: (b.menu ?? []).map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
              }
            : b
        ),
      }));
    },

    updateBusinessHours: (businessId: string, hours: string) => {
      set((s) => ({
        businesses: s.businesses.map((b) => (b.id === businessId ? { ...b, operatingHours: hours } : b)),
      }));
    },

    markNotificationRead: (id: string) => {
      set((s) => ({
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
      }));
      if (!get().catalogPreview) void persistNotificationRead(id);
    },

    sendStaffMessage: (body: string) => {
      const user = get().user;
      const text = body.trim();
      if (!user || !text) return;
      const message: StaffMessage = {
        id: crypto.randomUUID(),
        authorId: user.id,
        authorName: user.name,
        body: text,
        createdAt: new Date().toISOString(),
      };
      set((s) => ({ staffMessages: [...s.staffMessages, message] }));
      if (!get().catalogPreview) void persistStaffMessage(message);
    },
    setAuthReady: (authReady: boolean) => set({ authReady }),
    setMarketplaceReady: (marketplaceReady: boolean) => set({ marketplaceReady }),
    setOnboardingSeen: (onboardingSeen: boolean) => set({ onboardingSeen }),
    setDeliveryAddress: (deliveryAddress: string) => set({ deliveryAddress }),
    showToast: (message: string, tone: "ok" | "err" = "ok") => {
      set({ toast: { message, tone } });
      window.setTimeout(() => {
        const current = get().toast;
        if (current?.message === message) set({ toast: null });
      }, 2800);
    },
    clearToast: () => set({ toast: null }),
  };
}

export type AppStoreHook = UseBoundStore<StoreApi<AppState>>;

let activeStore: AppStoreHook | null = null;
let activeStorageKey = "porter-platform-marketplace";

function initStore(storageKey: string): AppStoreHook {
  const store = create<AppState>()(
    persist((set, get) => buildStore(set, get) as AppState, {
      name: storageKey,
      partialize: (state) => ({
        theme: state.theme,
        cart: state.cart,
        cartBusinessId: state.cartBusinessId,
        onboardingSeen: state.onboardingSeen,
        deliveryAddress: state.deliveryAddress,
        accessPreference: state.accessPreference,
        accessPreferenceUserId: state.accessPreferenceUserId,
      }),
    })
  );
  activeStore = store;
  activeStorageKey = storageKey;
  return store;
}

export function ensureStore(): AppStoreHook {
  if (!activeStore) {
    return initStore(activeStorageKey);
  }
  return activeStore;
}

/** Shared marketplace store — apps call createAppStore on boot. */
export function useAppStore<T>(selector: (state: AppState) => T): T;
export function useAppStore(): AppState;
export function useAppStore<T>(selector?: (state: AppState) => T) {
  const store = ensureStore();
  return selector ? store(selector) : store((s) => s);
}

export function createAppStore(storageKey: string): AppStoreHook {
  if (activeStore && activeStorageKey === storageKey) {
    return activeStore;
  }
  return initStore(storageKey);
}
