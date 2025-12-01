"use client";

import {
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Crown,
  Zap,
  BarChart3,
  Shield,
  Users,
  Globe,
  MessageSquare,
  Award,
  TrendingUp,
  X,
  ChevronDown,
  Clock,
  Plus,
} from "lucide-react";
import { useState } from "react";

// Mock subscription plans
const mockPlans = [
  {
    id: "1month",
    title: "Monthly",
    subtitle: "Billed monthly",
    price: "₹999/mo",
    selected: false,
  },
  {
    id: "6months",
    title: "6 Months",
    subtitle: "Billed every 6 months",
    price: "₹849/mo",
    total: "₹5,095 total",
    savings: "Save ₹899",
    savePercent: "Save 15% compared to monthly",
    badge: "Most Popular",
    selected: false,
  },
  {
    id: "12months",
    title: "Yearly",
    subtitle: "Billed every 12 months",
    price: "₹749/mo",
    total: "₹8,991 total",
    savings: "Save ₹2,997",
    savePercent: "Save 25% compared to monthly",
    selected: false,
  },
];

export default function Subscription() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("1month");
  const [showPaymentOptions, setShowPaymentOptions] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<string>();
  const [activePaymentTab, setActivePaymentTab] = useState<
    "saved" | "new" | "digital"
  >("saved");
  const [autoRenewal, setAutoRenewal] = useState<boolean>(true);

  // New card form state
  const [newCardHolder, setNewCardHolder] = useState<string>("");
  const [newCardNumber, setNewCardNumber] = useState<string>("");
  const [newCardMonth, setNewCardMonth] = useState<string>("");
  const [newCardYear, setNewCardYear] = useState<string>("");
  const [newCardCVV, setNewCardCVV] = useState<string>("");

  // Digital pay form state
  const [selectedPaymentType, setSelectedPaymentType] =
    useState<string>("UPI (India)");
  const [upiId, setUpiId] = useState<string>("user@upi");
  const [showPaymentTypeDropdown, setShowPaymentTypeDropdown] =
    useState<boolean>(false);

  // Mock payment options
  const paymentOptions = [
    {
      id: "1",
      number: "**** **** **** 4242",
      type: "VISA",
      label: "Default",
    },
  ];

  const handleStartTrial = async () => {
    // UI only - backend integration will be done later
    alert(
      "Start trial functionality will be implemented with backend integration"
    );
    setShowModal(false);
  };

  const getSelectedPlanInfo = () => {
    const plan = mockPlans.find((p) => p.id === selectedPlan);
    return plan || mockPlans[0];
  };

  return (
    <div className="space-y-6">
      {/* Initial Subscription Offer */}
      <div className="max-w-full mx-auto bg-white rounded-lg border border-[#FF6B35]/30 shadow-sm">
        <div className="text-center p-8">
          {/* Crown Icon */}
          <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Upgrade to Pro
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Unlock powerful features to grow your events business.
          </p>

          {/* Badges */}
          <div className="flex justify-center gap-3 mb-6">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Limited Time Offer
            </span>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              7-Day Free Trial
            </span>
          </div>

          {/* Pricing */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl text-gray-400 line-through">
                ₹1,999
              </span>
              <span className="text-4xl font-bold text-[#FF6B35]">
                ₹999/month
              </span>
            </div>
            <p className="text-green-600 font-medium">
              Save 50% with our launch offer
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="flex flex-col items-center p-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
                <Zap className="w-4 h-4 text-yellow-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Unlimited Events
              </span>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Advanced Analytics
              </span>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Premium Support
              </span>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Team Collaboration
              </span>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <Globe className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                API Access
              </span>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mb-2">
                <MessageSquare className="w-4 h-4 text-pink-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Priority Processing
              </span>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                <Crown className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Custom Branding
              </span>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Advanced Reporting
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#FF6B35] text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-[#FF6B35]/90 transition-colors mb-4"
          >
            Start Free Trial
          </button>

          {/* Disclaimer */}
          <p className="text-sm text-gray-500">
            No credit card required for trial. Cancel anytime.
          </p>
        </div>
      </div>

      {/* Subscribe Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#FF6B35]/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Subscribe to Pro Plan
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Choose your billing period and payment method. Your trial
                  starts immediately.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Choose Billing Period */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Choose Billing Period
                </h3>
                <div className="space-y-4">
                  {mockPlans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedPlan === plan.id
                          ? "border-[#FF6B35] bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {plan.badge && (
                        <span className="absolute -top-2 left-4 bg-[#FF6B35] text-white text-xs px-2 py-1 rounded-full">
                          {plan.badge}
                        </span>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              selectedPlan === plan.id
                                ? "border-[#FF6B35]"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedPlan === plan.id && (
                              <div className="w-2 h-2 bg-[#FF6B35] rounded-full" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {plan.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              {plan.subtitle}
                            </p>
                            {plan.savePercent && (
                              <p className="text-sm text-green-600 font-medium">
                                {plan.savePercent}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#FF6B35]">
                            {plan.price}
                          </p>
                          {plan.total && (
                            <p className="text-sm text-gray-600">
                              {plan.total}
                            </p>
                          )}
                          {plan.savings && (
                            <p className="text-sm text-green-600 font-medium">
                              {plan.savings}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Method
                </h3>

                {/* Payment Method Tabs */}
                <div className="flex border-b border-gray-200 mb-4">
                  <button
                    onClick={() => setActivePaymentTab("saved")}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium ${
                      activePaymentTab === "saved"
                        ? "border-[#FF6B35] text-[#FF6B35]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Saved Cards
                  </button>
                  <button
                    onClick={() => setActivePaymentTab("new")}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium ${
                      activePaymentTab === "new"
                        ? "border-[#FF6B35] text-[#FF6B35]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    New Card
                  </button>
                  <button
                    onClick={() => setActivePaymentTab("digital")}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium ${
                      activePaymentTab === "digital"
                        ? "border-[#FF6B35] text-[#FF6B35]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Digital Pay
                  </button>
                </div>

                {/* Payment Method Selection */}
                {activePaymentTab === "saved" && (
                  <div className="border border-gray-300 rounded-lg p-3">
                    <button
                      onClick={() => setShowPaymentOptions(!showPaymentOptions)}
                      className="w-full flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">
                        {selectedPayment
                          ? paymentOptions.find(
                              (opt) => opt.id === selectedPayment
                            )?.number
                          : "Select a payment method"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          showPaymentOptions ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showPaymentOptions && paymentOptions.length > 0 && (
                      <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                        {paymentOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => {
                              setSelectedPayment(option.id);
                              setShowPaymentOptions(false);
                            }}
                            className={`w-full p-3 flex items-center gap-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                              selectedPayment === option.id
                                ? "bg-orange-50"
                                : ""
                            }`}
                          >
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-mono">
                              {option.number}
                            </span>
                            <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded">
                              {option.type}
                            </span>
                            {option.label && (
                              <span className="text-xs text-gray-500">
                                {option.label}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activePaymentTab === "new" && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={newCardHolder}
                      onChange={(e) => setNewCardHolder(e.target.value)}
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                      placeholder="Cardholder Name"
                    />
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
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                      maxLength={19}
                      placeholder="Card Number"
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <select
                        value={newCardMonth}
                        onChange={(e) => setNewCardMonth(e.target.value)}
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
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
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
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
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                        maxLength={4}
                        placeholder="CVV"
                      />
                    </div>
                  </div>
                )}

                {activePaymentTab === "digital" && (
                  <div className="space-y-4">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowPaymentTypeDropdown(!showPaymentTypeDropdown)
                        }
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg flex items-center justify-between text-left hover:border-gray-400"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                            <CreditCard className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="text-gray-900">
                            {selectedPaymentType}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            showPaymentTypeDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {showPaymentTypeDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 border border-gray-200 rounded-lg bg-white shadow-lg z-10">
                          <button
                            onClick={() => {
                              setSelectedPaymentType("UPI (India)");
                              setShowPaymentTypeDropdown(false);
                            }}
                            className="w-full p-3 flex items-center gap-3 text-left hover:bg-gray-50 border-b border-gray-100"
                          >
                            <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                              <CreditCard className="w-3 h-3 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              UPI (India)
                            </span>
                          </button>
                        </div>
                      )}
                    </div>

                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                      placeholder="UPI ID"
                    />
                  </div>
                )}
              </div>

              {/* Auto-renewal Toggle */}
              <div className="flex items-center gap-3 mb-8">
                <button
                  onClick={() => setAutoRenewal(!autoRenewal)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    autoRenewal ? "bg-[#FF6B35]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      autoRenewal ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Enable auto-renewal (recommended)
                </span>
              </div>

              {/* Free Trial Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Free Trial:</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Try Pro for 7 days at no cost. Cancel anytime during the
                      trial and you won't be charged. After the trial, you'll be
                      charged ₹999 per month.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartTrial}
                  className="flex-1 px-6 py-3 bg-[#FF6B35] text-white rounded-lg text-sm font-medium hover:bg-[#FF6B35]/90 transition-colors"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
