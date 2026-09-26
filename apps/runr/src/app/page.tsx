"use client";

import { useMemo, useState, useEffect } from "react";
import { MapView } from "@porter/shared/components/map";
import { MapControls, ActiveRunBanner } from "@porter/shared/components/map/MapControls";
import { SearchBar } from "@porter/shared/components/ui/SearchBar";
import { SegmentedControl } from "@porter/shared/components/ui/SegmentedControl";
import { BottomSheet } from "@porter/shared/components/ui/BottomSheet";
import { PrimaryButton } from "@porter/shared/components/ui/PrimaryButton";
import { CoverageBadge } from "@porter/shared/components/ui/CoverageBadge";
import { CoverageTimeline } from "@porter/shared/components/ui/CoverageTimeline";
import { DeliveryCard } from "@porter/shared/components/ui/DeliveryCard";
import { useAppStore } from "@/store";
import {
  calculateCoverageTimeline,
  canScheduleRun,
  getBusinessCoverageSummary,
  getMarkerColor,
} from "@porter/shared/lib/coverage-engine";
import {
  calculateDistanceMiles,
  formatTimeRange,
  getCoverageStatusLabel,
  getDemandLabel,
} from "@porter/shared/lib/utils";
import { Star } from "lucide-react";
import { EmptyState } from "@porter/shared/components/ui/EmptyState";
import { CatalogPreviewBanner } from "@porter/shared/components/ui/CatalogPreviewBanner";

export default function RunrMapPage() {
  const {
    businesses,
    location,
    setLocation,
    searchQuery,
    setSearchQuery,
    mapFilter,
    setMapFilter,
    favoriteBusinessIds,
    toggleFavorite,
    activeRun,
    pendingDelivery,
    activeDelivery,
    earnings,
    confirmRun,
    acceptDelivery,
    completeDelivery,
    theme,
    showToast,
  } = useAppStore();

  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [showRunConfirm, setShowRunConfirm] = useState(false);
  const [runStart, setRunStart] = useState("17:30");
  const [runEnd, setRunEnd] = useState("20:15");
  const [coverageAvailable, setCoverageAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("kitchen");
    if (id) setSelectedBusinessId(id);
  }, []);

  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);

  const filteredBusinesses = useMemo(() => {
    let result = businesses;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.cuisine.toLowerCase().includes(q) ||
          b.city.toLowerCase().includes(q) ||
          b.zip.includes(q)
      );
    }

    if (mapFilter === "gap") {
      result = result.filter((b) => {
        const c = getBusinessCoverageSummary(b.coverageRules, b.scheduledRuns);
        return c.status === "gap" || c.status === "low";
      });
    } else if (mapFilter === "open") {
      result = result.filter((b) => {
        const c = getBusinessCoverageSummary(b.coverageRules, b.scheduledRuns);
        return c.status !== "full";
      });
    } else if (mapFilter === "high_demand") {
      result = result.filter((b) => b.demandLevel === "high" || b.demandLevel === "busy");
    }

    return result;
  }, [businesses, searchQuery, mapFilter]);

  const mapMarkers = useMemo(
    () =>
      filteredBusinesses.map((b) => {
        const coverage = getBusinessCoverageSummary(b.coverageRules, b.scheduledRuns);
        return {
          id: b.id,
          position: b.location,
          color: getMarkerColor(coverage.status, b.demandLevel === "high"),
          label: coverage.gap > 0 ? String(coverage.gap) : undefined,
          title: b.name,
          subtitle:
            coverage.gap > 0
              ? `${coverage.gap} Runner${coverage.gap > 1 ? "s" : ""} needed`
              : "FULL",
          onClick: () => setSelectedBusinessId(b.id),
        };
      }),
    [filteredBusinesses]
  );

  const coverageTimeline = selectedBusiness
    ? calculateCoverageTimeline(
        selectedBusiness.coverageRules,
        selectedBusiness.scheduledRuns
      ).filter((i) => i.maxRunrs > 0)
    : [];

  const currentCoverage = selectedBusiness
    ? getBusinessCoverageSummary(
        selectedBusiness.coverageRules,
        selectedBusiness.scheduledRuns
      )
    : null;

  const activeBusiness = activeRun
    ? businesses.find((b) => b.id === activeRun.businessId)
    : null;

  const totalEarnings = earnings.reduce((s, e) => s + e.total, 0);

  function handleCheckCoverage() {
    if (!selectedBusiness) return;
    const { available } = canScheduleRun(
      runStart,
      runEnd,
      selectedBusiness.coverageRules,
      selectedBusiness.scheduledRuns
    );
    setCoverageAvailable(available);
  }

  function handleConfirmRun() {
    if (!selectedBusiness) return;
    const success = confirmRun(selectedBusiness.id, runStart, runEnd);
    if (success) {
      setShowRunConfirm(false);
      setSelectedBusinessId(null);
      setCoverageAvailable(null);
    } else {
      showToast("That window is full. Try different times.", "err");
    }
  }

  return (
    <div className="map-screen">
      <MapView
        center={location}
        userLocation={location}
        markers={mapMarkers}
        route={
          activeDelivery
            ? { from: activeDelivery.pickup, to: activeDelivery.dropoff }
            : pendingDelivery
              ? { from: pendingDelivery.pickup, to: pendingDelivery.dropoff }
              : undefined
        }
        dark={theme === "dark"}
        className="absolute inset-0"
      />

      <MapControls
        onRecenter={() => setLocation(location)}
        className={activeDelivery || pendingDelivery ? "top-4" : "top-[7.5rem]"}
      />

      {!activeDelivery && !pendingDelivery && (
        <div className="absolute inset-x-0 top-0 z-[1000] space-y-2 p-3">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search businesses" />
          <CatalogPreviewBanner />
          <SegmentedControl
            size="sm"
            value={mapFilter}
            onChange={setMapFilter}
            options={[
              { value: "all", label: "All" },
              { value: "open", label: "Open" },
              { value: "gap", label: "Gaps" },
              { value: "high_demand", label: "Busy" },
            ]}
          />
        </div>
      )}

      {/* Active run banner */}
      {activeRun && activeBusiness && !activeDelivery && !pendingDelivery && (
        <ActiveRunBanner
          businessName={activeBusiness.name}
          timeRange={formatTimeRange(activeRun.startTime, activeRun.endTime)}
          deliveries={earnings.length}
          earnings={totalEarnings}
          onViewRun={() => setSelectedBusinessId(activeRun.businessId)}
        />
      )}

      {/* Pending delivery */}
      {pendingDelivery && !activeDelivery && (
        <div className="map-dock">
          <DeliveryCard
            delivery={pendingDelivery}
            businessName={
              businesses.find((b) => b.id === pendingDelivery.businessId)?.name ?? ""
            }
            variant="offer"
            onAccept={acceptDelivery}
          />
        </div>
      )}

      {/* Active delivery */}
      {activeDelivery && (
        <div className="map-dock space-y-3">
          <DeliveryCard
            delivery={activeDelivery}
            businessName={
              businesses.find((b) => b.id === activeDelivery.businessId)?.name ?? ""
            }
            variant={activeDelivery.status === "accepted" ? "pickup" : "dropoff"}
            onNavigate={() => {
              const kitchen = businesses.find((b) => b.id === activeDelivery.businessId);
              if (!kitchen) return;
              const { lat, lng } = kitchen.location;
              window.open(
                `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`,
                "_blank",
                "noopener,noreferrer",
              );
            }}
            onComplete={completeDelivery}
            completeLabel={
              activeDelivery.status === "accepted" ? "Slide to pick up" : "Slide to complete"
            }
          />
        </div>
      )}

      {businesses.length === 0 && (
        <div className="map-dock">
          <EmptyState
            title="No RUN opportunities yet"
            description="Nearby businesses will show here once coverage is live. Pull to refresh after signing in."
          />
        </div>
      )}

      {/* Business bottom sheet */}
      <BottomSheet
        open={!!selectedBusiness && !showRunConfirm}
        onClose={() => setSelectedBusinessId(null)}
        snap="half"
        stickyAction={
          selectedBusiness && (
            <PrimaryButton
              className="w-full"
              onClick={() => {
                setShowRunConfirm(true);
                setCoverageAvailable(null);
              }}
            >
              View RUN
            </PrimaryButton>
          )
        }
      >
        {selectedBusiness && currentCoverage && (
          <BusinessSheetContent
            business={selectedBusiness}
            coverage={currentCoverage}
            timeline={coverageTimeline}
            isFavorite={favoriteBusinessIds.includes(selectedBusiness.id)}
            onFavoriteToggle={() => toggleFavorite(selectedBusiness.id)}
            userLocation={location}
            onWorkHere={() => {
              setShowRunConfirm(true);
              setCoverageAvailable(null);
            }}
          />
        )}
      </BottomSheet>

      {/* RUN confirmation sheet */}
      <BottomSheet
        open={showRunConfirm && !!selectedBusiness}
        onClose={() => setShowRunConfirm(false)}
        snap="expanded"
        title="Choose Your RUN"
        stickyAction={
          coverageAvailable === true ? (
            <PrimaryButton className="w-full" onClick={handleConfirmRun}>
              Confirm this window
            </PrimaryButton>
          ) : (
            <PrimaryButton
              className="w-full"
              variant="secondary"
              onClick={handleCheckCoverage}
            >
              Check Coverage
            </PrimaryButton>
          )
        }
      >
        {selectedBusiness && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold">I&apos;m covering {selectedBusiness.name}</h3>
              <p className="text-sm text-[var(--muted)]">
                Choose your window. The marketplace matches Porter orders to this shift — you don&apos;t wait on random pings.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TimeInput
                label="Start"
                value={runStart}
                onChange={(v) => {
                  setRunStart(v);
                  setCoverageAvailable(null);
                }}
              />
              <TimeInput
                label="End"
                value={runEnd}
                onChange={(v) => {
                  setRunEnd(v);
                  setCoverageAvailable(null);
                }}
              />
            </div>

            <p className="text-sm text-[var(--muted)]">
              Selected: {formatTimeRange(runStart, runEnd)}
            </p>

            {coverageAvailable === true && (
              <div className="rounded-2xl border border-porter-success/30 bg-porter-success-muted p-3 text-center">
                <p className="font-semibold text-porter-success">COVERAGE AVAILABLE</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Your requested RUN period has open capacity
                </p>
              </div>
            )}

            {coverageAvailable === false && (
              <div className="rounded-2xl border border-porter-critical/30 bg-porter-critical-muted p-3 text-center">
                <p className="font-semibold text-porter-critical">NOT AVAILABLE</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Coverage is full for part of your selected period. Try adjusting times.
                </p>
              </div>
            )}

            <CoverageTimeline intervals={coverageTimeline.slice(0, 6)} compact />
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

function BusinessSheetContent({
  business,
  coverage,
  timeline,
  isFavorite,
  onFavoriteToggle,
  userLocation,
}: {
  business: NonNullable<ReturnType<typeof useAppStore.getState>["businesses"][0]>;
  coverage: ReturnType<typeof getBusinessCoverageSummary>;
  timeline: ReturnType<typeof calculateCoverageTimeline>;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  userLocation: { lat: number; lng: number };
  onWorkHere: () => void;
}) {
  const distance = calculateDistanceMiles(userLocation, business.location);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold">{business.name}</h2>
            <button type="button" onClick={onFavoriteToggle} aria-label="Toggle favorite">
              <Star
                className={`h-5 w-5 ${
                  isFavorite ? "fill-porter-warning text-porter-warning" : "text-porter-neutral-300"
                }`}
              />
            </button>
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            ★ {business.rating} · {distance.toFixed(1)} miles away
          </p>
          {business.demandLevel === "high" && (
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-porter-primary">
              High Demand
            </p>
          )}
        </div>
        <CoverageBadge status={coverage.status} gap={coverage.gap} />
      </div>

      <div className="rounded-2xl border border-[var(--border)] p-3.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Current Coverage
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">{coverage.maxRunrs}</span>
          <span className="text-sm text-[var(--muted)]">needed</span>
          <span className="mx-2 text-[var(--muted)]">·</span>
          <span className="text-2xl font-bold">{coverage.scheduledRunrs}</span>
          <span className="text-sm text-[var(--muted)]">covered</span>
        </div>
        {coverage.gap > 0 && (
          <p className="mt-2 text-sm font-semibold text-porter-critical">
            {getCoverageStatusLabel(coverage.status, coverage.gap)}
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Today&apos;s Coverage</p>
        <CoverageTimeline intervals={timeline.slice(0, 4)} compact />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Estimated Delivery Activity</p>
        <p className="text-lg font-bold uppercase text-porter-primary">
          {getDemandLabel(business.demandLevel)}
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Historical estimates — not guaranteed earnings
        </p>
      </div>
    </div>
  );
}

function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-brand"
      />
    </div>
  );
}
