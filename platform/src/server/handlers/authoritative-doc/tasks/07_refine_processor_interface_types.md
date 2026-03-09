# Task: Refine Processor Interface Types

## Description

Refine the `IAuthoritativeDocumentProcessor` interface in `common/types.ts` to replace `any` types with specific, accurate types based on the expected data structures and outputs of each method.

## Requirements

1.  **Update `getParseSchema`:** Change the return type from `any` to a more specific Zod schema type. Using `z.AnyZodObject` or `z.ZodType<any, any, any>` can be a good starting point if the exact schema varies but is known to be a Zod object/type.
    - _Reference: [Zod Basic Usage](https://zod.dev/?id=basic-usage)_
2.  **Update `normalizeParsedPages`:** Change the input parameter `pages` type from `Array<ParsedPage>` (which is being moved in Task 06) to `NormalizedPageAfterOCR[]`. Ensure the return type is `Promise<Control[]>`, utilizing the existing `Control` interface.
3.  **Update `mapToPayloadStructures`:**
    - Change the `controls` parameter type from `any[]` to `Control[]`.
    - Determine the actual expected return value. If the function primarily performs side effects (updating Payload CMS) and doesn't return significant data, change the return type to `Promise<void>`. If it _does_ return status or data, define a specific type for that return value instead of `Promise<any>`.
4.  **Update `processTableOfContents`:**
    - Define a type/interface for the `bookmarks` parameter. Use the existing `BookmarkItem` type defined in `common/types.ts`. Replace `any` with `BookmarkItem[]`.
    - Define a type/interface for the expected Table of Contents structure returned by this method. Use the existing `TableOfContentsResponse` type defined in `common/types.ts`. Replace `Promise<any>` with `Promise<TableOfContentsResponse | null | undefined>`.
5.  Ensure all related type imports are correct.

## Inputs

- `src/server/handlers/authoritative-doc/common/types.ts`
- Knowledge of the data structures returned by `PdfParserService` (for bookmarks) and the intended output of the mapping/TOC processing steps.

## Expected Outputs

- An updated `IAuthoritativeDocumentProcessor` interface in `common/types.ts` with specific types replacing `any` for the methods mentioned.
- New supporting types/interfaces defined within `common/types.ts` for bookmarks and table of contents structures, if they don't already exist.

## Caveats

- Determining the exact types for bookmarks and the return value of `mapToPayloadStructures` might require inspecting other parts of the code or making informed decisions about the expected data flow. Assume a standard tree-like structure for bookmarks if the exact type isn't readily available. Assume `Promise<void>` for `mapToPayloadStructures` unless evidence suggests otherwise.

## Check-up Questions

- Does the `getParseSchema` signature now indicate it returns a Zod schema?
- Does `normalizeParsedPages` accept `NormalizedPageAfterOCR[]` as input and clearly indicate it returns a Promise resolving to an array of `Control` objects?
- Does `mapToPayloadStructures` accept an array of `Control` objects and have a specific return type (e.g., `Promise<void>` or `Promise<MappingResult>`)?
- Does `processTableOfContents` use the `BookmarkItem[]` type for its input and `TableOfContentsResponse` for its Promise resolution?
- Are all uses of `any` removed from the interface signatures?
