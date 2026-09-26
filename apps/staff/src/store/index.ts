"use client";

import { createAppStore } from "@porter/shared/store/create-app-store";

/** Porter Command platform app — connected to shared marketplace state */
export const useAppStore = createAppStore("porter-platform-marketplace");
