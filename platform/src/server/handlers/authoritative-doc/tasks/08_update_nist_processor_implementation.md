# Task: Update NIST Processor Implementation

## Description

Update the NIST 800-53 specific implementation of the `IAuthoritativeDocumentProcessor` interface (located in the `nist800-53` directory) to align with the refined, type-safe interface definition created in Task 07.

## Requirements

1.  **Locate Implementation:** Find the class or object within the `src/server/handlers/authoritative-doc/nist800-53/` directory that implements `IAuthoritativeDocumentProcessor`.
2.  **Update Method Signatures:** Ensure the method signatures in the implementation exactly match the refined signatures in the `IAuthoritativeDocumentProcessor` interface (from Task 07), including parameter types and return types.
3.  **Adjust Internal Logic (if needed):**
    - Verify that the `getParseSchema` method returns a value compatible with the Zod type specified in the interface.
    - Ensure the `normalizeParsedPages` method correctly handles the `NormalizedPageAfterOCR[]` input and actually returns `Promise<Control[]>`. Adjust internal logic or type assertions if necessary, but prioritize correct typing.
    - Ensure the `mapToPayloadStructures` method correctly handles the `Control[]` input and returns a value matching the refined interface return type (e.g., `Promise<void>`).
    - If `processTableOfContents` is implemented, ensure it handles the `BookmarkItem[]` input and returns the `TableOfContentsResponse` output correctly.
4.  **Update Imports:** Ensure all types are correctly imported from `common/types.ts` or other relevant locations.
5.  **Type Check:** Run `tsc` or rely on IDE TypeScript checking to ensure the implementation conforms to the interface without type errors.

## Inputs

- The refined `IAuthoritativeDocumentProcessor` interface in `common/types.ts`.
- The NIST 800-53 processor implementation file(s) in `src/server/handlers/authoritative-doc/nist800-53/`.

## Expected Outputs

- The NIST 800-53 processor implementation now correctly and type-safely implements the refined `IAuthoritativeDocumentProcessor` interface.
- The implementation passes TypeScript type checking against the interface.

## Caveats

- This task might reveal type mismatches between the actual logic and the intended interface types, requiring minor refactoring within the NIST processor's methods to ensure compatibility.

## Check-up Questions

- Do the method signatures in the NIST implementation match the refined `IAuthoritativeDocumentProcessor` interface exactly?
- Does the return value of `getParseSchema` match the expected Zod type?
- Does `normalizeParsedPages` correctly handle `NormalizedPageAfterOCR[]` as input and resolve to `Control[]`?
- Does `mapToPayloadStructures` correctly handle `Control[]` input and return the expected type?
- If implemented, does `processTableOfContents` handle the `BookmarkItem[]` input and `TableOfContentsResponse` output correctly?
- Does the file pass TypeScript type checking?
