import { useEffect } from "react";

export const APP_NAME = "IPL Auction Planner";

/** Sets the browser tab title to "<title> · IPL Auction Planner". */
export function useDocumentTitle(title: string | null) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}
