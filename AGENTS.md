# Essensplan Engineering Guide

## Product Principles
- Essensplan is a German, local-first meal planning app for one household.
- Keep nutrition, grocery, and pantry data private in the browser by default.
- Favor clear task flows over decorative UI. The interface should feel like a minimal productivity tool.

## Engineering Standards
- Use React, TypeScript, Vite, Dexie, Vitest, Testing Library, and Playwright.
- Keep domain logic separate from UI components as the app grows.
- Store normalized quantities and nutrition values. Show German labels in the UI.
- Do not put secrets or private API keys in client code. Open Food Facts access is public and credential-free.
- Every new feature needs at least one unit or integration test for its core behavior.

## Accessibility
- Forms need explicit labels, visible focus states, and keyboard-operable controls.
- Navigation uses semantic buttons or links and exposes the active section.
- Text contrast must remain readable on mobile and desktop.

## Data Safety
- IndexedDB is the source of truth in v1.
- Add Dexie migrations for schema changes; never silently discard existing user data.
- Import/export JSON must preserve version metadata for future migrations.
