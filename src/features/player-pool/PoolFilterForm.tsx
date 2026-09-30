import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BOWLING_STYLE_LABELS,
  formatLakh,
  maxBaseOptions,
  minBaseOptions,
  ROLE_LABELS,
} from "@/domain";
import {
  BOWLING_STYLES,
  PLAYER_ROLES,
  type BowlingStyle,
  type PlayerRole,
} from "@shared/contracts";
import { useId } from "react";

import type { PoolSearch } from "./poolSearch";

interface PoolFilterFormProps {
  search: PoolSearch;
  update: (change: Partial<PoolSearch>) => void;
}

const ANY = "any";

/** Toggles one value in a multi-select list (N10). */
function toggle<T>(list: T[] | undefined, value: T, on: boolean): T[] {
  const current = list ?? [];
  return on ? [...current, value] : current.filter((item) => item !== value);
}

/**
 * Every pool filter. Changes apply immediately (UI26). Grouped with
 * fieldset/legend; each option's whole row is the tap target (V6).
 */
export function PoolFilterForm({ search, update }: PoolFilterFormProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-5">
      <CheckboxGroup
        legend="Role"
        values={PLAYER_ROLES}
        labels={ROLE_LABELS}
        selected={search.role}
        onChange={(value: PlayerRole, on) => {
          update({ role: toggle(search.role, value, on) });
        }}
      />
      <CheckboxGroup
        legend="Bowling style"
        values={BOWLING_STYLES}
        labels={BOWLING_STYLE_LABELS}
        selected={search.bowlingStyle}
        columns
        onChange={(value: BowlingStyle, on) => {
          update({ bowlingStyle: toggle(search.bowlingStyle, value, on) });
        }}
      />
      <Choice
        legend="Nationality"
        value={flagValue(search.overseas, "overseas", "indian")}
        options={[
          [ANY, "Any"],
          ["indian", "Indian"],
          ["overseas", "Overseas"],
        ]}
        onChange={(value) => {
          update({
            overseas: value === ANY ? undefined : value === "overseas",
          });
        }}
      />
      <Choice
        legend="Status"
        value={flagValue(search.capped, "capped", "uncapped")}
        options={[
          [ANY, "Any"],
          ["capped", "Capped"],
          ["uncapped", "Uncapped"],
        ]}
        onChange={(value) => {
          update({ capped: value === ANY ? undefined : value === "capped" });
        }}
      />
      <Choice
        legend="Batting hand"
        value={search.battingHand ?? ANY}
        options={[
          [ANY, "Any"],
          ["right", "Right"],
          ["left", "Left"],
        ]}
        onChange={(value) => {
          update({
            battingHand:
              value === "right" || value === "left" ? value : undefined,
          });
        }}
      />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Base price</legend>
        <div className="grid grid-cols-2 gap-3">
          <SlabSelect
            id={`${id}-min`}
            label="From"
            value={search.minBase}
            options={minBaseOptions(search.maxBase)}
            onChange={(minBase) => {
              update({ minBase });
            }}
          />
          <SlabSelect
            id={`${id}-max`}
            label="Up to"
            value={search.maxBase}
            options={maxBaseOptions(search.minBase)}
            onChange={(maxBase) => {
              update({ maxBase });
            }}
          />
        </div>
      </fieldset>
    </div>
  );
}

function flagValue(value: boolean | undefined, yes: string, no: string) {
  if (value === undefined) return ANY;
  return value ? yes : no;
}

function CheckboxGroup<T extends string>({
  legend,
  values,
  labels,
  selected,
  columns = false,
  onChange,
}: {
  legend: string;
  values: readonly T[];
  labels: Record<T, string>;
  selected: T[] | undefined;
  columns?: boolean;
  onChange: (value: T, on: boolean) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      <div className={columns ? "grid grid-cols-2 gap-x-3" : "flex flex-col"}>
        {values.map((value) => (
          <Label
            key={value}
            className="flex touch-target cursor-pointer items-center gap-2 py-1 font-normal"
          >
            <Checkbox
              checked={selected?.includes(value) ?? false}
              onCheckedChange={(checked) => {
                onChange(value, checked === true);
              }}
            />
            {labels[value]}
          </Label>
        ))}
      </div>
    </fieldset>
  );
}

function Choice({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}) {
  const legendId = useId();
  return (
    <fieldset>
      <legend id={legendId} className="mb-2 text-sm font-medium">
        {legend}
      </legend>
      <RadioGroup
        aria-labelledby={legendId}
        value={value}
        onValueChange={onChange}
        className="flex flex-wrap gap-x-4 gap-y-1"
      >
        {options.map(([optionValue, label]) => (
          <Label
            key={optionValue}
            className="flex touch-target cursor-pointer items-center gap-2 py-1 font-normal"
          >
            <RadioGroupItem value={optionValue} />
            {label}
          </Label>
        ))}
      </RadioGroup>
    </fieldset>
  );
}

function SlabSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: number | undefined;
  options: number[];
  onChange: (value: number | undefined) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Select
        value={value === undefined ? ANY : String(value)}
        onValueChange={(next) => {
          onChange(next === ANY ? undefined : Number(next));
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Any</SelectItem>
          {options.map((slab) => (
            <SelectItem key={slab} value={String(slab)}>
              {formatLakh(slab)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
