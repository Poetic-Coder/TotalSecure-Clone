export const QUEUES = {
    global: 'background',
    address: 'addressQueue',
    tsq: 'transactionStatusQueue',
    appzone: 'appzoneQueue',
    webhook: 'webhookEventQueue',
    comono: 'comonoQueue',
    transfer: 'transferQueue',
    saga: 'saga',
    dead_letter: 'dead_letter',
}

export const JOBS = {
    addressWebhookEvent: 'addressWebhookEvent',
    appzoneWebhookEvent: 'appzoneWebhookEvent',
    comonoWebhookEvent: 'comonoWebhookEvent',
    comonoDigitalWebhookEvent: 'comonoDigitalWebhookEvent',
    comonoPhysicalRequest: 'comonoPhysicalRequest',
    sendWebhookEvent: 'sendWebhookEvent',
    tsqLocal: 'localTransactionStatusRequest',
    tsqInterBank: 'interBankTransactionStatusRequest',
    tsqCIPInterBank: 'interBankCIPTransactionStatusRequest',
    transferJob: "transferJob",
    processBulkTransfer: 'processBulkTransfer',
    failedTransfer: 'failedTransfer',
    failedSaga: 'failedSaga',
}