import { useAuction, usePlan, useSavePlan } from "@/api";
import { InitialsAvatar } from "@/components/common/InitialsAvatar";
import { Money } from "@/components/common/Money";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addTarget,
  ageOn,
  formatLakh,
  ROLE_LABELS,
  validateExpectedPrice,
} from "@/domain";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Franchise, PoolRow } from "@shared/contracts";
import { useEffect, useId, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { useAddTargetStore } from "./addTargetStore";

/** Arrow keys change the price by this many lakh (UI36). */
const PRICE_STEP_LAKH = 5;

function priceSchema(basePriceLakh: number) {
  return z.object({
    price: z.string().superRefine((text, context) => {
      const result = validateExpectedPrice(text, basePriceLakh);
      if (!result.ok)
        context.addIssue({ code: "custom", message: result.error });
    }),
  });
}

/**
 * Add a pool player to the plan with an expected price (flow 2, D10).
 * Rendered once per workspace; opened with `openAddTarget`.
 */
export function AddTargetDialog({ franchise }: { franchise: Franchise }) {
  const { request, isOpen, close } = useAddTargetStore();
  const [announcement, setAnnouncement] = useState("");
  // Focus goes back to the row after adding, to Add after cancelling
  const afterClose = useRef<HTMLElement | null>(null);

  // Leaving the workspace closes the dialog
  useEffect(() => close, [close]);

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        {request && (
          <DialogContent
            className="max-w-md"
            onOpenAutoFocus={() => {
              afterClose.current = request.opener;
            }}
            onCloseAutoFocus={(event) => {
              const target = afterClose.current;
              if (target?.isConnected) {
                event.preventDefault();
                target.focus();
              }
            }}
          >
            <AddTargetForm
              // A fresh form per player
              key={request.row.id}
              row={request.row}
              franchise={franchise}
              onAdded={(priceLakh) => {
                // The Add button becomes the "In plan" tag: land on the name
                afterClose.current =
                  request.opener
                    .closest("[data-pool-index]")
                    ?.querySelector<HTMLElement>("[data-player-trigger]") ??
                  null;
                setAnnouncement(
                  `${request.row.player.name} added to plan at ${formatLakh(priceLakh)}`,
                );
                close();
              }}
              onCancel={close}
            />
          </DialogContent>
        )}
      </Dialog>
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </>
  );
}

function AddTargetForm({
  row,
  franchise,
  onAdded,
  onCancel,
}: {
  row: PoolRow;
  franchise: Franchise;
  onAdded: (priceLakh: number) => void;
  onCancel: () => void;
}) {
  const id = useId();
  const plan = usePlan(franchise.id);
  const save = useSavePlan(franchise.id);
  const auctionDate = useAuction().data?.auctionDate;
  const { player, basePriceLakh } = row;

  const form = useForm({
    resolver: zodResolver(priceSchema(basePriceLakh)),
    defaultValues: { price: String(basePriceLakh) },
    mode: "onTouched",
  });
  const priceText = useWatch({ control: form.control, name: "price" });
  const parsed = validateExpectedPrice(priceText, 0);
  const priceError = form.formState.errors.price?.message;
  const abovePurse = parsed.ok && parsed.lakh > franchise.purseRemainingLakh;

  const submit = form.handleSubmit(({ price }) => {
    const result = validateExpectedPrice(price, basePriceLakh);
    if (!result.ok || !plan.data) return;
    save(addTarget(plan.data.targets, row.id, result.lakh));
    onAdded(result.lakh);
  });

  return (
    <form
      noValidate
      onSubmit={(event) => {
        void submit(event);
      }}
      className="flex flex-col gap-4"
    >
      <DialogHeader>
        <DialogTitle>Add to plan</DialogTitle>
        <DialogDescription className="sr-only">
          Set the price you expect to pay for {player.name}.
        </DialogDescription>
      </DialogHeader>

      <div className="flex items-center gap-3">
        <InitialsAvatar name={player.name} className="size-10 text-sm" />
        <div className="flex flex-col">
          <span className="font-semibold">{player.name}</span>
          <span className="text-xs text-muted-foreground">
            {[
              ROLE_LABELS[player.role],
              player.nationality,
              auctionDate
                ? String(ageOn(player.dateOfBirth, auctionDate))
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
          <span className="text-xs text-muted-foreground">
            Base price <Money lakh={basePriceLakh} />
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-price`}>Expected price (lakh)</Label>
        <div className="flex items-center gap-3">
          <Input
            id={`${id}-price`}
            inputMode="numeric"
            autoComplete="off"
            aria-invalid={priceError ? true : undefined}
            aria-describedby={`${id}-hint${priceError ? ` ${id}-error` : ""}`}
            className="w-32"
            {...form.register("price")}
            onKeyDown={(event) => {
              if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
              event.preventDefault();
              const current = validateExpectedPrice(form.getValues("price"), 0);
              const base = current.ok ? current.lakh : basePriceLakh;
              const next =
                event.key === "ArrowUp"
                  ? base + PRICE_STEP_LAKH
                  : Math.max(0, base - PRICE_STEP_LAKH);
              form.setValue("price", String(next), {
                shouldValidate: form.formState.isSubmitted,
              });
            }}
          />
          <span aria-hidden="true" className="text-sm text-muted-foreground">
            {parsed.ok ? `= ${formatLakh(parsed.lakh)}` : ""}
          </span>
        </div>
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          Whole lakh. Base {formatLakh(basePriceLakh)}
          {parsed.ok ? `; this is ${formatLakh(parsed.lakh)}` : ""}.
        </p>
        {priceError && (
          <p
            id={`${id}-error`}
            className="text-sm text-destructive-subtle-foreground"
          >
            {priceError}
          </p>
        )}
        {abovePurse && !priceError && (
          <p className="text-sm text-info-subtle-foreground">
            Above {franchise.shortName}&apos;s purse before the auction (
            {formatLakh(franchise.purseRemainingLakh)}).
          </p>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!plan.data}>
          Add to plan
        </Button>
      </DialogFooter>
    </form>
  );
}
