# Task: Create Directory Structure

## Description

Establish a new directory structure within `src/server/handlers/authoritative-doc` to logically separate common ingestion logic from document-specific implementations (starting with NIST 800-53). This structure should facilitate adding support for other document types in the future.

## Requirements

1.  Create a `common` subdirectory within `src/server/handlers/authoritative-doc`.
2.  Create a `nist800-53` subdirectory within `src/server/handlers/authoritative-doc`.
3.  Ensure the `index.ts` file remains as the main export point for the handler.

## Inputs

- Existing directory: `src/server/handlers/authoritative-doc`

## Expected Outputs

- A new directory structure resembling:
  ```
  src/server/handlers/authoritative-doc/
  ├── common/
  │   └── (Files for common logic will go here)
  ├── nist800-53/
  │   └── (Files for NIST 800-53 specific logic will go here)
  ├── control-utils.ts
  ├── handle-table-of-contents.ts
  ├── index.ts
  ├── ingest.ts
  ├── normalize.ts
  ├── tokenUtils.ts
  └── types.ts
  ```
  _(Note: Existing files are shown at the root for now; subsequent tasks will move them.)_

## Caveats

- This task only sets up the folders. Code migration happens in later tasks.

## Check-up Questions

- Does the new structure clearly delineate where common vs. specific code should reside?
- Is the structure easily extensible for adding a new document type (e.g., `iso27001`) later by adding a new subdirectory?
