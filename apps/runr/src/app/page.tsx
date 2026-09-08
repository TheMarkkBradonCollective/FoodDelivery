"use client";

import { useMemo, useState } from "react";
import { MapView } from "@runr/shared/components/map";
import { MapControls, ActiveRunBanner } from "@runr/shared/components/map/MapControls";
import { SearchBar } from "@runr/shared/components/ui/SearchBar";
import { BottomSheet } from "@runr/shared/components/ui/BottomSheet";
import { PrimaryButton } from "@runr/shared/components/ui/PrimaryButton";
import { CoverageBadge } from "@runr/shared/components/ui/CoverageBadge";
import { CoverageTimeline } from "@runr/shared/components/ui/CoverageTimeline";
import { DeliveryCard } from "@runr/shared/components/ui/DeliveryCard";
import { useAppStore } from "@/store";
import {
  calculateCoverageTimeline,
  canScheduleRun,
  getBusinessCoverageSummary,
  getMarkerColor,
} from "@runr/shared/lib/coverage-engine";
import {
  calculateDistanceMiles,
  formatTimeRange,
  getCoverageStatusLabel,
  getDemandLabel,
} from "@runr/shared/lib/utils";
import { Flame, Star } from "lucide-react";
import { EmptyState } from "@runr/shared/components/ui/EmptyState";

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
  } = useAppStore();

  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [showRunConfirm, setShowRunConfirm] = useState(false);
  const [runStart, setRunStart] = useState("17:30");
  const [runEnd, setRunEnd] = useState("20:15");
  const [coverageAvailable, setCoverageAvailable] = useState<boolean | null>(null);

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
              ? `${coverage.gap} RUNR${coverage.gap > 1 ? "s" : ""} needed`
              : "FULL",
          onClick: () => setSelectedBusinessId(b.id),
        };
      }),
    [filteredBusinesses]
  );

  const openOpportunities = businesses.filter((b) => {
    const c = getBusinessCoverageSummary(b.coverageRules, b.scheduledRuns);
    return c.gap > 0;
  }).length;

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
    }
  }

  return (
    <div className="relative h-[calc(100vh-5rem)] w-full">
      <MapView
        center={location}
        userLocation={location}
        markers={mapMarkers}
        dark={theme === "dark"}
        className="absolute inset-0"
      />

      <MapControls onRecenter={() => setLocation(location)} />

      {/* Top overlay */}
      <div className="absolute inset-x-0 top-0 z-[1000] space-y-3 p-4">
        <div className="rounded-runr-lg bg-[var(--surface)]/95 px-3 py-2 shadow-runr-card backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-wider text-runr-primary">
            Choose → RUN → Deliver → Earn
          </p>
          <p className="text-xs text-[var(--muted)]">Pick it up. Run it there.</p>
        </div>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        {openOpportunities > 0 && (
          <div className="flex items-center gap-2 rounded-runr-lg bg-runr-primary px-4 py-2.5 text-sm font-semibold text-white shadow-runr-card">
            <Flame className="h-4 w-4" />
            {openOpportunities} RUN opportunities near you
          </div>
        )}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(
            [
              ["all", "All"],
              ["open", "Open RUNs"],
              ["gap", "RUN Gaps"],
              ["high_demand", "High Demand"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMapFilter(key)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                mapFilter === key
                  ? "bg-runr-primary text-white"
                  : "bg-[var(--surface)]/95 text-[var(--foreground)] border border-[var(--border)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Active run banner */}
      {activeRun && activeBusiness && !activeDelivery && (
        <ActiveRunBanner
          businessName={activeBusiness.name}
          timeRange={formatTimeRange(activeRun.startTime, activeRun.endTime)}
          deliveries={earnings.length}
          earnings={totalEarnings}
          onViewRun={() => setSelectedBusinessId(activeRun.businessId)}
        />
      )}

      {/* Pending delivery */}
      {activeRun && pendingDelivery && !activeDelivery && (
        <div className="absolute inset-x-4 bottom-24 z-[1000]">
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
        <div className="absolute inset-x-4 bottom-24 z-[1000] space-y-3">
          <DeliveryCard
            delivery={activeDelivery}
            businessName={
              businesses.find((b) => b.id === activeDelivery.businessId)?.name ?? ""
            }
            variant={activeDelivery.status === "accepted" ? "pickup" : "dropoff"}
            onNavigate={() => {}}
          />
          <PrimaryButton className="w-full" onClick={completeDelivery}>
            {activeDelivery.status === "accepted"
              ? "Confirm Pickup"
              : "Complete Delivery"}
          </PrimaryButton>
        </div>
      )}

      {businesses.length === 0 && (
        <div className="absolute inset-x-4 bottom-24 z-[1000]">
          <EmptyState
            title="No RUN opportunities yet"
            description="Business coverage will appear on the map once marketplace data is connected."
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
              Confirm RUN
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
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">{selectedBusiness.name}</h3>
              <p className="text-sm text-[var(--muted)]">
                Select your custom start and end time
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div className="rounded-runr-lg border border-runr-success/30 bg-runr-success-muted p-4 text-center">
                <p className="font-semibold text-runr-success">COVERAGE AVAILABLE</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Your requested RUN period has open capacity
                </p>
              </div>
            )}

            {coverageAvailable === false && (
              <div className="rounded-runr-lg border border-runr-critical/30 bg-runr-critical-muted p-4 text-center">
                <p className="font-semibold text-runr-critical">NOT AVAILABLE</p>
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
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{business.name}</h2>
            <button type="button" onClick={onFavoriteToggle} aria-label="Toggle favorite">
              <Star
                className={`h-5 w-5 ${
                  isFavorite ? "fill-runr-warning text-runr-warning" : "text-runr-neutral-300"
                }`}
              />
            </button>
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            ★ {business.rating} · {distance.toFixed(1)} miles away
          </p>
          {business.demandLevel === "high" && (
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-runr-primary">
              High Demand
            </p>
          )}
        </div>
        <CoverageBadge status={coverage.status} gap={coverage.gap} />
      </div>

      <div className="rounded-runr-lg border border-[var(--border)] p-4">
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
          <p className="mt-2 text-sm font-semibold text-runr-critical">
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
        <p className="text-lg font-bold uppercase text-runr-primary">
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
        className="w-full rounded-runr-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
      />
    </div>
  );
}
