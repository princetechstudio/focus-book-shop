declare module '@paystack/inline-js' {
  interface PaystackTransaction {
    id: number;
    reference: string;
    message: string;
  }

  interface PaystackTransactionOptions {
    key: string;
    email: string;
    amount: number;
    currency: string;
    reference: string;
    metadata?: Record<string, string>;
    onSuccess: (transaction: PaystackTransaction) => void;
    onCancel: () => void;
    onError: (error: { message: string }) => void;
  }

  export default class PaystackPop {
    newTransaction(options: PaystackTransactionOptions): void;
  }
}