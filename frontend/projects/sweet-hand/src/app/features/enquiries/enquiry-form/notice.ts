
/** The message above the fields, one at a time (docs/mocks/dialogs/enquiry). */
export type Notice =
  | { kind: 'restored' }
  | { kind: 'failed'; reference: string | null }
  | { kind: 'duplicate'; enquiryId: string }
  | { kind: 'limit'; newAccount: boolean }
  | { kind: 'unverified' };
