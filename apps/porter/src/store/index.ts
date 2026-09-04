"use client";

import { createAppStore } from "@runr/shared/store/create-app-store";

/** PORTER customer app — connected to shared marketplace network */
export const useAppStore = createAppStore("runr-platform-marketplace");
