"use client";
import React, { useState } from 'react';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import toast from '@/utils/toast';

interface PaymentProcessorProps {
  amount: number;
  onComplete: (transactionId: string) => void;
}

type PaymentMethod = 'mobile_money' | 'bank';

export default function PaymentProcessor({ amount, onComplete }: PaymentProcessorProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMobileMoneyPayment = async () => {
    if (!phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real application, you would:
      // 1. Call your payment gateway API
      // 2. Initiate STK push for mobile money
      // 3. Handle the response
      
      const mockTransactionId = `MM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      toast.success('Payment request sent! Check your phone for the STK push.');
      onComplete(mockTransactionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBankPayment = async () => {
    if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.bankName) {
      toast.error('Please fill in all bank details');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real application, you would:
      // 1. Verify bank details
      // 2. Process bank transfer
      // 3. Handle the response
      
      const mockTransactionId = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      toast.success('Bank transfer initiated successfully!');
      onComplete(mockTransactionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900">Payment Details</h3>
        <p className="text-gray-600 mt-2">Amount to pay: KES {amount.toFixed(2)}</p>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <Button
          variant={paymentMethod === 'mobile_money' ? 'primary' : 'outline'}
          onClick={() => setPaymentMethod('mobile_money')}
        >
          Mobile Money
        </Button>
        <Button
          variant={paymentMethod === 'bank' ? 'primary' : 'outline'}
          onClick={() => setPaymentMethod('bank')}
        >
          Bank Transfer
        </Button>
      </div>

      {paymentMethod === 'mobile_money' ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your M-Pesa number"
              required
            />
          </div>
          <Button
            variant="primary"
            onClick={handleMobileMoneyPayment}
            loading={isProcessing}
            className="w-full"
          >
            Pay with M-Pesa
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              name="bankName"
              value={bankDetails.bankName}
              onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
              placeholder="Enter bank name"
              required
            />
          </div>
          <div>
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              name="accountName"
              value={bankDetails.accountName}
              onChange={(e) => setBankDetails(prev => ({ ...prev, accountName: e.target.value }))}
              placeholder="Enter account name"
              required
            />
          </div>
          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              name="accountNumber"
              value={bankDetails.accountNumber}
              onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
              placeholder="Enter account number"
              required
            />
          </div>
          <Button
            variant="primary"
            onClick={handleBankPayment}
            loading={isProcessing}
            className="w-full"
          >
            Pay with Bank Transfer
          </Button>
        </div>
      )}
    </div>
  );
}
