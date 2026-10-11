/**
 * Why a send was refused, carried as `code` in the problem body. The form words
 * each one; the server's `title` is for logs. A duplicate also carries `enquiryId`.
 */
export type EnquiryRefusal = 'customer-only' | 'email-unverified' | 'challenge-failed' | 'daily-limit' | 'new-account-limit' | 'duplicate';
