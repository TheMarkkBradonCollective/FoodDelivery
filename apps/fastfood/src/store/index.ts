"use client";

import { createAppStore } from "@porter/shared/store/create-app-store";

/** Customer app — connected to shared marketplace network */
export const useAppStore = createAppStore("porter-platform-marketplace");
