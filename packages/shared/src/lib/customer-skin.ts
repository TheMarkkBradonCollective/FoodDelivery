/** Alternate customer-facing brands on the same Portr marketplace backend. */
export type CustomerSkinId = "porter" | "fastfood";

export type CustomerSkin = {
  id: CustomerSkinId;
  shortName: string;
  tagline: string;
  signInLine: string;
  signInHighlight: string;
  themeColor: string;
  markBackground: string;
  markForeground: string;
  networkHint: string;
};

/** FastFood is Portr with a different name and palette — same copy and flows. */
export const CUSTOMER_SKINS: Record<CustomerSkinId, CustomerSkin> = {
  porter: {
    id: "porter",
    shortName: "Portr",
    tagline: "Get what you need.",
    signInLine: "Get what you",
    signInHighlight: "need.",
    themeColor: "#7048F8",
    markBackground: "#A0F878",
    markForeground: "#1A1224",
    networkHint: "Fulfilled by Portr Vendor · moved by Runners",
  },
  fastfood: {
    id: "fastfood",
    shortName: "FastFood",
    tagline: "Get what you need.",
    signInLine: "Get what you",
    signInHighlight: "need.",
    themeColor: "#E31837",
    markBackground: "#FFC72C",
    markForeground: "#7F1D1D",
    networkHint: "Fulfilled by Portr Vendor · moved by Runners",
  },
};

export function getCustomerSkin(id: CustomerSkinId = "porter"): CustomerSkin {
  return CUSTOMER_SKINS[id];
}
