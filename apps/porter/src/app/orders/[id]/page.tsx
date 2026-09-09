import { OrderTrackingClient } from "./OrderTrackingClient";

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderTrackingClient orderId={id} />;
}
