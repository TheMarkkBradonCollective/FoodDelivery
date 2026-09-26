"use client";

import { createAppStore } from "@runr/shared/store/create-app-store";

/** Porter Vendor business app — connected to shared marketplace state */
export const useAppStore = createAppStore("runr-platform-marketplace");
