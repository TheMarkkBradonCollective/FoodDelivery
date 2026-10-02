"use client";

import { createAppStore } from "@porter/shared/store/create-app-store";

/** Portr Vendor business app — connected to shared marketplace state */
export const useAppStore = createAppStore("porter-platform-marketplace");
