/** A read-only enquiry opened while handling a report (L2-034.3). */
export interface ReportEnquiryView {
  customer: string;
  caterer: string;
  eventDate: string;
  guests: number;
  status: string;
  message: string;
  sentAt: string;
  entries: { id: string; from: 'customer' | 'caterer'; text: string; at: string }[];
}
