import type { ReportReason } from '../../../../core/api/reports.models';

/** The fixed reasons of L2-054 with the hint under each (docs/mocks/dialogs/report). */
export const REPORT_REASONS: { value: ReportReason; label: string; hint: string }[] = [
  { value: 'Inaccurate information', label: $localize`:@@report.reason.inaccurate:Inaccurate information`, hint: $localize`:@@report.reason.inaccurateHint:Wrong menu, areas or details` },
  { value: 'Inappropriate content', label: $localize`:@@report.reason.inappropriate:Inappropriate content`, hint: $localize`:@@report.reason.inappropriateHint:Offensive words or photos` },
  { value: 'Fake or spam', label: $localize`:@@report.reason.fake:Fake or spam`, hint: $localize`:@@report.reason.fakeHint:Not a real caterer, or stock photos` },
  { value: 'Food safety concern', label: $localize`:@@report.reason.foodSafety:Food safety concern`, hint: $localize`:@@report.reason.foodSafetyHint:Something that could make people ill` },
  { value: 'Other', label: $localize`:@@report.reason.other:Other`, hint: $localize`:@@report.reason.otherHint:Tell us in the details` },
];

export const DETAILS_MAX = 1000;

export interface ReportErrors {
  reason: string | null;
  details: string | null;
}

/** A reason is required; "Other" needs details; details stay within 1,000 characters (L2-054, L2-054.2). */
export function reportErrors(reason: ReportReason | null, details: string, length: number): ReportErrors {
  return {
    reason: reason ? null : $localize`:@@report.reasonRequired:Choose a reason`,
    details:
      reason === 'Other' && !details.trim()
        ? $localize`:@@report.detailsRequired:Tell us what’s wrong`
        : length > DETAILS_MAX
          ? $localize`:@@report.detailsTooLong:Keep the details to 1,000 characters or fewer`
          : null,
  };
}
