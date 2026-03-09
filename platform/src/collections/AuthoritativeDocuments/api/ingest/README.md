# Authoritative Document Ingestion API Endpoint

This directory contains the API endpoint handler responsible for triggering the asynchronous ingestion process for authoritative documents.

## Endpoint: `POST /api/authoritative-documents/:id/ingest`

(Note: The exact route might vary based on Payload CMS configuration, but this is the likely structure.)

### Business Logic (`handler.ts`)

The primary function of this handler is to initiate an asynchronous job for document ingestion using the Payload Job Queue. It performs the following steps:

1.  **Authentication & Authorization:** Verifies that the incoming request includes a valid authenticated user session. Rejects unauthenticated requests with a 401 status code.
2.  **Parameter Validation:**
    - Extracts the document `id` from the URL path (`:id`).
    - Parses the JSON request body to potentially extract a `pagesRange` parameter (allowing partial document ingestion).
    - Ensures the `id` parameter is present, returning a 400 error if missing.
3.  **Job Dispatch:** Dispatches an asynchronous job to the Payload Job Queue with:
    - Task slug: `ingest-authoritative-document`
    - Input parameters:
      - `docId`: The document ID from the route parameter
      - `pagesRange`: Optional parameter for partial document ingestion
4.  **Response:** Returns a `202 Accepted` response to the client, indicating that the ingestion job has been successfully queued, but not yet completed. This response confirms the job was dispatched to the queue but does not indicate completion of the actual ingestion process.

This endpoint no longer performs the following actions directly:

- File download from storage
- Direct interaction with the ingestion service
- Synchronous document processing

Instead, all of the actual ingestion logic is executed asynchronously by the job worker processing the `ingest-authoritative-document` task.
