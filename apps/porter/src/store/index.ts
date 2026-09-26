"use client";

import { createAppStore } from "@runr/shared/store/create-app-store";

/** Porter customer app — connected to shared marketplace network */
export const useAppStore = createAppStore("runr-platform-marketplace");
