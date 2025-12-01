import { Calendar, X, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface TicketingStepProps {
  formData: {
    ticketTypes: Array<{
      name: string;
      price: string;
      quantity: string;
      features?: string[];
      discount?: {
        enabled: boolean;
        name: string;
        type: "percentage" | "fixed";
        value: string;
        maxUses: string;
        startDate: string;
        endDate: string;
        code: string;
        description: string;
      };
    }>;
  };
  onFormDataUpdate: (data: {
    ticketTypes: Array<{
      name: string;
      price: string;
      quantity: string;
      features?: string[];
      discount?: {
        enabled: boolean;
        name: string;
        type: "percentage" | "fixed";
        value: string;
        maxUses: string;
        startDate: string;
        endDate: string;
        code: string;
        description: string;
      };
    }>;
  }) => void;
}

export default function TicketingStep({
  formData,
  onFormDataUpdate,
}: TicketingStepProps) {
  const [newFeatureText, setNewFeatureText] = useState("");
  const [showFeatureInput, setShowFeatureInput] = useState<{
    [key: number]: boolean;
  }>({});
  const [hasInitialized, setHasInitialized] = useState(false);

  const ticketCount = formData.ticketTypes?.length || 0;
  const isCompressed = ticketCount > 1;

  // Debug logging
  console.log("🎫 TicketingStep render:", {
    formData,
    ticketTypes: formData.ticketTypes,
    ticketCount,
    isCompressed,
  });

  // Add a default ticket if none exist - only on initial load
  useEffect(() => {
    if (
      !hasInitialized &&
      (!formData.ticketTypes || formData.ticketTypes.length === 0)
    ) {
      console.log("🎫 No tickets found, adding default ticket");
      const defaultTicket = {
        name: "",
        price: "",
        quantity: "",
        features: [],
        discount: {
          enabled: false,
          name: "",
          type: "percentage" as const,
          value: "",
          maxUses: "",
          startDate: "",
          endDate: "",
          code: "",
          description: "",
        },
      };
      onFormDataUpdate({
        ticketTypes: [defaultTicket],
      });
      setHasInitialized(true);
    }
  }, [hasInitialized, formData.ticketTypes, onFormDataUpdate]);

  const addTicketTier = () => {
    const currentTickets = formData.ticketTypes || [];
    const newTicket = {
      name: "",
      price: "",
      quantity: "",
      features: [],
      discount: {
        enabled: false,
        name: "",
        type: "percentage" as const,
        value: "",
        maxUses: "",
        startDate: "",
        endDate: "",
        code: "",
        description: "",
      },
    };
    onFormDataUpdate({
      ticketTypes: [newTicket, ...currentTickets],
    });
  };

  const removeTicketTier = (index: number) => {
    const currentTickets = formData.ticketTypes || [];
    onFormDataUpdate({
      ticketTypes: currentTickets.filter((_, i) => i !== index),
    });
  };

  const updateTicketTier = (
    index: number,
    field: string,
    value: string | number | boolean
  ) => {
    console.log("🔍 updateTicketTier called:", { index, field, value });
    const currentTickets = formData.ticketTypes || [];

    if (index >= currentTickets.length) {
      console.error("❌ Invalid ticket index:", index);
      return;
    }

    const newTickets = currentTickets.map((ticket, i) => {
      if (i !== index) return ticket;

      if (field.includes("discount.")) {
        const discountField = field.split(".")[1];
        const updatedDiscount = {
          enabled: ticket.discount?.enabled || false,
          name: ticket.discount?.name || "",
          type: (ticket.discount?.type || "percentage") as
            | "percentage"
            | "fixed",
          value: ticket.discount?.value || "0",
          maxUses: ticket.discount?.maxUses || "50",
          startDate: ticket.discount?.startDate || "",
          endDate: ticket.discount?.endDate || "",
          code: ticket.discount?.code || "",
          description: ticket.discount?.description || "",
          [discountField]: value,
        };
        return {
          ...ticket,
          discount: updatedDiscount,
        };
      } else {
        return {
          ...ticket,
          [field]: value,
        };
      }
    });

    console.log("📋 New tickets after update:", newTickets);
    onFormDataUpdate({ ticketTypes: newTickets });
    console.log("✅ onFormDataUpdate called");
  };

  const addFeature = (ticketIndex: number, featureText?: string) => {
    const textToAdd = featureText || newFeatureText;
    if (!textToAdd.trim()) return;

    const currentTickets = formData.ticketTypes || [];
    const newTickets = currentTickets.map((ticket, index) => {
      if (index !== ticketIndex) return ticket;

      const updatedFeatures = [...(ticket.features || []), textToAdd];
      return {
        ...ticket,
        features: updatedFeatures,
      };
    });

    onFormDataUpdate({ ticketTypes: newTickets });
    setNewFeatureText("");
    setShowFeatureInput((prev) => ({ ...prev, [ticketIndex]: false }));
  };

  const removeFeature = (ticketIndex: number, featureIndex: number) => {
    const currentTickets = formData.ticketTypes || [];
    const newTickets = currentTickets.map((ticket, index) => {
      if (index !== ticketIndex) return ticket;

      const updatedFeatures = (ticket.features || []).filter(
        (_, i) => i !== featureIndex
      );
      return {
        ...ticket,
        features: updatedFeatures,
      };
    });

    onFormDataUpdate({ ticketTypes: newTickets });
  };

  const calculateDiscountedPrice = (
    price: string,
    discountType: string,
    discountValue: string
  ) => {
    const originalPrice = parseFloat(price) || 0;
    const discount = parseFloat(discountValue) || 0;

    if (discountType === "percentage") {
      return (originalPrice * (1 - discount / 100)).toFixed(2);
    } else {
      return (originalPrice - discount).toFixed(2);
    }
  };

  const generateDiscountCode = (ticketIndex: number) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    updateTicketTier(ticketIndex, "discount.code", result);
  };

  const toggleFeatureInput = (ticketIndex: number) => {
    setShowFeatureInput((prev) => ({
      ...prev,
      [ticketIndex]: !prev[ticketIndex],
    }));
  };

  return (
    <div className="space-y-6 pl-3 pr-3">
      <div className="border border-gray-300 rounded-lg bg-white">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <label className="block text-md font-medium text-[#FF6B35]">
            Ticket Tiers
          </label>
          <button
            type="button"
            onClick={addTicketTier}
            className="text-[#FF6B35] border-2 border-[#FF6B35] rounded-lg px-4 py-1 text-sm font-medium hover:text-orange-600 flex items-center space-x-1"
          >
            <span>+ Add Ticket Tier</span>
          </button>
        </div>

        <div className="p-6">
          {(!formData.ticketTypes || formData.ticketTypes.length === 0) && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No ticket tiers added yet</p>
                <p className="text-sm">
                  Click &quot;Add Ticket Tier&quot; to create your first ticket
                  type
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {formData.ticketTypes?.map((ticket, index) => (
              <div
                key={index}
                className="border border-[#FF6B35] rounded-lg p-6 bg-orange-50"
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-medium text-[#FF6B35] bg-orange-50">
                    Ticket Tier {formData.ticketTypes?.length - index}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeTicketTier(index)}
                    className="w-8 h-8 bg-orange-50 rounded text-red-500 flex items-center justify-center hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={ticket.name || ""}
                      onChange={(e) => {
                        console.log("📝 Ticket name onChange:", {
                          index,
                          value: e.target.value,
                          currentValue: ticket.name,
                        });
                        updateTicketTier(index, "name", e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-gray-900 placeholder-gray-400"
                      placeholder="Eg. Early Bird"
                    />
                    <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                      Ticket Name *
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={ticket.price || ""}
                      onChange={(e) => {
                        console.log("💰 Ticket price onChange:", {
                          index,
                          value: e.target.value,
                          currentValue: ticket.price,
                        });
                        updateTicketTier(index, "price", e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-gray-900 placeholder-gray-400"
                      placeholder="0"
                    />
                    <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                      Price(₹) *
                    </label>
                  </div>

                  <div className="relative">
                    <div className="relative">
                      <input
                        type="number"
                        value={ticket.quantity}
                        onChange={(e) =>
                          updateTicketTier(index, "quantity", e.target.value)
                        }
                        className="w-full px-3 py-2 pr-3 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-gray-900 placeholder-gray-400"
                        placeholder="50"
                      />
                    </div>
                    <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                      Quantity *
                    </label>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-[#FF6B35]">
                      What&apos;s Included
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleFeatureInput(index)}
                      className="px-3 py-1 border border-[#FF6B35] text-[#FF6B35] text-sm rounded hover:bg-orange-50"
                    >
                      + Add Feature
                    </button>
                  </div>

                  {showFeatureInput[index] && (
                    <div className="mb-4 relative">
                      <input
                        type="text"
                        value={newFeatureText}
                        onChange={(e) => setNewFeatureText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            addFeature(index);
                          }
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-gray-900 placeholder-gray-400"
                        placeholder="Eg. VIP Seating, Meet & greet with speakers"
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => addFeature(index)}
                          className="px-3 py-1 bg-[#FF6B35] text-white text-sm rounded hover:bg-[#e55a2b]"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleFeatureInput(index)}
                          className="px-3 py-1 border border-gray-300 text-gray-600 text-sm rounded hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 mb-4">
                    {ticket.features?.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center space-x-3"
                      >
                        <div className="w-5 h-5 bg-orange-50 rounded-full text-green-500 flex items-center justify-center text-xs flex-shrink-0">
                          ✓
                        </div>
                        <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-[#FF6B35] flex-1">
                          <span className="text-sm text-gray-700">
                            {feature}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFeature(index, featureIndex)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {(!ticket.features || ticket.features.length === 0) &&
                    !showFeatureInput[index] && (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-white">
                        <p className="text-gray-400 mb-1">
                          No features added yet
                        </p>
                        <p className="text-gray-400 text-sm">
                          Click &quot;Add Feature&quot; to add ticket features
                        </p>
                      </div>
                    )}
                </div>

                <div className="border-t border-orange-200 pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <label className="block text-sm font-medium text-[#FF6B35]">
                      Discount
                    </label>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-3">
                        Enabled
                      </span>
                      <div
                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                          ticket.discount?.enabled
                            ? "bg-[#FF6B35]"
                            : "bg-gray-300"
                        }`}
                        onClick={() =>
                          updateTicketTier(
                            index,
                            "discount.enabled",
                            !(ticket.discount?.enabled || false)
                          )
                        }
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            ticket.discount?.enabled
                              ? "translate-x-6"
                              : "translate-x-0"
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {ticket.discount?.enabled && (
                    <div className="space-y-6 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <input
                            type="text"
                            value={ticket.discount?.name || ""}
                            onChange={(e) =>
                              updateTicketTier(
                                index,
                                "discount.name",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-1.5 border border-[#FF6B35] rounded bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900 placeholder-gray-400"
                            placeholder="Name"
                          />
                          <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                            Discount name*
                          </label>
                        </div>
                        <div className="relative">
                          <select
                            value={ticket.discount?.type || "percentage"}
                            onChange={(e) =>
                              updateTicketTier(
                                index,
                                "discount.type",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-1.5 border border-[#FF6B35] rounded bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                          >
                            <option value="percentage">percentage (%)</option>
                            <option value="fixed">fixed</option>
                          </select>
                          <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                            Discount Type*
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <div className="relative">
                            <input
                              type="number"
                              value={ticket.discount?.value || ""}
                              onChange={(e) =>
                                updateTicketTier(
                                  index,
                                  "discount.value",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-1.5 pr-3 border border-[#FF6B35] rounded bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900 placeholder-gray-400"
                              placeholder="0"
                            />
                          </div>
                          <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                            Discount Value*
                          </label>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            value={ticket.discount?.maxUses || ""}
                            onChange={(e) =>
                              updateTicketTier(
                                index,
                                "discount.maxUses",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-1.5 border border-[#FF6B35] rounded bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900 placeholder-gray-400"
                            placeholder="50"
                          />
                          <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                            Max Uses(Optional)
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <div className="relative">
                            <input
                              type="date"
                              value={ticket.discount?.startDate || ""}
                              onChange={(e) =>
                                updateTicketTier(
                                  index,
                                  "discount.startDate",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-1.5 pr-3 border border-[#FF6B35] rounded bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900 placeholder-gray-400"
                              placeholder="dd-MM-YY"
                            />
                          </div>
                          <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                            Start Date*
                          </label>
                        </div>
                        <div className="relative">
                          <div className="relative">
                            <input
                              type="date"
                              value={ticket.discount?.endDate || ""}
                              onChange={(e) =>
                                updateTicketTier(
                                  index,
                                  "discount.endDate",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-1.5 pr-3 border border-[#FF6B35] rounded bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900 placeholder-gray-400"
                              placeholder="dd-MM-YY"
                            />
                          </div>
                          <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                            End Date*
                          </label>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={ticket.discount?.code || ""}
                            onChange={(e) =>
                              updateTicketTier(
                                index,
                                "discount.code",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-1.5 border border-[#FF6B35] rounded bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900 placeholder-gray-400"
                            placeholder="sdghjkl"
                          />
                          <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                            Discount code*
                          </label>
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => generateDiscountCode(index)}
                            className="px-7 py-1 bg-orange-50 border-2 border-[#FF6B35] text-[#FF6B35] rounded-lg hover:bg-orange-100 transition-colors whitespace-nowrap"
                          >
                            Generate
                          </button>
                        </div>
                      </div>

                      <div className="relative">
                        <textarea
                          value={ticket.discount?.description || ""}
                          onChange={(e) =>
                            updateTicketTier(
                              index,
                              "discount.description",
                              e.target.value
                            )
                          }
                          rows={4}
                          className="w-full px-3 py-2 border border-[#FF6B35] rounded bg-white focus:ring-2 focus:ring-[#FF6B35] resize-none text-gray-900 placeholder-gray-400"
                          placeholder="Add a description for this discount..."
                        />
                        <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                          Description
                        </label>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-[#FF6B35]">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Price Preview:
                          </span>
                          <div className="text-right">
                            <span className="text-lg font-semibold text-gray-900">
                              ₹
                              {calculateDiscountedPrice(
                                ticket.price,
                                ticket.discount?.type || "percentage",
                                ticket.discount?.value || "0"
                              )}
                            </span>
                            {parseFloat(ticket.discount?.value || "0") > 0 && (
                              <div className="text-sm text-gray-500">
                                <span className="line-through">
                                  ₹{ticket.price}
                                </span>
                                <span className="ml-2 text-green-600">
                                  Save{" "}
                                  {ticket.discount?.type === "percentage"
                                    ? `${ticket.discount?.value}%`
                                    : `₹${ticket.discount?.value}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
