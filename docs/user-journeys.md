# User journeys

Every user journey Sweet Hand has built or plans to build, one per detailed design in
`docs/detailed-designs/`. Estimates are developer-days and percent complete is measured
from code plus acceptance tests, both from `docs/estimates/` (`estimating-designs` skill).

53 journeys, 283 days, 88% complete (effort-weighted).

| Name | Description | Estimate | Complete |
|---|---|---|---|
| Join the launch list | Visitor picks a role, enters an email and consent, and is told to check their email. | 6 days | 100% |
| Confirm launch list email | Visitor clicks the emailed link and sees they are on the list, or that it expired. | 4 days | 100% |
| Leave the launch list | Person removes their address in one click from the page, an email link, or their mail client. | 3 days | 100% |
| Visit the launch site | Visitor lands on the fast prerendered launch page, reads it, and jumps to sign-up. | 5 days | 90% |
| Send the launch day email | Operator runs one command that emails each confirmed address once; the list is deleted later. | 5 days | 100% |
| Retire the launch site | On launch day the operator switches `/` to the product; old launch links keep working safely. | 3 days | 0% |
| Register as a customer | Visitor gives name, email, password and consent, passes a bot check, and verifies their email. | 5 days | 100% |
| Sign in | User signs in with email and password; operators add a second factor; repeated failures pause sign-in. | 7 days | 100% |
| Verify email or reset password | User opens an emailed link to verify their address, or resets a forgotten password. | 4 days | 100% |
| Manage sessions | User reviews signed-in devices, ends one, or signs out; idle sessions expire by role. | 5 days | 100% |
| Consent to the privacy notice | User reads the notice, consents at registration, and re-accepts after a substantial change. | 6 days | 100% |
| Browse caterers | Visitor browses published caterers 24 to a page, pages through them and returns with Back. | 4 days | 90% |
| Filter by cuisine | Visitor picks one or more cuisines or island traditions, with counts, to narrow the listing. | 4 days | 100% |
| Filter by area | Visitor types an area, picks a suggestion, and sees caterers that serve it. | 4 days | 100% |
| Search by postal code | Visitor enters a postal code and sees caterers serving that code's area. | 3 days | 100% |
| View a caterer page | Visitor opens a caterer's page with photos, cuisines, description, menu and event details. | 4 days | 90% |
| View the photo gallery | Visitor views a caterer's photos full screen by mouse, touch or keyboard. | 3 days | 100% |
| Send an enquiry | Customer fills in the enquiry form, sees fit warnings, and sends; entries survive signing in. | 5 days | 100% |
| Browse the inbox | Customer or caterer filters and pages through enquiries and opens one beside the list. | 4 days | 100% |
| See unread enquiries | Header badge counts unread threads, the inbox highlights them, opening one marks it read. | 4 days | 100% |
| Reply in a thread | Customer or caterer reads a private enquiry thread in order and replies. | 6 days | 100% |
| Share contact details | Either party chooses to share email and phone, visible to the other party in that thread only. | 3 days | 100% |
| Decline or close an enquiry | Caterer declines with an optional note, either party closes it, stale enquiries close automatically. | 6 days | 100% |
| Write a review | Customer whose enquired event has passed rates the caterer and writes a review. | 5 days | 100% |
| Edit or delete a review | Author edits their review within 30 days, or deletes it any time after confirming. | 4 days | 100% |
| Read reviews | Visitor reads a caterer's rating summary and newest reviews, loading ten more at a time. | 3 days | 90% |
| Report content | Anyone flags a caterer listing or review with a reason; repeated reports hide a review. | 6 days | 90% |
| Download personal data | User requests their data and receives a link to download a JSON export within 7 days. | 7 days | 100% |
| Delete an account | User confirms with their password; the account is anonymised and its reviews and enquiries settled. | 7 days | 100% |
| Register as a caterer | Caterer signs up with business and contact details and gets a draft profile. | 3 days | 100% |
| Set up a profile | Caterer builds a draft profile over several sessions with autosave and a checklist. | 5 days | 100% |
| Manage the menu | Caterer adds, edits, removes and reorders dishes, keeping between 3 and 50. | 4 days | 100% |
| Manage photos | Caterer uploads, captions, reorders, replaces and removes photos and picks a cover. | 7 days | 70% |
| Provide a food handler certificate | Caterer enters certificate details and a private copy, and gets expiry reminders. | 6 days | 100% |
| Submit a profile for review | Caterer submits a complete profile for operator review, and can withdraw or resubmit. | 5 days | 100% |
| Edit a published profile | Published caterer edits live; a business name change waits for operator approval. | 5 days | 100% |
| Respond to a review | Caterer posts, edits or deletes one public response under a review; the reviewer is emailed. | 4 days | 100% |
| Work the review queue | Operator works an oldest-first queue of submissions, reports and held reviews, and scans edits. | 5 days | 100% |
| Approve a profile | Operator approves a submitted profile or sends it back with a reason; the caterer is emailed. | 5 days | 90% |
| Edit a profile as an operator | Operator corrects a field, removes a photo or dish, or reverts an edit, giving a reason. | 5 days | 100% |
| Suspend, reinstate or remove a profile | Operator suspends, reinstates or removes a caterer; its page and open enquiries follow. | 7 days | 100% |
| Handle reports | Operator reviews grouped reports, dismisses them or acts, and may open a linked enquiry. | 5 days | 100% |
| Moderate reviews | Operator approves, hides, restores or removes a review, emailing the author the reason. | 4 days | 100% |
| Manage the cuisine list | Operator adds or retires a cuisine, warned which published caterers use it. | 4 days | 100% |
| Manage operator accounts | Admin invites or deactivates operators, who must pass a second factor before operator pages. | 8 days | 80% |
| Search the audit log | Admin filters the audit log by operator, action, target and date. | 7 days | 70% |
| View the metrics dashboard | Operator picks a range and granularity to see caterer, visit and enquiry trends. | 6 days | 100% |
| Export metrics | Operator downloads the selected metrics as a spreadsheet-safe CSV file. | 2 days | 100% |
| Record a privacy breach | Operator records a breach with its risk and notification decision. | 5 days | 50% |
| Manage places | Operator adds and edits restaurants, shops and food trucks, and closes or reopens them. | 6 days | 0% |
| Manage events | Operator adds, edits, repeats, skips dates of, and cancels or restores events. | 7 days | 0% |
| View the places map | Operator sees open places and today's food truck stops as map pins. | 4 days | 0% |
| View the events calendar | Operator browses events by month, week or day, filtered by type, with a day's agenda. | 3 days | 0% |

Not listed: the 16 designs no person walks through on their own (authorisation, security
logging, input validation, rate limiting, enquiry abuse limits, enquiry notifications,
retention, visit counting and the eight platform designs). They are in `docs/estimates/`.
