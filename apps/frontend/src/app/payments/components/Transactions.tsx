"use client";

import React, { useState } from "react";
import {
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Clock,
  Search,
  Eye,
  Calendar,
  ArrowUpDown,
} from "lucide-react";

// Mock transaction data
interface Transaction {
  _id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  description?: string;
}

const mockTransactions: Transaction[] = [
  {
    _id: "1",
    amount: 5000,
    type: "deposit",
    status: "cleared",
    createdAt: new Date().toISOString(),
    description: "Event Revenue",
  },
  {
    _id: "2",
    amount: 2500,
    type: "withdrawal",
    status: "pending",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    description: "Bank Transfer",
  },
];

export default function Transactions() {
  const [typeFilter, setTypeFilter] = useState<"all" | string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortField, setSortField] = useState<
    "date" | "amount" | "type" | "status"
  >("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const getTransactionTitle = (type: string) => {
    switch (type) {
      case "deposit":
        return "Deposit";
      case "withdrawal":
        return "Withdrawal";
      case "subscription":
        return "Subscription";
      case "event_revenue":
        return "Event Revenue";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getTransactionType = (type: string) => {
    return ["deposit", "event_revenue"].includes(type) ? "income" : "expense";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const { totalIncome, totalExpenses, pendingAmount } = {
    totalIncome: mockTransactions
      .filter((t) => getTransactionType(t.type) === "income")
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: mockTransactions
      .filter((t) => getTransactionType(t.type) === "expense")
      .reduce((sum, t) => sum + t.amount, 0),
    pendingAmount: mockTransactions
      .filter((t) => t.status === "pending")
      .reduce((sum, t) => sum + t.amount, 0),
  };

  const filteredTransactions = mockTransactions.filter((transaction) => {
    const typeMatch =
      typeFilter === "all" ||
      getTransactionType(transaction.type) === typeFilter;
    const statusMatch =
      statusFilter === "all" || transaction.status === statusFilter;
    const searchMatch =
      searchTerm === "" ||
      getTransactionTitle(transaction.type)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return typeMatch && statusMatch && searchMatch;
  });

  const getStatusBadge = (status: string) => {
    if (status === "cleared" || status === "success") {
      return (
        <span className="inline-flex items-center px-4 py-1 rounded-lg text-xs border border-[#FF6B35] font-medium bg-[#FF6B35]/20 text-[#FF6B36]">
          Cleared
        </span>
      );
    } else if (status === "pending") {
      return (
        <span className="inline-flex items-center px-4 py-1 rounded-lg text-xs border border-[#FF6B35] font-medium bg-[#FF6B35]/30 text-[#FF6B36]">
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-4 py-1 rounded-lg text-xs border border-gray-300 font-medium bg-gray-100 text-gray-600">
        {status}
      </span>
    );
  };

  const formatAmount = (amount: number, type: string) => {
    const transactionType = getTransactionType(type);
    const formatted = `₹${amount
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    if (transactionType === "income") {
      return `+${formatted}`;
    } else {
      return `-${formatted}`;
    }
  };

  const getAmountColor = (type: string) => {
    const transactionType = getTransactionType(type);
    return transactionType === "income" ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-50 border-[#FF6B35] rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Total Income</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            ₹{totalIncome.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </div>
        </div>

        <div className="bg-orange-50 border-[#FF6B35] rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Total Expenses</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            ₹{totalExpenses.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </div>
        </div>

        <div className="bg-orange-50 border-[#FF6B35] rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-600">Pending Amount</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            ₹{pendingAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900">
                Transaction Management
              </h2>
            </div>
            <button className="flex items-center gap-2 px-6 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg border transition-colors">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
              >
                <option value="all">All Status</option>
                <option value="cleared">Cleared</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
              />
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-700">
            <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900">
              Date
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900">
              Type
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <div>Description</div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900">
              Amount
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900">
              Status
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <div>Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-md font-medium text-gray-900 mb-2">
                No transactions found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters to see more results.
              </p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="grid grid-cols-6 gap-4 items-center">
                  <div className="text-sm text-gray-900">
                    {formatDate(transaction.createdAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        getTransactionType(transaction.type) === "income"
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      {getTransactionType(transaction.type) === "income" ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {getTransactionTitle(transaction.type)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {transaction.description || "N/A"}
                  </div>
                  <div
                    className={`text-sm font-semibold ${getAmountColor(
                      transaction.type
                    )}`}
                  >
                    {formatAmount(transaction.amount, transaction.type)}
                  </div>
                  <div>{getStatusBadge(transaction.status)}</div>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Download Receipt"
                    >
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
