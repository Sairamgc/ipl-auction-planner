import {
  useAuction,
  useFranchises,
  usePlans,
  usePlayers,
  useRetentions,
} from "@/api";
import { type PickerPreview, pickerPreview, squadBaseline } from "@/domain";
import type { Auction, Franchise } from "@shared/contracts";
import { useMemo } from "react";

export interface TeamPickerCard {
  franchise: Franchise;
  preview: PickerPreview;
}

export type TeamPickerState =
  | { status: "loading" }
  | { status: "error"; retry: () => void }
  | { status: "success"; auction: Auction; cards: TeamPickerCard[] };

/**
 * Everything the picker shows, from five parallel queries. Any failure
 * shows one error state (UI3); retry refetches only the failed queries.
 */
export function useTeamPicker(): TeamPickerState {
  const auction = useAuction();
  const franchises = useFranchises();
  const retentions = useRetentions();
  const players = usePlayers();
  const plans = usePlans();

  const cards = useMemo(() => {
    if (!auction.data || !franchises.data || !retentions.data) return null;
    if (!players.data || !plans.data) return null;
    const playersById = new Map(players.data.map((p) => [p.id, p]));
    const rules = auction.data.rules;
    const planData = plans.data;
    const retentionData = retentions.data;
    return franchises.data
      .map((franchise) => {
        const baseline = squadBaseline(
          franchise,
          rules,
          retentionData,
          playersById,
        );
        const plan = planData.find((p) => p.franchiseId === franchise.id);
        return {
          franchise,
          // A franchise without a plan has not started one
          preview: pickerPreview(baseline, plan ?? { targets: [] }),
        };
      })
      .sort((a, b) => a.franchise.name.localeCompare(b.franchise.name, "en"));
  }, [
    auction.data,
    franchises.data,
    retentions.data,
    players.data,
    plans.data,
  ]);

  const queries = [auction, franchises, retentions, players, plans];
  if (queries.some((query) => query.isError)) {
    return {
      status: "error",
      retry: () => {
        for (const query of queries) {
          if (query.isError) void query.refetch();
        }
      },
    };
  }
  if (!auction.data || !cards) return { status: "loading" };
  return { status: "success", auction: auction.data, cards };
}
