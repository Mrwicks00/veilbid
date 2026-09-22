"use client";

import dynamic from "next/dynamic";

// See DynamicClientProviders.tsx: this whole subtree touches levelPrivateStateProvider, which
// resolves to the native classic-level binding server-side. ssr: false keeps it out of the
// server bundle for this route entirely — page.tsx (a Server Component) only ever imports
// this loader, never HomeClient directly, so Turbopack never bundles the native chain there.
const HomeClient = dynamic(() => import("./HomeClient"), { ssr: false });

export default function HomeClientLoader() {
  return <HomeClient />;
}
