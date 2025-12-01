"use client";

import React, { useMemo, useState } from "react";
import {
  Upload,
  Plus,
  Eye,
  Download,
  Send,
  FileText,
  ChevronDown,
  Search,
  X,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/store/hooks";
import Link from "next/link";

interface DocumentsProps {
  onTabChange?: (tab: string) => void;
}

interface Document {
  id: string;
  name: string;
  size: string;
  created: string;
  event: string;
  amount: string;
  recipient: string;
  status:
    | "uploaded"
    | "assigned"
    | "sent"
    | "pending_review"
    | "approved"
    | "signed"
    | "declined"
    | "cancelled"
    | "pending";
  signedDate?: string;
}

type TabType = "outgoing" | "incoming";

export default function DocumentsPage({ onTabChange }: DocumentsProps) {
  const { user } = useAuth();
  const userRole = user?.role;
  const isOrganizer = userRole === "organizer";
  const isSpeaker = userRole === "speaker";

  // Feature flags
  const ENABLE_SEARCH = false;

  const [activeTab, setActiveTab] = useState<TabType>("outgoing");
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("All Tags");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    documentName: "",
    documentType: "",
    file: null as File | null,
  });

  // Mock data - will be replaced with actual API calls
  const [outgoingDocuments, setOutgoingDocuments] = useState<Document[]>([]);
  const [incomingDocuments, setIncomingDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString() : "-";

  const getDocumentIcon = (doc: Document) => {
    const name = doc.name.toLowerCase();
    if (name.endsWith(".pdf")) {
      return <FileText className="w-8 h-8 text-red-600" />;
    } else if (name.endsWith(".doc") || name.endsWith(".docx")) {
      return <FileText className="w-8 h-8 text-blue-600" />;
    } else {
      return <FileText className="w-8 h-8 text-gray-600" />;
    }
  };

  const isIncoming = activeTab === "incoming";
  const isOutgoing = activeTab === "outgoing";

  const handleUploadDocument = () => {
    setShowUploadModal(true);
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setUploadForm({
      documentName: "",
      documentType: "",
      file: null,
    });
  };

  const handleFormSubmit = async () => {
    if (
      !(uploadForm.documentName && uploadForm.documentType && uploadForm.file)
    )
      return;

    console.log("Upload attempt:", {
      documentName: uploadForm.documentName,
      documentType: uploadForm.documentType,
      file: uploadForm.file,
    });

    // TODO: Implement actual upload API call
    try {
      // const res = await uploadDocument({...}).unwrap();
      setActiveTab("outgoing");
      setShowUploadModal(false);
      setUploadForm({
        documentName: "",
        documentType: "",
        file: null,
      });
    } catch (e: any) {
      console.error("Upload failed", e);
      alert("Upload failed. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadForm((prev) => ({
        ...prev,
        file: e.target.files![0],
      }));
    }
  };

  const handleGenerateMOU = () => {
    console.log("Generate MOU");
    // TODO: Implement MOU generation
  };

  const handleView = async (documentId: string) => {
    try {
      // TODO: Implement view/download API call
      console.log("View document:", documentId);
    } catch (e) {
      console.error("View/download failed", e);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        // TODO: Implement delete API call
        console.log("Delete document:", documentId);
      } catch (e) {
        console.error("Delete failed", e);
      }
    }
  };

  const handleSend = async (documentId: string) => {
    try {
      // TODO: Implement send API call
      console.log("Send document:", documentId);
    } catch (e) {
      console.error("Send failed", e);
    }
  };

  const getStatusBadge = (status: string, isIncoming: boolean = false) => {
    const baseClasses = "px-6 py-1 rounded-lg text-sm font-medium";
    switch (status) {
      case "signed":
        return `${baseClasses} bg-green-100 border border-green-600 text-green-600`;
      case "sent":
        return `${baseClasses} bg-green-200 border border-green-600 text-green-600`;
      case "approved":
        return `${baseClasses} bg-[#1A9D59] text-white`;
      case "pending_review":
        return `${baseClasses} bg-[#FFA500] text-white`;
      case "pending":
        return `${baseClasses} bg-[#FF6B35] text-white`;
      case "assigned":
        return `${baseClasses} bg-gray-200 text-gray-700`;
      default:
        return `${baseClasses} bg-gray-200 text-gray-700`;
    }
  };

  const getActionButton = (
    status: string,
    amount: string,
    isIncoming: boolean = false
  ) => {
    if (isIncoming) {
      switch (status) {
        case "approved":
          return (
            <button className="flex items-center gap-2 px-6 py-1 border border-[#FF6B35] text-[#FF6B35] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
              <Eye className="w-4 h-4" />
              View Only
            </button>
          );
        case "pending_review":
          return (
            <button className="flex items-center gap-2 px-6 py-1 border border-gray-600 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Download
            </button>
          );
        default:
          return (
            <button className="flex items-center gap-2 px-6 py-1 border border-[#FF6B35] text-[#FF6B35] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
              <Eye className="w-4 h-4" />
              View Only
            </button>
          );
      }
    }

    return (
      <button className="bg-[#FF6B35]/10 border border-[#FF6B35] text-[#FF6B35] px-6 py-1 rounded-lg text-sm font-medium hover:bg-[#FF6B35] hover:text-white transition-colors">
        Process Payment
      </button>
    );
  };

  // Dynamic stats for outgoing documents
  const outgoingStats = useMemo(() => {
    const docs = outgoingDocuments;
    return {
      total: docs.length,
      received: docs.filter((d) => d.status === "sent").length,
      reviewed: docs.filter((d) => d.status === "pending_review").length,
      drafts: docs.filter((d) => d.status === "assigned").length,
      sent: docs.filter((d) => d.status === "sent").length,
    };
  }, [outgoingDocuments]);

  // Dynamic stats for incoming documents
  const incomingStats = useMemo(() => {
    const docs = incomingDocuments;
    return {
      total: docs.length,
      received: docs.filter((d) => d.status === "sent").length,
      reviewed: docs.filter((d) => d.status === "pending_review").length,
      approved: docs.filter((d) => d.status === "approved").length,
      presentations: docs.filter(
        (d) => d.event === "MOU" || d.event === "Contract"
      ).length,
      bills: docs.filter((d) => d.event === "Invoice").length,
    };
  }, [incomingDocuments]);

  const currentDocuments = isOutgoing ? outgoingDocuments : incomingDocuments;
  const filteredDocuments = currentDocuments.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.event.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const renderOutgoingStats = () => (
    <div className="grid grid-cols-5 gap-4 mb-6">
      {[
        { label: "Total", value: outgoingStats.total },
        { label: "Received", value: outgoingStats.received },
        { label: "Reviewed", value: outgoingStats.reviewed },
        { label: "Drafts", value: outgoingStats.drafts },
        { label: "Sent", value: outgoingStats.sent },
      ].map((stat, idx) => (
        <div
          key={idx}
          className="bg-white border border-gray-300 rounded-xl shadow-sm p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF6B35] rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderIncomingStats = () => (
    <div className="grid grid-cols-6 gap-4 mb-6">
      {[
        { label: "Total", value: incomingStats.total },
        { label: "Received", value: incomingStats.received },
        { label: "Reviewed", value: incomingStats.reviewed },
        { label: "Approved", value: incomingStats.approved },
        { label: "Presentations", value: incomingStats.presentations },
        { label: "Bills", value: incomingStats.bills },
      ].map((stat, idx) => (
        <div
          key={idx}
          className="bg-white border border-gray-300 rounded-xl shadow-sm p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF6B35] rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="ml-0 sm:ml-[18rem] md:ml-[19.5rem] lg:ml-[21.5rem] mr-0 sm:mr-[2.5rem] md:mr-[3rem] lg:mr-[3.5rem] mt-32">
        <div className="pb-6">
          {/* Header */}
          <div className="bg-[#FF6B35]/50 px-6 py-4 rounded-md">
            <h1 className="text-2xl font-bold text-black mb-2">
              {isOrganizer ? "Speaker Management" : "Booking Management"}
            </h1>
            <p className="text-white">
              {isOrganizer
                ? "Manage your speaker contracts, documents, and payments in one place"
                : "Manage your speaking opportunities, documents, and organizer proposals"}
            </p>
          </div>

          {/* Navigation Tabs - Role-based */}
          {isOrganizer && (
            <div className="bg-gray-50 p-1 rounded-lg mt-4 mb-6 flex">
              <button
                onClick={() => onTabChange?.("Speaker Database")}
                className="flex-1 text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35] py-3 px-4 rounded-md text-center font-medium"
              >
                Speaker Database
              </button>
              <button
                onClick={() => onTabChange?.("Speaker Management")}
                className="flex-1 text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35] py-3 px-4 rounded-md text-center font-medium"
              >
                Speaker Management
              </button>
              <button className="flex-1 text-white bg-[#FF6B35] py-3 px-4 rounded-md font-medium">
                Documents
              </button>
            </div>
          )}

          {isSpeaker && (
            <div className="bg-gray-50 p-1 rounded-lg mt-4 mb-6 flex">
              <button
                onClick={() => onTabChange?.("Booking Management")}
                className="flex-1 text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35] py-3 px-4 rounded-md text-center font-medium"
              >
                Booking Management
              </button>
              <button className="flex-1 text-white bg-[#FF6B35] py-3 px-4 rounded-md font-medium">
                Documents
              </button>
            </div>
          )}

          {/* Main Content Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 mt-4 min-h-[calc(100vh-280px)]">
            {/* Upload Modal */}
            {showUploadModal && (
              <div className="fixed inset-0 bg-[#FF6B35]/20 flex items-center justify-center z-150">
                <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#FF6B35] mb-2">
                        Upload Document
                      </h2>
                      <p className="text-gray-600">
                        Upload a document that can be later assigned to speakers
                      </p>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="relative">
                      <input
                        type="text"
                        id="documentName"
                        value={uploadForm.documentName}
                        onChange={(e) =>
                          setUploadForm((prev) => ({
                            ...prev,
                            documentName: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none"
                        placeholder="Enter document name"
                      />
                      <label
                        htmlFor="documentName"
                        className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-[#FF6B35] font-medium"
                      >
                        Document Name*
                      </label>
                    </div>

                    <div className="relative">
                      <select
                        id="documentType"
                        value={uploadForm.documentType}
                        onChange={(e) =>
                          setUploadForm((prev) => ({
                            ...prev,
                            documentType: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none peer appearance-none bg-white"
                      >
                        <option value="">Select Document Type</option>
                        <option value="MOU">MOU</option>
                        <option value="Contract">Contract</option>
                        <option value="Invoice">Invoice</option>
                        <option value="Agreement">Agreement</option>
                      </select>
                      <label
                        htmlFor="documentType"
                        className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-[#FF6B35] font-medium transition-all duration-200"
                      >
                        Document Type*
                      </label>
                      <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                      <input
                        type="file"
                        id="uploadFile"
                        onChange={handleFileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:bg-[#FF6B35] file:text-white file:font-medium hover:file:bg-[#FF6B35]/90"
                        accept=".pdf,.doc,.docx"
                      />
                      <label
                        htmlFor="uploadFile"
                        className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-[#FF6B35] font-medium"
                      >
                        Upload File*
                      </label>
                    </div>

                    <div className="bg-[#FF6B35]/10 border border-[#FF6B35] rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-[#FF6B35]">
                          Note: After uploading, you can assign this document to
                          specific speakers from the documents list.{" "}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-8">
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-2.5 border border-[#FF6B35] text-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/10 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFormSubmit}
                      disabled={
                        !uploadForm.documentName ||
                        !uploadForm.documentType ||
                        !uploadForm.file
                      }
                      className="px-6 py-2.5 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      Upload Document
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Header with Add Document Button */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Document Management
                </h2>
                <p className="text-gray-600 text-sm">
                  Manage outgoing and incoming documents with speakers
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleUploadDocument}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  <Upload className="w-4 h-4" />
                  Upload Document
                </button>
                <button
                  onClick={handleGenerateMOU}
                  className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#FF6B35]/90 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Generate MOU
                </button>
              </div>
            </div>

            {/* Search and Filter Controls */}
            {ENABLE_SEARCH && (
              <div className="flex items-center space-x-10 mb-6">
                <div className="relative flex-1 max-w-3xl">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search documents, speakers, or events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-[#FF6B35] bg-[#FF6B35]/15 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm"
                  />
                </div>
                <div className="relative">
                  <select
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    className="px-20 py-2.5 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm"
                  >
                    <option>All Tags</option>
                    <option>MOU</option>
                    <option>Contract</option>
                    <option>Invoice</option>
                  </select>
                </div>
              </div>
            )}

            {/* Document Tabs */}
            <div className="bg-gray-50 p-1 rounded-lg mb-6 flex w-full">
              <button
                onClick={() => setActiveTab("outgoing")}
                className={`flex-1 py-3 px-4 rounded-md text-center font-medium ${
                  isOutgoing
                    ? "text-white bg-[#FF6B35]"
                    : "text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35]"
                }`}
              >
                Outgoing Documents
              </button>
              <button
                onClick={() => setActiveTab("incoming")}
                className={`flex-1 py-3 px-4 rounded-md text-center font-medium ${
                  isIncoming
                    ? "text-white bg-[#FF6B35]"
                    : "text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35]"
                }`}
              >
                Incoming Documents
              </button>
            </div>

            {/* Stats Cards */}
            {isOutgoing ? renderOutgoingStats() : renderIncomingStats()}

            {/* Documents List */}
            {isLoading ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6 text-sm text-gray-600">
                  Loading documents...
                </div>
              </div>
            ) : isError ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6 text-sm text-red-600">
                  Failed to load documents.
                </div>
              </div>
            ) : isOutgoing ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#FF6B35]/20">
                      <th className="text-left py-4 px-6 text-black font-medium">
                        Document
                      </th>
                      <th className="text-left py-4 px-6 text-black font-medium">
                        Status
                      </th>
                      <th className="text-left py-4 px-6 text-black font-medium">
                        Action
                      </th>
                      <th className="text-center py-4 px-6 text-black font-medium">
                        View
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No documents found
                          </h3>
                          <p className="text-gray-600">
                            Try uploading a new document.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredDocuments.map((doc) => (
                        <tr
                          key={doc.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-6 px-6">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center gap-1">
                                {getDocumentIcon(doc)}
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900 text-sm mb-2">
                                  {doc.name}
                                </h3>
                                <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                                  <span>{doc.size}</span>
                                  <span>Created: {doc.created}</span>
                                  <span>{doc.event}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-600">
                                    To:
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-[#1A9D59] rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs font-medium">
                                        {doc.recipient[0]?.toUpperCase() || "D"}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-800 font-medium">
                                      {doc.recipient}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-6 align-top">
                            <span className={getStatusBadge(doc.status, false)}>
                              {doc.status === "assigned"
                                ? "draft"
                                : doc.status.charAt(0).toUpperCase() +
                                  doc.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-6 px-6 align-top">
                            <div className="flex items-center gap-3">
                              {doc.status === "uploaded" && (
                                <button className="px-6 py-1 border border-[#FF6B35] text-[#FF6B35] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                                  {isOrganizer
                                    ? "Assign Speaker"
                                    : "Assign Organizer"}
                                </button>
                              )}
                              {doc.status === "assigned" && (
                                <button
                                  onClick={() => handleSend(doc.id)}
                                  className="bg-[#FF6B35]/10 border border-[#FF6B35] text-[#FF6B35] px-6 py-1 rounded-lg text-sm font-medium hover:bg-[#FF6B35] hover:text-white transition-colors"
                                >
                                  Send
                                </button>
                              )}
                              {getActionButton(doc.status, doc.amount, false)}
                            </div>
                          </td>
                          <td className="py-6 px-6 align-top text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleView(doc.id)}
                                className="p-2 hover:scale-110 transition-transform duration-200"
                                title="View Document"
                              >
                                <Eye className="w-5 h-5 text-[#FF6B35]" />
                              </button>
                              {doc.status !== "sent" && (
                                <button
                                  onClick={() => handleDelete(doc.id)}
                                  className="p-2 hover:scale-110 transition-transform duration-200"
                                  title="Delete Document"
                                >
                                  <Trash2 className="w-5 h-5 text-red-500" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#FF6B35]/20">
                      <th className="text-left py-4 px-6 text-black font-medium">
                        Document
                      </th>
                      <th className="text-left py-4 px-6 text-black font-medium">
                        Status
                      </th>
                      <th className="text-left py-4 px-6 text-black font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-12 text-center">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No documents found
                          </h3>
                          <p className="text-gray-600">
                            No incoming documents at this time.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredDocuments.map((doc) => (
                        <tr
                          key={doc.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-6 px-6">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center gap-1">
                                {getDocumentIcon(doc)}
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900 text-sm mb-2">
                                  {doc.name}
                                </h3>
                                <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                                  <span>{doc.size}</span>
                                  <span>Created: {doc.created}</span>
                                  <span>{doc.event}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-600">
                                    Received:
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-[#1A9D59] rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs font-medium">
                                        {doc.recipient[0]?.toUpperCase() || "D"}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-800 font-medium">
                                      {doc.recipient}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-6 align-top">
                            <span className={getStatusBadge(doc.status, true)}>
                              {doc.status === "pending_review"
                                ? "Pending Review"
                                : doc.status.charAt(0).toUpperCase() +
                                  doc.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-6 px-6 align-top">
                            <div className="flex items-center gap-3">
                              {getActionButton(doc.status, doc.amount, true)}
                              <button
                                onClick={() => handleView(doc.id)}
                                className="p-2 hover:scale-110 transition-transform duration-200"
                                title="View"
                              >
                                <Eye className="w-5 h-5 text-[#FF6B35]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
