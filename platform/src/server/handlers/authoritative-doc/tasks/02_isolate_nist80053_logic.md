# Task: Isolate NIST800-53 Logic

## Description

Identify and relocate all code components specifically tailored for NIST 800-53 processing from the root of `src/server/handlers/authoritative-doc` into the newly created `nist800-53` subdirectory.

## Requirements

1.  **Analyze `ingest.ts`**:
    - The `Prompt` constant contains detailed instructions specific to NIST 800-53 control/enhancement naming. Move this prompt (or the logic to generate it) to a file within `nist800-53/`.
2.  Update imports in the moved files to reflect their new locations relative to each other.

## Inputs

- Files in `src/server/handlers/authoritative-doc/`
- Directory `src/server/handlers/authoritative-doc/nist800-53/`

## Expected Outputs

- NIST 800-53 specific constants, functions, and types (like the `Prompt`, parts of `ParseSchema`, `normalizePages`, `controlIntoText`) are now located in files within the `nist800-53` directory.
- Files remaining in the root directory (`ingest.ts`, `types.ts`, etc.) have had the identified NIST-specific code removed.

## Caveats

- Some functions might require refactoring if they mix common and NIST-specific logic. The goal here is primarily relocation, but minor refactoring for separation might be needed.
- Leave placeholder comments or `TODO` notes where specific logic was removed from common files if it helps track dependencies for Task 4.

## Check-up Questions

- Is the LLM prompt for PDF parsing now isolated within the `nist800-53` directory?
- Is the schema used for parsing (`ParseSchema`) and the logic for normalization (`normalizePages`) that depend on NIST structure now within `nist800-53`?
- Is the `controlIntoText` utility, which formats NIST control data, now within `nist800-53`?
- Are all files previously containing this specific logic now free of it?
