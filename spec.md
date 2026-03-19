# Nellore Print Hub

## Current State
The app has a Get a Free Quote section where customers fill in service type, name, phone, and project details. Submissions are stored in the backend and visible in the admin panel. No file upload is currently supported.

## Requested Changes (Diff)

### Add
- File upload field in the quote form (optional) accepting any file type (PDF, JPEG, PSD, AI, PNG, etc.)
- Store the uploaded file as a blob alongside the quote request in the backend
- Download link in the admin panel quote requests table so admin can download the attached file

### Modify
- `submitQuoteRequest` backend function to accept an optional `Storage.ExternalBlob` for the attached file
- `QuoteRequest` type to include an optional `attachedFile` field
- `QuoteSection` component to include a file picker input (any file type, optional)
- `AdminPage` quote requests table to show a download/view link if a file was attached

### Remove
- Nothing removed

## Implementation Plan
1. Regenerate Motoko backend: add optional `attachedFile : ?Storage.ExternalBlob` to `QuoteRequest`; update `submitQuoteRequest` to accept optional blob parameter
2. Update `useSubmitQuoteRequest` hook to pass optional `attachedFile: ExternalBlob | null`
3. Update `QuoteSection` to add file input (accept="*") and upload blob before submitting
4. Update `AdminPage` quote table to show a download link column for attached files
