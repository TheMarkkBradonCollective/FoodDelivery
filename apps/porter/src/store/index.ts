"use client";

import { createAppStore } from "@porter/shared/store/create-app-store";

/** Portr customer app — connected to shared marketplace network */
export const useAppStore = createAppStore("porter-platform-marketplace");
