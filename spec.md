# Nellore Print Hub

## Current State
- Printing services website with hero, services, gallery, about, and contact sections
- Admin panel at /admin with password-only login (Munnu1998@)
- Gallery management (create, update, delete gallery items with images via blob-storage)
- Quote request form with optional file attachment stored in backend
- Admin can view all quote requests
- Authorization system with admin/user/guest roles

## Requested Changes (Diff)

### Add
- **Visitor login gate**: Every visit requires name + mobile number before accessing the site (no skip). Stored in backend as visitor log with timestamp.
- **Customer reviews**: Review type with star rating (1-5), reviewer name, review text, timestamp. Public submission from website. Admin can add/edit/delete reviews from admin panel.
- **Share button**: Opens WhatsApp with pre-filled company description + website link.
- **Site settings (editable content)**: Backend stores all editable site content: company name, tagline, hero text, about text, phone number, address, WhatsApp number, website description. Admin can update via admin panel.
- **Services management**: Admin can add/edit/delete services listed on the site.
- **Quote response system**: Admin can add a text response to a quote request. When response is saved, it triggers a WhatsApp message link to the customer's number. Customer sees a notification banner when they revisit the site with their unread responses.
- **Quote notification for admin**: When a quote is submitted, admin sees a persistent unread badge/count on the admin panel bell icon.
- **Visitor log in admin**: Admin panel shows list of all visitors (name, mobile, visit time).
- **File preview in admin**: Quote requests with attached files show image preview (JPEG/PNG), PDF viewer, or download link for other types.

### Modify
- Quote request: add `response` field (optional Text) and `responseTimestamp` (optional Time).
- Admin quote view: show file preview (image inline, PDF in iframe, others as download), show response field, allow admin to type and save a response with WhatsApp notification link.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `VisitorLog` type and `logVisitor` / `getAllVisitorLogs` functions.
2. Add `Review` type with CRUD: `submitReview`, `getAllReviews`, `adminAddReview`, `updateReview`, `deleteReview`.
3. Add `SiteSettings` type with get/set: `getSiteSettings`, `updateSiteSettings`.
4. Add `Service` type with CRUD: `getAllServices`, `createService`, `updateService`, `deleteService`.
5. Modify `QuoteRequest` to include `response: ?Text` and `responseTimestamp: ?Time`.
6. Add `respondToQuoteRequest(id, response)` admin function.
7. Add `getMyQuoteResponse(phoneNumber)` public query so customer can check their response by phone.
8. Add `getAdminNotificationCount` query (unread quotes count) and `markQuoteNotificationsRead`.
9. Frontend: visitor login gate modal on first page load (every visit, no skip).
10. Frontend: reviews section with star rating submission form.
11. Frontend: share button in header/hero that opens WhatsApp.
12. Frontend: admin panel tabs for site settings, services, visitors, reviews, notifications.
13. Frontend: quote file preview (image inline, PDF iframe, download button for others).
14. Frontend: admin can type a response to a quote and click Send -- opens WhatsApp pre-filled to customer number.
15. Frontend: customer notification banner when they visit and have an unread response.
