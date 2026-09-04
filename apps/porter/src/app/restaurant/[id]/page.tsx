import { mockBusinesses } from "@runr/shared/data/mock-data";
import { RestaurantClient } from "./RestaurantClient";

export function generateStaticParams() {
  return mockBusinesses.map((b) => ({ id: b.id }));
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RestaurantClient businessId={id} />;
}
