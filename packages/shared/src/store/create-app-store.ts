"use client";

import { create, type StoreApi, type UseBoundStore } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Business,
  CartItem,
  Delivery,
  Order,
  Run,
  User,
  UserRole,
} from "../types/index";
import { canScheduleRun } from "../lib/coverage-engine";
import {
  DEFAULT_LOCATION,
  mockBusinesses,
  mockDeliveries,
  mockEarnings,
  mockNotifications,
  mockOrders,
  mockRunHistory,
  mockRunrProfile,
  mockUsers,
} from "../data/mock-data";

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
  notifications: typeof mockNotifications;
  earnings: typeof mockEarnings;
  searchQuery: string;
  mapFilter: "all" | "open" | "gap" | "high_demand";

  setUser: (user: User | null) => void;
  loginAs: (role: UserRole) => void;
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
    businesses: mockBusinesses,
    activeRun: null,
    scheduledRuns: [] as Run[],
    runHistory: mockRunHistory,
    activeDelivery: null,
    pendingDelivery: mockDeliveries[0] ?? null,
    orders: mockOrders,
    cart: [] as CartItem[],
    cartBusinessId: null,
    favoriteBusinessIds: mockRunrProfile.favoriteBusinessIds,
    notifications: mockNotifications,
    earnings: mockEarnings,
    searchQuery: "",
    mapFilter: "all" as const,

    setUser: (user: User | null) => set({ user }),
    loginAs: (role: UserRole) => {
      const user = mockUsers.find((u) => u.role === role) ?? null;
      set({ user });
    },
    logout: () => set({ user: null }),
    toggleTheme: () =>
      set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
    setLocation: (location: { lat: number; lng: number }) => set({ location }),
    setSearchQuery: (searchQuery: string) => set({ searchQuery }),
    setMapFilter: (mapFilter: AppState["mapFilter"]) => set({ mapFilter }),
    toggleFavorite: (businessId: string) =>
      set((s) => ({
        favoriteBusinessIds: s.favoriteBusinessIds.includes(businessId)
          ? s.favoriteBusinessIds.filter((id) => id !== businessId)
          : [...s.favoriteBusinessIds, businessId],
      })),

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
        id: `run-${Date.now()}`,
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
    },

    cancelRun: (runId: string) =>
      set((s) => ({
        scheduledRuns: s.scheduledRuns.filter((r) => r.id !== runId),
        businesses: s.businesses.map((b) => ({
          ...b,
          scheduledRuns: b.scheduledRuns.filter((r) => r.id !== runId),
        })),
      })),

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
    },

    completeDelivery: () => {
      const { activeDelivery, earnings, user } = get();
      if (!activeDelivery || !user) return;

      const record = {
        id: `earn-${Date.now()}`,
        runrId: user.id,
        businessId: activeDelivery.businessId,
        businessName:
          get().businesses.find((b) => b.id === activeDelivery.businessId)?.name ??
          "Business",
        deliveryId: activeDelivery.id,
        basePay: activeDelivery.basePay,
        distancePay: activeDelivery.distancePay,
        tip: activeDelivery.tip || 5.0,
        total: activeDelivery.totalEarnings + 5.0,
        completedAt: new Date().toISOString(),
      };

      set({
        activeDelivery: null,
        earnings: [...earnings, record],
      });
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
        id: `order-${Date.now()}`,
        customerId: user.id,
        businessId: cartBusinessId,
        items: cart,
        subtotal,
        deliveryFee,
        serviceFee,
        tax,
        tip,
        total,
        status: "accepted",
        createdAt: new Date().toISOString(),
      };

      set((s) => ({
        orders: [order, ...s.orders],
        cart: [],
        cartBusinessId: null,
      }));

      return order;
    },

    updateBusinessCapacity: (businessId: string, ruleId: string, maxRunrs: number) =>
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
      })),

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
        user: state.user,
        theme: state.theme,
        favoriteBusinessIds: state.favoriteBusinessIds,
        scheduledRuns: state.scheduledRuns,
        runHistory: state.runHistory,
        orders: state.orders,
        businesses: state.businesses,
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
