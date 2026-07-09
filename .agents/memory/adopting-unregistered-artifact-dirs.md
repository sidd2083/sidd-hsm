---
name: Adopting pre-existing but unregistered artifact directories
description: How to get the platform to register/assign a workflow+port for an artifacts/<slug> dir that already has a valid artifact.toml but doesn't show up in listArtifacts().
---

Sometimes a repo already contains a fully-formed `artifacts/<slug>/` with a valid `.replit-artifact/artifact.toml` (e.g. from an imported project or a prior session), but `listArtifacts()` returns empty and no workflow exists for it. There is no direct "adopt existing artifact" callback.

**Why:** `createArtifact()` refuses to run if the target `artifacts/<slug>/` directory already exists (`ARTIFACT_DIR_EXISTS`), so it can't be used directly to register real content in place.

**How to apply:** Temporarily move the real directory aside (e.g. to `/tmp/`), call `createArtifact({ artifactType, slug, previewPath, title })` with the same slug to force the platform to scaffold/register/assign a port and workflow, then delete the placeholder scaffold and restore the real source back into `artifacts/<slug>/` — but keep the *newly generated* `.replit-artifact/artifact.toml` (it has the correct registered port/id), not the old one. Note: a single `createArtifact` call can also trigger reconciliation that auto-discovers and registers *other* pre-existing artifact.toml files in the repo at the same time.
