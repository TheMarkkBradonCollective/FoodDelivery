import { mockOrders } from "@runr/shared/data/mock-data";
import { OrderTrackingClient } from "./OrderTrackingClient";

export function generateStaticParams() {
  const ids = new Set([
    ...mockOrders.map((o) => o.id),
    "order-demo",
  ]);
  return Array.from(ids).map((id) => ({ id }));
}

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderTrackingClient orderId={id} />;
}
