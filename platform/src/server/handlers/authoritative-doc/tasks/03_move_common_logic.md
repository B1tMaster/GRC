# Task: Move Common Logic

## Description

Identify generic code components applicable to any document ingestion process within `src/server/handlers/authoritative-doc` and relocate them to the `common` subdirectory.

## Requirements

1.  **Analyze remaining files** (primarily `ingest.ts`, `handle-table-of-contents.ts`, `tokenUtils.ts`, `types.ts`):
    - Identify generic file handling (reading buffer, creating `File` object in `ingest.ts`).
    - Identify generic PDF service interaction (`PdfParserService.parse` call initiation in `ingest.ts`, although parameters like prompt/schema will vary).
    - Identify generic Payload CMS interactions (fetching doc, updating status, creating/finding test cases/suites - note that the _mapping_ of data _to_ Payload fields might be specific, but the act of calling `payload.find`, `payload.update`, `payload.create` is common). Keep `ingest.ts` logic related to this for now, it will be orchestrated in Task 4.
    - Identify generic error handling and final file cleanup (`try/catch/finally` structure in `ingest.ts`). Keep this structure in `ingest.ts`.
    - Identify potentially common utilities like `tokenUtils.ts` (if applicable generally) or parts of `handle-table-of-contents.ts` if deemed generic after Task 2 analysis.
    - Identify generic types in `types.ts` (e.g., `IngestAuthoritativeDocProps`).
2.  Move identified common utility functions and types into appropriately named files within the `src/server/handlers/authoritative-doc/common/` directory (e.g., `common/utils.ts`, `common/types.ts`).
3.  Update imports in the moved files and the files that use them to reflect the new locations.

## Inputs

- Files in `src/server/handlers/authoritative-doc/` (after Task 2)
- Directory `src/server/handlers/authoritative-doc/common/`

## Expected Outputs

- Generic, reusable code (utility functions, common types) is now located in files within the `common` directory.
- Files remaining in the root (`ingest.ts`, etc.) primarily contain the main orchestration logic or parts yet to be refactored/delegated.

## Caveats

- The main `IngestAuthoritativeDocHandler` function in `ingest.ts` will still contain a mix of calls to what _will be_ common and specific logic. Task 4 will address orchestrating this. Focus here is on relocating self-contained common utilities and types.

## Check-up Questions

- Are general helper functions (like potentially `tokenUtils` or generic TOC/bookmark handling) moved to `common`?
- Are common type definitions (like `IngestAuthoritativeDocProps`) moved to `common` or clearly separated?
- Do imports correctly reflect the new `common/` directory structure?
