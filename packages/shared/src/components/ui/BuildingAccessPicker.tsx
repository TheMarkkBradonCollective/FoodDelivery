"use client";

import {
  ACCESS_NOTE_MAX,
  BUILDING_ACCESS_CHOICES,
  RUNNER_ACCESS_CHOICES,
} from "../../lib/delivery-access";
import type { BuildingAccess, RunnerAccessPreference } from "../../types/index";

function ChoiceButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold ring-1 ${
        selected
          ? "bg-purple text-white ring-purple"
          : "bg-[var(--background)] text-[var(--foreground)] ring-[var(--border)]"
      }`}
    >
      {label}
    </button>
  );
}

export function BuildingAccessPicker({
  value,
  note,
  onChange,
  onNoteChange,
}: {
  value: BuildingAccess | null;
  note: string;
  onChange: (value: BuildingAccess) => void;
  onNoteChange: (note: string) => void;
}) {
  return (
    <fieldset className="mt-2.5">
      <legend className="field-label">Building access</legend>
      <div className="mt-1 space-y-1.5">
        {BUILDING_ACCESS_CHOICES.map((choice) => (
          <ChoiceButton
            key={choice.value}
            label={choice.label}
            selected={value === choice.value}
            onClick={() => onChange(choice.value)}
          />
        ))}
      </div>
      <label className="field-label mt-2.5" htmlFor="access-note">
        Access note
      </label>
      <textarea
        id="access-note"
        value={note}
        maxLength={ACCESS_NOTE_MAX}
        rows={2}
        onChange={(event) => onNoteChange(event.target.value.slice(0, ACCESS_NOTE_MAX))}
        className="input-brand mt-1 min-h-16 resize-none"
        placeholder="Elevator is around the back of the building."
      />
      <p className="mt-1 text-[11px] text-[var(--muted)]">
        Optional. For example: “3rd floor — no elevator.” or “Stairs required after elevator.”
      </p>
    </fieldset>
  );
}

export function AccessPreferencePicker({
  value,
  onChange,
}: {
  value: RunnerAccessPreference | null;
  onChange: (value: RunnerAccessPreference) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm text-[var(--muted)]">
        Choose what you’re willing to use. Portr matches deliveries to this — no personal details needed.
      </legend>
      <div className="mt-4 space-y-1.5">
        {RUNNER_ACCESS_CHOICES.map((choice) => (
          <ChoiceButton
            key={choice.value}
            label={choice.label}
            selected={value === choice.value}
            onClick={() => onChange(choice.value)}
          />
        ))}
      </div>
    </fieldset>
  );
}
