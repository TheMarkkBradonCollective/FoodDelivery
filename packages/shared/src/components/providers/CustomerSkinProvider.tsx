"use client";

import { createContext, useContext, type ReactNode } from "react";
import { getCustomerSkin, type CustomerSkin, type CustomerSkinId } from "../../lib/customer-skin";

const CustomerSkinContext = createContext<CustomerSkin>(getCustomerSkin("porter"));

export function CustomerSkinProvider({
  skinId,
  children,
}: {
  skinId: CustomerSkinId;
  children: ReactNode;
}) {
  return (
    <CustomerSkinContext.Provider value={getCustomerSkin(skinId)}>
      {children}
    </CustomerSkinContext.Provider>
  );
}

export function useCustomerSkin() {
  return useContext(CustomerSkinContext);
}
