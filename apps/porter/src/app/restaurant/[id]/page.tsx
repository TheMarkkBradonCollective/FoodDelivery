import { RestaurantClient } from "./RestaurantClient";

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RestaurantClient businessId={id} />;
}
