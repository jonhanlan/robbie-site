# Morph Runtime Cache Contract

R4 makes the renderer cache rules explicit. This file is package-owned proof, not product copy.

## Cache Layers

- `layers`: caches one rendered layer body keyed by layer id, layer index, state, progress, frame seed, smoothing, composed geometry, state geometry, compose key, edge config, fill config, inner config, and pass flags. It invalidates on any visual layer input change. Inter-layer shade passes are excluded from receiver layer markup and render after the receiver so source/receiver changes cannot hide inside the layer cache.
- `geometry`: caches boiled contour geometry keyed by layer id, layer index, state, progress, frame seed, smoothing, composed points, edge config, and state geometry. It invalidates when point data, state interpolation, boil seed, edge config, or smoothing changes.
- `contourFields`: caches contour distance fields keyed as `contour-field|<geometryKey>`. It invalidates with geometry identity. Runtime field-cache hits hydrate this same map so live and precompiled fields converge after lookup.
- `shade`: caches mark output keyed by clip id, geometry key, light/shade polarity, deterministic seed, and stable pass config. Inter-layer passes add source geometry, receiver geometry, and projection offsets to their geometry contribution.

All in-memory maps use oldest-entry eviction with `maxEntries`, defaulting to 180 and clamped to at least 1. Perf probes may request larger caches when proving scale.

## Runtime Field Cache

`cache.fields` remains `kind: field-cache`, `version: 0`, `policy: exact`. No fuzzy or interpolated policy exists yet. A new policy can land only when a named runtime artifact needs it, and that policy must be versioned in the runtime document plus covered by validation and playback tests.

## Render Tiers

Only `svg` and `svg-cache` are earned today. `canvas`, `webgl`, `webgpu`, and `native` remain reserved contract words. The canvas tier starts only when a named authored document exceeds the SVG node budget and a second pure output target can prove golden-frame equivalence.

## R4 Gates

- `npm run perf:runtime` enforces runtime size, nonblank public SVG output, cache hit-rate floors, and SVG node budgets.
- `npm run check:runtime-goldens` renders representative runtime documents and compares deterministic SVG hashes, byte counts, and node counts against `packages/morph/exports/goldens/runtime-svg-v0.json`, plus renderer-agnostic numeric geometry snapshots against `packages/morph/exports/goldens/runtime-geometry-v0.json`.
- `npm run verify` runs both gates before the editor, Beta 1, standalone, boundary, status, and focused test gates.
