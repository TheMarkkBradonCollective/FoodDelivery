"use client";

import { createAppStore } from "@runr/shared/store/create-app-store";

/** VENDR business app — connected to shared marketplace state */
export const useAppStore = createAppStore("runr-platform-marketplace");
