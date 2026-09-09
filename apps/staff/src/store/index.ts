"use client";

import { createAppStore } from "@runr/shared/store/create-app-store";

/** STAFF platform app — connected to shared marketplace state */
export const useAppStore = createAppStore("runr-platform-marketplace");
