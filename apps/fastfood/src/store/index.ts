"use client";

import { createAppStore } from "@porter/shared/store/create-app-store";

/** FastFood customer skin — same marketplace network as Porter */
export const useAppStore = createAppStore("porter-platform-marketplace");
