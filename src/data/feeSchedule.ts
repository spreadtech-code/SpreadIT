// The partner's fee schedule, stored as data (PRD 4.1 "Cost limits", C4).
// All amounts are whole kobo. The engine reads fees from here and never
// hard-codes a rate. A real partner's schedule will replace this object.

export interface TransferBand {
  /** Transfers up to and including this amount use this fee. null = no upper limit. */
  upToKobo: number | null;
  feeKobo: number;
}

export interface FeeSchedule {
  name: string;
  /** Inflow fee on each payment received: a share of the payment, capped. */
  inflow: { rateBasisPoints: number; capKobo: number };
  /** In ascending order. */
  transferBands: TransferBand[];
  /** Charged on each transfer of this amount or more. */
  stampDuty: { fromKobo: number; feeKobo: number };
}

/** Paystack's published schedule, November 2026 (PRD 4.1). */
export const paystackNov2026: FeeSchedule = {
  name: 'Paystack, November 2026',
  inflow: { rateBasisPoints: 100, capKobo: 30_000 }, // 1%, capped at ₦300
  transferBands: [
    { upToKobo: 500_000, feeKobo: 1_000 }, // ₦5,000 or less: ₦10
    { upToKobo: 5_000_000, feeKobo: 2_500 }, // ₦5,001 to ₦50,000: ₦25
    { upToKobo: null, feeKobo: 5_000 }, // above ₦50,000: ₦50
  ],
  stampDuty: { fromKobo: 1_000_000, feeKobo: 5_000 }, // ₦50 on ₦10,000 or more
};

/** The schedule in force. */
export const feeSchedule: FeeSchedule = paystackNov2026;
