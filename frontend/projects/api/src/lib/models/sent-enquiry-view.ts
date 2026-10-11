/** 201 body: what the confirmation shows (L2-022.1). */
export interface SentEnquiryView {
  id: string;
  caterer: { name: string; slug: string };
  /** Who reads it at the caterer: the owner's first name, or the business name. */
  contactName: string;
  eventDate: string;
  guests: number;
  /** Area and occasion names. */
  area: string;
  occasion: string;
  /** The email provider is down; the notification is queued (L2-030.1). */
  emailQueued: boolean;
}
