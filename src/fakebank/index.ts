// The fake bank. Every call goes through here (CLAUDE.md rule 1).
// Stage 5 adds receiveIncome, createRecipient, sendTransfer and getTransferStatus.
export { resolveAccountName, type ResolveResult } from './resolveAccountName';
