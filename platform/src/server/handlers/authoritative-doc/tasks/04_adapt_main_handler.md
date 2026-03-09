# Task: Adapt Main Handler

## Description

Refactor the main `IngestAuthoritativeDocHandler` (in `ingest.ts`) to act as an orchestrator. Implement a strategy or factory pattern to dynamically select and execute the appropriate document-specific logic (parsing, normalization, data mapping) based on the `doc.docType` field fetched from the Payload CMS.

## Requirements

1.  **Define Strategy Interface:** In `common/types.ts` or a new dedicated file, define an interface (e.g., `IAuthoritativeDocumentProcessor`) outlining the methods required for document-specific processing. This should include methods for:
    - Getting the LLM prompt for PDF parsing.
    - Getting the Zod schema for parsing.
    - Normalizing the parsed pages/content.
    - Mapping normalized data to Payload test case/suite structures.
    - (Potentially) Handling document-specific TOC/bookmark logic if variations exist.
2.  **Implement NIST Strategy:** In the `nist800-53` directory, create a class or object that implements the `IAuthoritativeDocumentProcessor` interface, using the NIST-specific logic moved in Task 2.
3.  **Create Factory/Selector:** Implement a function (e.g., in `common/` or `ingest.ts`) that takes `docType: string` as input and returns the appropriate `IAuthoritativeDocumentProcessor` implementation. Initially, this will only return the NIST processor if `docType` matches 'NIST 800-53', throwing an error otherwise.
4.  **Refactor `IngestAuthoritativeDocHandler`:**
    - Fetch the document and its `docType`.
    - Use the factory/selector function to get the correct processor based on `docType`.
    - Call generic setup/cleanup functions directly (file reading, status updates).
    - Delegate document-specific steps (getting prompt/schema, calling `PdfParserService.parse` with specific params, normalizing results, mapping to payload) to the methods of the selected processor instance.
    - Update all imports to reflect the new structure (`common/`, `nist800-53/`).

## Inputs

- `ingest.ts` (after Tasks 2 & 3)
- Code within `common/` and `nist800-53/` directories.
- `IAuthoritativeDocumentProcessor` interface definition.

## Expected Outputs

- A refactored `IngestAuthoritativeDocHandler` in `ingest.ts` that:
  - Is leaner and focuses on orchestration.
  - Dynamically selects the processing strategy based on `docType`.
  - Relies on the `IAuthoritativeDocumentProcessor` interface for specific steps.
- A working implementation for NIST 800-53 using this new structure.
- A clear mechanism to add support for new document types by implementing the interface and updating the factory function.

## Caveats

- This involves significant changes to the flow of `ingest.ts`. Careful testing is required to ensure existing NIST functionality remains intact.
- The exact methods in the `IAuthoritativeDocumentProcessor` interface might need refinement based on the specific dependencies between steps.

## Check-up Questions

- Does `ingest.ts` now clearly separate orchestration logic from document-specific implementation details?
- Is there a clear factory/selection mechanism based on `doc.docType`?
- Is the NIST-specific logic invoked through the methods defined in the `IAuthoritativeDocumentProcessor` interface?
- How easy would it be to add an `ISO27001Processor`? Would it mainly involve creating a new implementation in an `iso27001` folder and updating the factory? (The answer should be yes).
