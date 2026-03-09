# Task: Update Types

## Description

Finalize the organization and definition of TypeScript types and interfaces. Ensure clear separation between common types/interfaces and document-specific types, and update all usages across the refactored codebase.

## Requirements

1.  **Solidify Common Types:** Ensure all truly generic types (e.g., `IngestAuthoritativeDocProps`, potentially parts of TOC structures if generic) reside in `common/types.ts` or similar within the `common` directory.
2.  **Solidify Specific Types:** Ensure types specific to NIST 800-53 (e.g., the detailed `ParseSchema` structure reflecting NIST controls/enhancements) reside within `nist800-53/types.ts` or similar.
3.  **Refine Strategy Interface:** Review and finalize the `IAuthoritativeDocumentProcessor` interface defined in Task 4 (likely in `common/types.ts`). Ensure its method signatures accurately reflect the inputs/outputs needed for each step (e.g., parsing, normalization, mapping).
4.  **Review Type Usage:** Go through all modified files (`ingest.ts`, files in `common/`, files in `nist800-53/`) and ensure they are importing and using the correct types from their new locations.
5.  **Remove Redundancy:** Delete the original `types.ts` at the root if all its contents have been successfully moved to `common/` or `nist800-53/`. If some root-level types remain necessary (e.g., for `index.ts` exports), keep the file but ensure it only contains those essential, non-relocated types.

## Inputs

- All `.ts` files within `src/server/handlers/authoritative-doc/` and its subdirectories (`common/`, `nist800-53/`).
- The `IAuthoritativeDocumentProcessor` interface.

## Expected Outputs

- A clean and logical organization of types: common types in `common/`, NIST-specific types in `nist800-53/`.
- A well-defined `IAuthoritativeDocumentProcessor` interface.
- All code uses correctly imported types from the new structure.
- No redundant or misplaced type definitions remain.

## Caveats

- Changes to type definitions can have cascading effects. Ensure TypeScript compilation (`tsc`) passes without errors after this task.

## Check-up Questions

- Is there a clear separation between types defined in `common/` and `nist800-53/`?
- Does the `IAuthoritativeDocumentProcessor` interface accurately capture the contract for specific processing steps?
- Are all `import` statements for types updated correctly throughout the handler?
- Does the project compile successfully without type errors related to this refactoring?
