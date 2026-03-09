# Task: Move NIST Specific Types

## Description

Relocate NIST 800-53 specific type definitions from the common types file to the NIST-specific directory to ensure proper separation of concerns.

## Requirements

1.  **Identify Specific Type:** Locate the `ParsedPage` type definition in `src/server/handlers/authoritative-doc/common/types.ts`.
2.  **Create Target File:** If it doesn't exist, create a `types.ts` file within the `src/server/handlers/authoritative-doc/nist800-53/` directory.
3.  **Move Type:** Cut the `ParsedPage` type definition from `common/types.ts` and paste it into `nist800-53/types.ts`.
4.  **Update Imports (if any):** Check if any files were incorrectly importing `ParsedPage` from `common/types.ts` and update them to import from `nist800-53/types.ts` or remove the import if it's no longer needed in that file. (Note: According to our previous analysis, this type should _not_ be used by common logic or the interface itself).

## Inputs

- `src/server/handlers/authoritative-doc/common/types.ts`
- Directory `src/server/handlers/authoritative-doc/nist800-53/`

## Expected Outputs

- The `ParsedPage` type definition is removed from `common/types.ts`.
- The `ParsedPage` type definition exists in `nist800-53/types.ts`.
- Relevant imports (if any existed) are updated or removed.

## Caveats

- This task focuses solely on moving the type definition. Subsequent tasks will handle refining the interface and implementation.

## Check-up Questions

- Is the `ParsedPage` type definition no longer present in `common/types.ts`?
- Is the `ParsedPage` type definition now located within the `nist800-53` directory (e.g., in `nist800-53/types.ts`)?
