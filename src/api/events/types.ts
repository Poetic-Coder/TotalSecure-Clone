
export enum EventType {
  TRANSACTION = "transaction.complete",
  ACCOUNT_CREATED = "account.created",
  MANDATE_VERIFIED = "mandate.verified",
  MANDATE_DEBIT = "mandate.debit.complete",
}

export interface EventPayload {
  id: string; // Event ID
  event: EventType;
  payload: any;
  key: string;
  url: string;
}
