import {
  type Plan,
  PlanSchema,
  type SavePlanRequest,
  type Target,
} from "@shared/contracts";
import {
  type Mutation,
  type MutationState,
  type QueryClient,
  queryOptions,
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";
import { z } from "zod";

import { apiRequest } from "./client";

export const planKeys = {
  all: ["plans"] as const,
  list: () => [...planKeys.all, "list"] as const,
  detail: (franchiseId: string) =>
    [...planKeys.all, "detail", franchiseId] as const,
  /** Mutation key of the saves for one plan. */
  save: (franchiseId: string) =>
    [...planKeys.all, "save", franchiseId] as const,
};

export function fetchPlans(signal?: AbortSignal) {
  return apiRequest("/plans", z.array(PlanSchema), { signal });
}

export function fetchPlan(franchiseId: string, signal?: AbortSignal) {
  return apiRequest(`/plans/${franchiseId}`, PlanSchema, { signal });
}

export function putPlan(request: SavePlanRequest) {
  return apiRequest(`/plans/${request.franchiseId}`, PlanSchema, {
    method: "PUT",
    body: request,
  });
}

/** All plans, for the picker's plan status. Normal freshness (N4). */
export function plansQueryOptions() {
  return queryOptions({
    queryKey: planKeys.list(),
    queryFn: ({ signal }) => fetchPlans(signal),
  });
}

export function usePlans() {
  return useQuery(plansQueryOptions());
}

/**
 * One plan. Normal freshness with refetch on focus (N4), except while saves
 * are queued: a refetch then would replace the optimistic plan with an
 * older server copy.
 */
export function planQueryOptions(client: QueryClient, franchiseId: string) {
  const refetchIfIdle = () => !hasPendingSaves(client, franchiseId);
  return queryOptions({
    queryKey: planKeys.detail(franchiseId),
    queryFn: ({ signal }) => fetchPlan(franchiseId, signal),
    refetchOnMount: refetchIfIdle,
    refetchOnWindowFocus: refetchIfIdle,
    refetchOnReconnect: refetchIfIdle,
  });
}

export function usePlan(franchiseId: string) {
  return useQuery(planQueryOptions(useQueryClient(), franchiseId));
}

// ---------------------------------------------------------------------------
// Saving (A4, D4, N4). Every save sends the whole plan. Saves for one plan
// share a mutation scope, so TanStack Query sends them one at a time, in
// order. Updates are optimistic. Latest wins: a failed save is only rolled
// back when no newer save is queued, because the newer one carries the
// whole plan. Rollback restores the last plan the server confirmed.
// ---------------------------------------------------------------------------

interface SaveVariables {
  request: SavePlanRequest;
  /** Increasing per save; tells queued saves apart inside callbacks. */
  seq: number;
}

let nextSeq = 0;

/** Last server-confirmed plan per franchise, per query client. */
const confirmedPlans = new WeakMap<QueryClient, Map<string, Plan>>();

function confirmedFor(client: QueryClient) {
  let plans = confirmedPlans.get(client);
  if (!plans) {
    plans = new Map();
    confirmedPlans.set(client, plans);
  }
  return plans;
}

function seqOf(mutation: Mutation): number {
  const variables = mutation.state.variables as SaveVariables | undefined;
  return variables?.seq ?? -1;
}

function pendingSaveSeqs(client: QueryClient, franchiseId: string) {
  return client
    .getMutationCache()
    .findAll({ mutationKey: planKeys.save(franchiseId), status: "pending" })
    .map(seqOf);
}

function hasPendingSaves(client: QueryClient, franchiseId: string) {
  return pendingSaveSeqs(client, franchiseId).length > 0;
}

export function savePlanMutationOptions(
  client: QueryClient,
  franchiseId: string,
) {
  const detailKey = planKeys.detail(franchiseId);
  const confirmed = confirmedFor(client);
  const hasNewerSave = (seq: number) =>
    pendingSaveSeqs(client, franchiseId).some((other) => other > seq);

  return {
    mutationKey: planKeys.save(franchiseId),
    scope: { id: `plan-save:${franchiseId}` },
    retry: false, // N4: roll back and show an error instead
    mutationFn: ({ request }: SaveVariables) => putPlan(request),

    onMutate: async ({ request, seq }: SaveVariables) => {
      await client.cancelQueries({ queryKey: detailKey });
      const current = client.getQueryData<Plan>(detailKey);
      if (!current) return;
      // The first save of a burst sees server state: remember it
      const isFirstPending = !pendingSaveSeqs(client, franchiseId).some(
        (other) => other < seq,
      );
      if (isFirstPending) confirmed.set(franchiseId, current);
      client.setQueryData<Plan>(detailKey, {
        ...current,
        targets: request.targets,
      });
    },

    onSuccess: (saved: Plan, { seq }: SaveVariables) => {
      confirmed.set(franchiseId, saved);
      if (!hasNewerSave(seq)) client.setQueryData(detailKey, saved);
      void client.invalidateQueries({ queryKey: planKeys.list() });
    },

    onError: (_error: unknown, { seq }: SaveVariables) => {
      if (hasNewerSave(seq)) return;
      const lastConfirmed = confirmed.get(franchiseId);
      if (lastConfirmed) client.setQueryData(detailKey, lastConfirmed);
    },
  };
}

/** Returns `save(targets)`, which saves the whole plan optimistically. */
export function useSavePlan(franchiseId: string) {
  const client = useQueryClient();
  const { mutate } = useMutation(savePlanMutationOptions(client, franchiseId));
  return useCallback(
    (targets: Target[]) => {
      mutate({
        request: { id: franchiseId, franchiseId, targets },
        seq: nextSeq++,
      });
    },
    [mutate, franchiseId],
  );
}

export type PlanSaveStatus =
  | { state: "idle" }
  | { state: "saving" }
  | { state: "saved"; updatedAt: string | null }
  | {
      state: "error";
      error: unknown;
      /** Resends the plan that failed (user-initiated, N4). */
      retry: () => void;
    };

/**
 * Status of the latest save for a plan, shared by every component. Only the
 * latest save counts: an earlier failure superseded by a newer save is not
 * an error.
 */
export function usePlanSaveStatus(franchiseId: string): PlanSaveStatus {
  const save = useSavePlan(franchiseId);
  const states = useMutationState({
    filters: { mutationKey: planKeys.save(franchiseId) },
    select: (mutation) =>
      mutation.state as MutationState<Plan, unknown, SaveVariables>,
  });
  const latest = states.at(-1);

  switch (latest?.status) {
    case undefined:
    case "idle":
      return { state: "idle" };
    case "pending":
      return { state: "saving" };
    case "success":
      return { state: "saved", updatedAt: latest.data?.updatedAt ?? null };
    case "error": {
      const failed = latest.variables?.request;
      return {
        state: "error",
        error: latest.error,
        retry: () => {
          if (failed) save(failed.targets);
        },
      };
    }
  }
}
