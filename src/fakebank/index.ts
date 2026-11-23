// The fake bank. Every call goes through here (CLAUDE.md rule 1).
// Stage 5b adds receiveIncome, createRecipient, sendTransfer and getTransferStatus.
export { resolveAccountName, type ResolveResult } from './resolveAccountName';
export {
  accountDetailsText,
  identityFailText,
  identityLockedOut,
  openAccount,
  verifyIdentity,
  type IdentityResult,
  type SpreaditAccount,
} from './identity';
