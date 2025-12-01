"use client";

import { useState } from "react";
import {
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  Info,
  MoveUpRight,
  Wallet,
  X,
  CreditCard,
  Building2,
} from "lucide-react";

// Mock PaymentData type
interface PaymentData {
  totalBalance: number;
  availableNow: number;
  pendingClearance: number;
  availableUtilization: number;
  pendingUtilization: number;
  dailyWithdrawalLimit: number;
  dailyTransactionLimit: number;
}

// Mock data for UI only
const sampleData: PaymentData = {
  totalBalance: 15750,
  availableNow: 12500,
  pendingClearance: 3250,
  availableUtilization: 75,
  pendingUtilization: 25,
  dailyWithdrawalLimit: 1,
  dailyTransactionLimit: 10,
};

export default function Overview() {
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  // Withdraw modal state
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawAmountFocused, setIsWithdrawAmountFocused] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState<string | null>(
    null
  );

  const data = sampleData;

  const openAddFundsModal = () => {
    setIsAddFundsModalOpen(true);
    if (typeof window !== "undefined") {
      document.body.style.overflow = "hidden";
    }
  };

  const closeAddFundsModal = () => {
    setIsAddFundsModalOpen(false);
    if (typeof window !== "undefined") {
      document.body.style.overflow = "unset";
    }
    setAmount("");
    setIsAmountFocused(false);
    setSelectedPayment(null);
  };

  const openWithdrawModal = () => {
    setIsWithdrawModalOpen(true);
    if (typeof window !== "undefined") {
      document.body.style.overflow = "hidden";
    }
  };

  const closeWithdrawModal = () => {
    setIsWithdrawModalOpen(false);
    if (typeof window !== "undefined") {
      document.body.style.overflow = "unset";
    }
    setWithdrawAmount("");
    setIsWithdrawAmountFocused(false);
    setSelectedBankAccount(null);
  };

  const handleAddFunds = async () => {
    // UI only - backend integration will be done later
    alert(
      "Add funds functionality will be implemented with backend integration"
    );
    closeAddFundsModal();
  };

  const handleWithdraw = async () => {
    // UI only - backend integration will be done later
    alert(
      "Withdraw functionality will be implemented with backend integration"
    );
    closeWithdrawModal();
  };

  // Quick select functions for withdraw amount
  const handleQuickSelect = (percentage: number) => {
    const availableBalance = data.availableNow;
    const amount = (availableBalance * percentage) / 100;
    setWithdrawAmount(amount.toFixed(2));
  };

  const handleMaxWithdraw = () => {
    const availableBalance = data.availableNow;
    setWithdrawAmount(availableBalance.toFixed(2));
  };

  // Mock payment options
  const paymentOptions = [
    {
      id: "1",
      number: "•••• 4242",
      type: "card",
      name: "Visa",
      label: "Default",
    },
  ];

  // Mock bank accounts
  const bankAccounts = [
    {
      id: "1",
      bankName: "Test Bank",
      accountNumber: "1234567890",
      accountType: "Savings",
      verified: true,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Total Balance Card */}
      <div className="bg-[#FF6B35] rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-base sm:text-lg font-medium">
                  Total Balance
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                    Verified Account
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
        </div>

        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
            ₹{data.totalBalance.toLocaleString()}
          </div>
          <p className="text-sm sm:text-base text-white/80">
            Available across all payment methods
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={openAddFundsModal}
            className="flex-1 bg-white/30 hover:bg-white/20 transition-colors rounded-lg sm:rounded-xl py-2.5 sm:py-3 flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Funds
          </button>
          <button
            onClick={openWithdrawModal}
            className="flex-1 bg-white/30 hover:bg-white/20 transition-colors rounded-lg sm:rounded-xl py-2.5 sm:py-3 flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
          >
            <MoveUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
            Withdraw
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-[#FF6B35]/10 border border-[#FF6B35] rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm transform transition duration-200 hover:scale-102">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">
              Available Now
            </h3>
          </div>

          <div className="mb-4 sm:mb-6">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
              ₹{data.availableNow.toLocaleString()}
            </div>
            <p className="text-gray-600 text-xs sm:text-sm">
              Ready for withdrawal
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-2">
                <span className="text-gray-600">Utilization</span>
                <span className="font-medium">
                  {data.availableUtilization}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#FF6B35] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data.availableUtilization}%` }}
                ></div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-500">
              Daily limit: ₹1,00,000
            </p>
          </div>
        </div>
        <div className="bg-[#FF6B35]/10 border border-[#FF6B35] rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm transform transition duration-200 hover:scale-102">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">
              Pending Clearance
            </h3>
          </div>

          <div className="mb-4 sm:mb-6">
            <div className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1">
              ₹{data.pendingClearance.toLocaleString()}
            </div>
            <p className="text-gray-600 text-xs sm:text-sm">
              48-hour hold period
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-2">
                <span className="text-gray-600">Of total balance</span>
                <span className="font-medium">{data.pendingUtilization}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#FF6B35] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data.pendingUtilization}%` }}
                ></div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-500">
              Expected clearance in ~24 hours
            </p>
          </div>
        </div>
      </div>

      {/* Account Status & Limits */}
      <div className="bg-white border-[#FF6B35] rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">
            Account Status & Limits
          </h3>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-[#FF6B35]/10 transform transition duration-200 hover:scale-102 rounded-lg sm:rounded-xl border border-[#FF6B35] gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              <div>
                <h4 className="text-sm sm:text-base font-medium text-gray-900">
                  Enhanced Verification
                </h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  Full access to all features
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs sm:text-sm font-medium rounded-full">
              Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-1">
                  Daily Transaction Limit
                </h4>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  ₹10,00,000
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Maximum daily transaction amount
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-1">
                  Daily Withdrawal Limit
                </h4>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  ₹1,00,000
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Maximum daily withdrawal amount
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Funds Modal */}
      {isAddFundsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-[#FF6B35]/10"
            onClick={closeAddFundsModal}
          ></div>

          <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            <div className="flex items-start sm:items-center justify-between p-4 sm:p-6 pb-3 sm:pb-4 border-b border-gray-100">
              <div className="flex-1 pr-2">
                <h2 className="text-lg sm:text-xl font-semibold text-[#FF6B35]">
                  Add Funds to Wallet
                </h2>
                <p className="text-gray-600 mt-1 text-xs sm:text-sm">
                  Add money to your platform wallet for future payments and
                  bookings.
                </p>
              </div>
              <button
                onClick={closeAddFundsModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onFocus={() => setIsAmountFocused(true)}
                  onBlur={() => setIsAmountFocused(false)}
                  className="w-full px-4 py-2 text-base sm:text-lg border border-gray-200 rounded-lg sm:rounded-xl focus:border-[#FF6B35] focus:outline-none transition-colors pl-8"
                  placeholder=" "
                />
                <label className="absolute -top-2.5 sm:-top-3 left-4 bg-white px-2 text-[#FF6B35] text-xs sm:text-sm font-medium pointer-events-none">
                  Amount (INR)
                </label>
                <div className="absolute left-4 top-2.5 sm:top-3 text-base sm:text-lg text-gray-500 pointer-events-none">
                  ₹
                </div>
              </div>

              <div className="space-y-2 relative">
                {paymentOptions.map((option) => {
                  const isSelected = selectedPayment === option.id;

                  return (
                    <div
                      key={option.id}
                      onClick={() => setSelectedPayment(option.id)}
                      className={`w-full px-4 py-2 border rounded-lg sm:rounded-xl bg-gray-50 flex items-center gap-3 cursor-pointer transition-colors hover:bg-gray-100 ${
                        isSelected ? "border-[#FF6B35]" : "border-gray-200"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <div>
                        <div className="text-sm sm:text-base font-medium text-gray-900">
                          {option.type === "card"
                            ? `Card ${option.number}`
                            : `Bank ${option.number}`}{" "}
                          {option.label && `(${option.label})`}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          {option.name}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <label className="absolute -top-2.5 sm:-top-3 left-4 bg-white px-2 text-[#FF6B35] text-xs sm:text-sm font-medium">
                  Payment Method
                </label>
              </div>

              <p className="text-xs sm:text-sm text-gray-600">
                Funds will be charged to your default payment method.
              </p>

              <div className="bg-[#FF6B35]/10 border border-[#FF6B35] rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF6B35] mt-0.5 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-[#FF6B35]">
                  Added funds will be available immediately for platform
                  transactions and bookings.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-100">
              <button
                onClick={closeAddFundsModal}
                className="px-4 sm:px-6 py-2.5 sm:py-3 text-gray-700 hover:bg-gray-50 rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFunds}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base"
              >
                Add Funds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Funds Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-[#FF6B35]/20"
            onClick={closeWithdrawModal}
          ></div>

          <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            <div className="flex items-start sm:items-center justify-between p-4 sm:p-6 pb-3 sm:pb-4 border-b border-gray-100">
              <div className="flex-1 pr-2">
                <h2 className="text-lg sm:text-xl font-semibold text-[#FF6B35]">
                  Withdraw Funds
                </h2>
                <p className="text-gray-600 mt-1 text-xs sm:text-sm">
                  Review the withdrawal calculation based on your cleared event
                  revenue.
                </p>
              </div>
              <button
                onClick={closeWithdrawModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Withdrawal Amount Section */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Withdrawal Amount (INR)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={withdrawAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*\.?\d*$/.test(value)) {
                        const numValue = parseFloat(value);
                        const maxAmount = data.availableNow;
                        if (numValue <= maxAmount || value === "") {
                          setWithdrawAmount(value);
                        }
                      }
                    }}
                    onFocus={() => setIsWithdrawAmountFocused(true)}
                    onBlur={() => setIsWithdrawAmountFocused(false)}
                    className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none transition-colors ${
                      isWithdrawAmountFocused || withdrawAmount
                        ? "border-[#FF6B35]"
                        : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                  <div className="absolute left-4 top-3 text-lg text-gray-500 pointer-events-none">
                    ₹
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Minimum: ₹10.00</span>
                  <span>Maximum: ₹{data.availableNow.toFixed(2)}</span>
                </div>
              </div>

              {/* Quick Select Section */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Quick Select
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleQuickSelect(25)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    25% ₹{((data.availableNow || 0) * 0.25).toFixed(2)}
                  </button>
                  <button
                    onClick={() => handleQuickSelect(50)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    50% ₹{((data.availableNow || 0) * 0.5).toFixed(2)}
                  </button>
                  <button
                    onClick={() => handleQuickSelect(75)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    75% ₹{((data.availableNow || 0) * 0.75).toFixed(2)}
                  </button>
                  <button
                    onClick={handleMaxWithdraw}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-gray-100"
                  >
                    Max ₹{(data.availableNow || 0).toFixed(2)}
                  </button>
                </div>
              </div>

              {/* Destination Bank Account Section */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Destination Bank Account
                </label>
                {bankAccounts.length > 0 ? (
                  <div className="space-y-2">
                    {bankAccounts.map((bankAccount) => (
                      <div
                        key={bankAccount.id}
                        onClick={() => setSelectedBankAccount(bankAccount.id)}
                        className={`border rounded-lg p-3 flex items-center gap-3 cursor-pointer transition-colors ${
                          selectedBankAccount === bankAccount.id
                            ? "border-[#FF6B35] bg-[#FF6B35]/5"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Building2 className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {bankAccount.bankName} ****{" "}
                            {bankAccount.accountNumber.slice(-4)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {bankAccount.accountType} Account
                            {bankAccount.verified && (
                              <span className="ml-2 text-green-600">
                                ✓ Verified
                              </span>
                            )}
                          </div>
                        </div>
                        {selectedBankAccount === bankAccount.id && (
                          <div className="w-5 h-5 bg-[#FF6B35] rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg p-4 text-center">
                    <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      No bank accounts added
                    </p>
                    <p className="text-xs text-gray-500">
                      Add a bank account in Payment Methods to withdraw funds
                    </p>
                  </div>
                )}
              </div>

              {/* Withdrawal Summary Section */}
              {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Withdrawal Summary
                  </h3>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">
                      Withdrawal Amount
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      ₹{parseFloat(withdrawAmount).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">
                      Processing Fee
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      ₹0.00
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">
                        Net Transfer Amount
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        ₹{parseFloat(withdrawAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">
                      Remaining Balance
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      ₹
                      {(
                        data.availableNow - parseFloat(withdrawAmount || "0")
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Information Message */}
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Withdrawals typically take 1-2 business days to appear in your
                  bank account.
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-100">
              <button
                onClick={closeWithdrawModal}
                className="px-4 sm:px-6 py-2.5 sm:py-3 text-gray-700 hover:bg-gray-50 rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={
                  !withdrawAmount ||
                  !selectedBankAccount ||
                  parseFloat(withdrawAmount) < 10 ||
                  parseFloat(withdrawAmount) > data.availableNow
                }
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#FF6B35] hover:bg-[#FF6B35]/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base"
              >
                {withdrawAmount && parseFloat(withdrawAmount) > 0
                  ? `Withdraw ₹${parseFloat(withdrawAmount).toFixed(2)}`
                  : "Withdraw Funds"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
