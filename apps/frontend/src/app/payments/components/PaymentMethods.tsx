"use client";

import { useState } from "react";
import { CreditCard, Plus, Trash2, Shield, Building2, X } from "lucide-react";

// Mock payment methods data
const mockCreditCards = [
  {
    id: "1",
    type: "Visa",
    number: "•••• 4242",
    holder: "John Doe",
    expires: "12/25",
    added: "01/15/2024",
    isDefault: true,
  },
];

const mockBankAccounts = [
  {
    id: "1",
    bank: "Test Bank",
    number: "•••• 7890",
    type: "Savings Account",
    routing: "123456",
    added: "01/15/2024",
    isDefault: false,
    isVerified: true,
  },
];

export default function PaymentMethods() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMethodType, setAddMethodType] = useState<"credit" | "bank">(
    "credit"
  );

  const [newCardHolder, setNewCardHolder] = useState("");
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardMonth, setNewCardMonth] = useState("");
  const [newCardYear, setNewCardYear] = useState("");
  const [newCardCVV, setNewCardCVV] = useState("");

  const [newBankName, setNewBankName] = useState("");
  const [newAccountType, setNewAccountType] = useState("Checking Account");
  const [newRoutingNumber, setNewRoutingNumber] = useState("");
  const [newAccountNumber, setNewAccountNumber] = useState("");

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setAddMethodType("credit");
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewCardHolder("");
    setNewCardNumber("");
    setNewCardMonth("");
    setNewCardYear("");
    setNewCardCVV("");
    setNewBankName("");
    setNewAccountType("Checking Account");
    setNewRoutingNumber("");
    setNewAccountNumber("");
  };

  const handleAddCreditCard = async () => {
    // UI only - backend integration will be done later
    alert(
      "Add credit card functionality will be implemented with backend integration"
    );
    handleCloseAddModal();
  };

  const handleAddBankAccount = async () => {
    // UI only - backend integration will be done later
    alert(
      "Add bank account functionality will be implemented with backend integration"
    );
    handleCloseAddModal();
  };

  const handleDeleteCard = async (cardId: string) => {
    // UI only - backend integration will be done later
    alert(
      "Delete card functionality will be implemented with backend integration"
    );
  };

  const handleDeleteBankAccount = async (accountId: string) => {
    // UI only - backend integration will be done later
    alert(
      "Delete bank account functionality will be implemented with backend integration"
    );
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">
              Payment Methods
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
              Manage your credit cards and bank accounts
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm md:text-base font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Payment Method
          </button>
        </div>

        {/* Credit Cards */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            <h2 className="text-base sm:text-lg font-medium text-gray-900">
              Credit Cards
            </h2>
          </div>

          {mockCreditCards.length > 0 ? (
            <div className="space-y-3">
              {mockCreditCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-gray-50 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="w-10 h-7 sm:w-12 sm:h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm md:text-base font-medium text-gray-900">
                          {card.type} {card.number}
                        </span>
                        {card.isDefault && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 sm:py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-gray-600">
                        {card.holder} • Expires {card.expires} • Added{" "}
                        {card.added}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#FF6B35]/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF6B35]" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                No credit cards added
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-4 sm:mb-6">
                Add a credit card to start receiving funds
              </p>
            </div>
          )}
        </div>

        {/* Bank Accounts */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              <h2 className="text-base sm:text-lg font-medium text-gray-900">
                Bank Accounts
              </h2>
            </div>
          </div>

          {mockBankAccounts.length > 0 ? (
            <div className="space-y-3">
              {mockBankAccounts.map((account) => (
                <div
                  key={account.id}
                  className="bg-gray-50 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="w-10 h-7 sm:w-12 sm:h-8 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm md:text-base font-medium text-gray-900">
                          {account.bank} {account.number}
                        </span>
                        {account.isDefault && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 sm:py-1 rounded-full">
                            Default
                          </span>
                        )}
                        {account.isVerified && (
                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-gray-600">
                        {account.type} • Routing: {account.routing} • Added{" "}
                        {account.added}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleDeleteBankAccount(account.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#FF6B35]/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF6B35]" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                No bank accounts added
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-4 sm:mb-6">
                Add a bank account to start receiving withdrawals
              </p>
            </div>
          )}
        </div>

        <div className="bg-[#FF6B35]/10 border border-[#FF6B35] rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF6B35] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm md:text-base font-medium text-[#FF6B35] mb-1">
                Your Payment Information is Secure
              </h3>
              <p className="text-xs md:text-sm text-[#FF6B35]">
                We use industry-standard encryption and security measures to
                protect your financial information. Your payment details are
                never stored on our servers and are processed securely through
                our certified payment partners.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#FF6B35]/20 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <div className="flex-1 pr-2">
                  <h2 className="text-lg sm:text-xl font-semibold text-[#FF6B35]">
                    Add Payment Method
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                    Add a credit card or bank account for payments and
                    withdrawals.
                  </p>
                </div>
                <button
                  onClick={handleCloseAddModal}
                  className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
                <button
                  onClick={() => setAddMethodType("credit")}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg border-2 transition-all text-sm sm:text-base ${
                    addMethodType === "credit"
                      ? "border-[#FF6B35] bg-[#FF6B35]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium">Credit Card</span>
                </button>
                <button
                  onClick={() => setAddMethodType("bank")}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg border-2 transition-all text-sm sm:text-base ${
                    addMethodType === "bank"
                      ? "border-[#FF6B35] bg-[#FF6B35]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium">Bank Account</span>
                </button>
              </div>

              {addMethodType === "credit" && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={newCardHolder}
                      onChange={(e) => setNewCardHolder(e.target.value)}
                      className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                      placeholder="Cardholder Name"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={newCardNumber}
                      onChange={(e) =>
                        setNewCardNumber(
                          e.target.value
                            .replace(/\s/g, "")
                            .replace(/(.{4})/g, "$1 ")
                            .trim()
                        )
                      }
                      className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                      maxLength={19}
                      placeholder="Card Number"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <select
                      value={newCardMonth}
                      onChange={(e) => setNewCardMonth(e.target.value)}
                      className="w-full px-2 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] appearance-none bg-white"
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option
                          key={i + 1}
                          value={String(i + 1).padStart(2, "0")}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </option>
                      ))}
                    </select>

                    <select
                      value={newCardYear}
                      onChange={(e) => setNewCardYear(e.target.value)}
                      className="w-full px-2 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] appearance-none bg-white"
                    >
                      <option value="">YYYY</option>
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i} value={2024 + i}>
                          {2024 + i}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={newCardCVV}
                      onChange={(e) =>
                        setNewCardCVV(
                          e.target.value.replace(/\D/g, "").slice(0, 4)
                        )
                      }
                      className="w-full px-2 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                      maxLength={4}
                      placeholder="CVV"
                    />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-4">
                    <button
                      onClick={handleCloseAddModal}
                      className="px-4 sm:px-6 py-2 text-sm sm:text-base text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddCreditCard}
                      className="px-4 sm:px-6 py-2 text-sm sm:text-base text-white bg-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/90"
                    >
                      Add Card
                    </button>
                  </div>
                </div>
              )}

              {addMethodType === "bank" && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={newBankName}
                      onChange={(e) => setNewBankName(e.target.value)}
                      className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                      placeholder="Bank Name"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={newAccountType}
                      onChange={(e) => setNewAccountType(e.target.value)}
                      className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] appearance-none bg-white"
                    >
                      <option value="Checking Account">Checking Account</option>
                      <option value="Savings Account">Savings Account</option>
                    </select>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={newRoutingNumber}
                      onChange={(e) =>
                        setNewRoutingNumber(
                          e.target.value.replace(/\D/g, "").slice(0, 9)
                        )
                      }
                      className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                      maxLength={9}
                      placeholder="Routing Number"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={newAccountNumber}
                      onChange={(e) =>
                        setNewAccountNumber(
                          e.target.value.replace(/\D/g, "").slice(0, 17)
                        )
                      }
                      className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                      maxLength={17}
                      placeholder="Account Number"
                    />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-4">
                    <button
                      onClick={handleCloseAddModal}
                      className="px-4 sm:px-6 py-2 text-sm sm:text-base text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddBankAccount}
                      className="px-4 sm:px-6 py-2 text-sm sm:text-base text-white bg-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/90"
                    >
                      Add Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
