import { Link } from "@tanstack/react-router";

/** App-wide header; the brand always leads back to the team picker (P3). */
export function AppHeader() {
  return (
    <header className="border-b bg-background pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-12 max-w-7xl items-center px-4 md:px-6">
        <Link
          to="/"
          className="inline-flex touch-target items-center rounded-md font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          IPL Auction Planner
        </Link>
      </div>
    </header>
  );
}
