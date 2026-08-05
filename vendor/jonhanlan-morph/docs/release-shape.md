# Morph Lab Release Shape

Updated: 2026-07-05

## Identity

- Product/app name: Morph Lab.
- Package name: `@jonhanlan/morph`.
- Engine era/codename: Morphius.
- Historical name: Proteus is retired as the active product metaphor.

## Source Truth

`/Users/jon/Documents/MorphLab` is the source of truth for Morph Lab authoring, runtime exports, package scripts, and standalone extraction. The `jonhanlan` repo is a website host and package consumer. It must not receive new engine or authoring features directly.

The old `jonhanlan/packages/morph` mirror has been removed. `npm run check:site-package-sync` now proves that `jonhanlan` links `@jonhanlan/morph` to the MorphLab workspace directly; if a legacy mirror reappears, the same guard still byte-checks its public/runtime surface.

`npm run check:site-packed-consumer` is the deploy-shaped guard: it packs `@jonhanlan/morph`, installs the tarball into a clean temp consumer, bundles the same browser runtime/player imports and local bridge API imports used by the website, and verifies the site still has no package mirror.

`npm run check:native-site-runtime-export` is the private authoring-output guard. It creates and reopens the named multi-layer Native Studio Piece through the native authoring path, exports its exact cached runtime bytes as `native-studio-piece.morph.json`, and mounts that file through both the real `jonhanlan` workspace resolver and a clean packed-package player. The file is host content, not a gallery entry or share object.

`npm run check:release-shape` is the package-boundary guard: it packs `@jonhanlan/morph`, proves this document, package metadata, runtime exports, render settings, public player modules, and packed file exclusions stay aligned, and reports that the current channel is still `local-dev` / private.

`npm run pack:release` writes `packages/morph/.morph-release/release-candidate.json`, a generated local receipt for the current packed package. The receipt records the package identity, channel, publishable flag, tarball name, npm integrity/shasum, runtime shelf keys, settings descriptors, package exports, and packed file list. It is a release-candidate receipt, not a publication event.

## Version Policy

- Current local package identity: `@jonhanlan/morph` `0.0.1`.
- Channel: `local-dev` until a real package publication path exists.
- Do not advance package version for proof-only renderer cuts unless the exported host-consumption contract changes.
- A runtime schema change, especially `morph-runtime/v1`, is a named release event with migration proof and player-boundary proof.

## Release Notes

Release notes should name demonstrated capabilities, not percentages. Use this shape:

1. Capability landed.
2. Authored artifact or host that proves it.
3. Commands that passed.
4. Known boundary or deliberately parked follow-through.

## Artifact Folders

- Authoring datasets: `packages/morph/exports/datasets/`.
- Runtime exports: `packages/morph/exports/runtime/`.
- Runtime render goldens: `packages/morph/exports/goldens/`.
- Render settings manifest: `packages/morph/exports/settings/`.
- Release-candidate receipt: `packages/morph/.morph-release/release-candidate.json` (generated, ignored).
- Standalone extraction output: `packages/morph/.morph-standalone-app/` (generated, ignored).

## Promotion Target

Promotion means copying a verified standalone artifact or runtime/player surface from MorphLab outward. The preferred command path is:

- `npm run verify`
- `npm run pack:release`
- `npm run extract:standalone -- --json --skip-tests`
- `npm run promote:standalone -- --target-dir <target>`

The website remains a consumer. It currently links to the local MorphLab workspace; a future package publication path should replace that local-only dependency for deployment.
