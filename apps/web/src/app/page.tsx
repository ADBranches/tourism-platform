import React from "react";
import { DEFAULT_CONFIG } from "@tourism/config";
import type { UserRole } from "@tourism/contracts";
import { Badge, Button, Card } from "@tourism/ui";

export default function HomePage() {
  const supportedRoles: readonly UserRole[] = [
    "traveller",
    "supplier",
    "guide",
    "driver",
    "platform_admin",
    "support_agent",
    "tourism_authority",
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <header className="space-y-3">
        <div className="flex items-center space-x-3">
          <Badge variant="success">Sprint 01 Phase 01 Baseline</Badge>
          <span className="text-xs text-slate-500 font-mono">
            Env: {DEFAULT_CONFIG.appEnv}
          </span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Global Tourism Platform
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl">
          Enterprise monorepo baseline establishing strict TypeScript contracts,
          provider-neutral architecture, and deterministic module boundaries.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            Architectural Boundaries
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Domain contracts are isolated from presentation. Shared packages
            never import applications, preventing circular dependencies.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">@tourism/contracts</Badge>
            <Badge variant="info">@tourism/validation</Badge>
            <Badge variant="info">@tourism/config</Badge>
            <Badge variant="info">@tourism/ui</Badge>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            Stakeholder Matrix
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Standardized domain contracts supporting cross-stakeholder
            workflows:
          </p>
          <div className="flex flex-wrap gap-2">
            {supportedRoles.map((role) => (
              <Badge key={role} variant="neutral">
                {role}
              </Badge>
            ))}
          </div>
        </Card>
      </section>

      <section className="flex items-center justify-between p-6 bg-slate-900 text-white rounded-xl">
        <div>
          <h3 className="font-semibold text-white">
            Production Monorepo Baseline
          </h3>
          <p className="text-sm text-slate-400">
            Strict TypeScript • Turborepo • pnpm Workspaces
          </p>
        </div>
        <Button variant="primary">Platform Documentation</Button>
      </section>
    </main>
  );
}
