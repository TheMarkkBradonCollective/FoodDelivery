"use client";

import { create, type StoreApi, type UseBoundStore } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Business,
  CartItem,
  Delivery,
  EarningRecord,
  Notification,
  Order,
  Run,
  User,
} from "../types/index";
import { canScheduleRun } from "../lib/coverage-engine";
import { DEFAULT_LOCATION } from "../data/constants";
import { signOut } from "../lib/supabase/auth";
import type { MarketplaceSnapshot } from "../lib/supabase/marketplace";
import {
  offerDeliveryForOrder,
  persistCoverage,
  persistDelivery,
  persistEarning,
  persistFavorite,
  persistNotification,
  persistOrder,
  persistOrderStatus,
  persistRun,
} from "../lib/supabase/marketplace";

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
  searchQuery: string;
  mapFilter: "all" | "open" | "gap" | "high_demand";

  setUser: (user: User | null) => void;
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
  placeOrder: () => Order | null;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  hydrateMarketplace: (snapshot: MarketplaceSnapshot) => void;
  updateBusinessCapacity: (businessId: string, ruleId: string, maxRunrs: number) => void;
  markNotificationRead: (id: string) => void;
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
    searchQuery: "",
    mapFilter: "all" as const,

    setUser: (user: User | null) => set({ user }),
    logout: () => {
      void signOut();
      set({ user: null });
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
        if (s.user) void persistFavorite(s.user.id, businessId, liked);
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

      void persistRun(newRun);
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
      void persistRun(checkedIn);
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
      void persistRun(completed);
    },

    cancelRun: (runId: string) =>
      set((s) => {
        const run = s.scheduledRuns.find((r) => r.id === runId);
        if (run) void persistRun({ ...run, status: "cancelled" });
        return {
          scheduledRuns: s.scheduledRuns.filter((r) => r.id !== runId),
          businesses: s.businesses.map((b) => ({
            ...b,
            scheduledRuns: b.scheduledRuns.filter((r) => r.id !== runId),
          })),
        };
      }),

    acceptDelivery: () => {
      const { pendingDelivery, user } = get();
      if (!pendingDelivery || !user) return;

      set({
        activeDelivery: {
          ...pendingDelivery,
          runrId: user.id,
          status: "accepted",
        },
        pendingDelivery: null,
      });
      void persistDelivery({ ...pendingDelivery, runrId: user.id, status: "accepted" });
      void persistOrderStatus(pendingDelivery.orderId, "runr_assigned", user.id);
    },

    completeDelivery: () => {
      const { activeDelivery, earnings, user } = get();
      if (!activeDelivery || !user) return;

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
      void persistDelivery({ ...activeDelivery, status: "completed" });
      void persistEarning(record);
      void persistOrderStatus(activeDelivery.orderId, "delivered", user.id);
    },

    addToCart: (businessId: string, item: CartItem) =>
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
      }),

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

    placeOrder: () => {
      const { cart, cartBusinessId, user } = get();
      if (!cart.length || !cartBusinessId || !user) return null;

      const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const deliveryFee = 2.99;
      const serviceFee = 1.5;
      const tax = subtotal * 0.0875;
      const tip = 5.0;
      const total = subtotal + deliveryFee + serviceFee + tax + tip;

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

      void persistOrder(order);
      void persistNotification(user.id, note);
      const business = get().businesses.find((b) => b.id === cartBusinessId);
      if (business) {
        void offerDeliveryForOrder(order, business, user.name);
      }

      return order;
    },

    updateOrderStatus: (orderId: string, status: Order["status"]) => {
      const order = get().orders.find((o) => o.id === orderId);
      set((s) => ({
        orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
      }));
      void persistOrderStatus(orderId, status, order?.runrId);
    },

    hydrateMarketplace: (snapshot: MarketplaceSnapshot) =>
      set({
        businesses: snapshot.businesses,
        orders: snapshot.orders,
        scheduledRuns: snapshot.scheduledRuns,
        runHistory: snapshot.runHistory,
        activeRun: snapshot.activeRun,
        pendingDelivery: snapshot.pendingDelivery,
        activeDelivery: snapshot.activeDelivery,
        earnings: snapshot.earnings,
        notifications: snapshot.notifications,
        favoriteBusinessIds: snapshot.favoriteBusinessIds,
        marketplaceUsers: snapshot.profiles,
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
      void persistCoverage(ruleId, maxRunrs);
    },

    markNotificationRead: (id: string) =>
      set((s) => ({
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
      })),
  };
}

export type AppStoreHook = UseBoundStore<StoreApi<AppState>>;

let activeStore: AppStoreHook | null = null;
let activeStorageKey = "runr-platform-marketplace";

function initStore(storageKey: string): AppStoreHook {
  const store = create<AppState>()(
    persist((set, get) => buildStore(set, get) as AppState, {
      name: storageKey,
      partialize: (state) => ({
        theme: state.theme,
        cart: state.cart,
        cartBusinessId: state.cartBusinessId,
      }),
    })
  );
  activeStore = store;
  activeStorageKey = storageKey;
  return store;
}

function ensureStore(): AppStoreHook {
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
