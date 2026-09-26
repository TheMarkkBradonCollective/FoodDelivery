"use client";

import { createAppStore } from "@porter/shared/store/create-app-store";

/** Porter customer app — connected to shared marketplace network */
export const useAppStore = createAppStore("porter-platform-marketplace");
