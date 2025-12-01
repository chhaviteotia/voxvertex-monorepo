"use client";

import { useState, useEffect, useMemo } from "react";
import { DisputeFormData, PartyInvolved } from "../types/disputeTypes";
import { Check } from "lucide-react";
import { useGetEventByIdQuery } from "@/store/api/eventApi";
import { useGetCurrentUserQuery } from "@/store/hooks";

interface PartiesInvolvedStepProps {
  formData: DisputeFormData;
  onFormDataUpdate: (data: Partial<DisputeFormData>) => void;
}

interface SelectableParty extends PartyInvolved {
  selected?: boolean;
}

type TabType = "Participants" | "Speakers" | "Organizer" | "Speaker";

export default function PartiesInvolvedStep({
  formData,
  onFormDataUpdate,
}: PartiesInvolvedStepProps) {
  const { data: currentUserData } = useGetCurrentUserQuery();
  const userRole = currentUserData?.user?.role;

  // Determine tabs based on user role
  // Organizer: "Participants" and "Speakers" tabs
  // Speaker: "Participants" and "Organizer" tabs
  // Participant: "Organizer", "Speaker", and "Participants" tabs
  const availableTabs = useMemo<TabType[]>(() => {
    if (userRole === "organizer") {
      return ["Participants", "Speakers"];
    } else if (userRole === "speaker") {
      return ["Participants", "Organizer"];
    } else if (userRole === "participant") {
      return ["Organizer", "Speaker", "Participants"];
    }
    return ["Participants", "Speakers"];
  }, [userRole]);

  const [activeTab, setActiveTab] = useState<TabType>(availableTabs[0]);
  const [organizers, setOrganizers] = useState<SelectableParty[]>([]);
  const [speakers, setSpeakers] = useState<SelectableParty[]>([]);
  const [participants, setParticipants] = useState<SelectableParty[]>([]);

  // Fetch event details
  const { data: eventData } = useGetEventByIdQuery(formData.eventId || "", {
    skip: !formData.eventId,
  });

  const selectedEvent = eventData?.data;

  // Populate organizers from selected event
  useEffect(() => {
    if (!selectedEvent?.organizer) return;

    const organizer = selectedEvent.organizer;
    const formatted: SelectableParty = {
      name:
        `${organizer.firstName || ""} ${organizer.lastName || ""}`.trim() ||
        "Unknown Organizer",
      email: organizer.email || "",
      userId: organizer._id || organizer.id,
      role: "Organizer",
      selected:
        formData.partiesInvolved?.some(
          (f) => String(f.userId) === String(organizer._id || organizer.id)
        ) || false,
    };

    setOrganizers([formatted]);
  }, [selectedEvent?.organizer?._id, formData.partiesInvolved?.length]);

  // Populate speakers from selected event
  useEffect(() => {
    if (!selectedEvent) return;

    // Combine manual speakers and platform speakers
    const allSpeakers = [
      ...(selectedEvent.speakers?.manualSpeakers || []).map((s: any) => ({
        ...s,
        speakerType: "manual",
        userId: s._id, // Use the _id from manual speaker as userId
        email: `${s.title} (Manual Speaker)`, // Show title instead of email for manual speakers
      })),
      ...(selectedEvent.speakers?.platformSpeakers || []).map((s: any) => ({
        ...s,
        speakerType: "platform",
        userId: s.speakerId, // Use speakerId from platform speaker
        name:
          s.speakerDetails?.fullName ||
          `${s.speakerDetails?.firstName || ""} ${
            s.speakerDetails?.lastName || ""
          }`.trim(),
        email:
          s.speakerDetails?.email ||
          `${
            s.speakerDetails?.professionalTitle || "Speaker"
          } (Platform Speaker)`,
      })),
    ];

    const formatted: SelectableParty[] = allSpeakers.map((s: any) => ({
      name: s.name || "Unknown Speaker",
      email: s.email || `${s.title || "Speaker"} (Event Speaker)`,
      userId: s.userId,
      role: "Speaker",
      selected:
        formData.partiesInvolved?.some(
          (f) => String(f.userId) === String(s.userId)
        ) || false,
    }));

    setSpeakers(formatted);
  }, [
    selectedEvent?._id,
    selectedEvent?.speakers?.manualSpeakers?.length,
    selectedEvent?.speakers?.platformSpeakers?.length,
    formData.partiesInvolved?.length,
  ]);

  // Populate participants - TODO: Implement when participant registration API is available
  useEffect(() => {
    // For now, participants list is empty
    // TODO: Fetch participants from event registration API when available
    setParticipants([]);
  }, [formData.eventId]);

  // Separate useEffect to restore selections from formData without causing loops
  useEffect(() => {
    if (!formData.partiesInvolved?.length) return;

    const selectedUserIds = new Set(
      formData.partiesInvolved.map((p) => String(p.userId))
    );

    setOrganizers((prev) =>
      prev.map((organizer) => ({
        ...organizer,
        selected: selectedUserIds.has(String(organizer.userId)),
      }))
    );

    setSpeakers((prev) =>
      prev.map((speaker) => ({
        ...speaker,
        selected: selectedUserIds.has(String(speaker.userId)),
      }))
    );

    setParticipants((prev) =>
      prev.map((participant) => ({
        ...participant,
        selected: selectedUserIds.has(String(participant.userId)),
      }))
    );
  }, [formData.partiesInvolved?.length]);

  // Update active tab when available tabs change
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0]);
    }
  }, [availableTabs, activeTab]);

  // Toggle selection
  const toggleSelection = (
    party: SelectableParty,
    type: "organizers" | "speakers" | "participants"
  ) => {
    if (type === "organizers") {
      setOrganizers((prev) =>
        prev.map((p) =>
          String(p.userId) === String(party.userId)
            ? { ...p, selected: !p.selected }
            : p
        )
      );
    } else if (type === "speakers") {
      setSpeakers((prev) =>
        prev.map((p) =>
          String(p.userId) === String(party.userId)
            ? { ...p, selected: !p.selected }
            : p
        )
      );
    } else {
      setParticipants((prev) =>
        prev.map((p) =>
          String(p.userId) === String(party.userId)
            ? { ...p, selected: !p.selected }
            : p
        )
      );
    }
  };

  // Merge selected parties and update form data
  useEffect(() => {
    const allSelected: PartyInvolved[] = [
      ...organizers.filter((p) => p.selected),
      ...speakers.filter((p) => p.selected),
      ...participants.filter((p) => p.selected),
    ].map(({ name, email, phone, userId, role }) => ({
      name,
      email,
      phone,
      userId,
      role,
    }));

    const respondentIds = allSelected.map((p) => p.userId);

    onFormDataUpdate({
      partiesInvolved: allSelected,
      respondentId: respondentIds,
    });
  }, [organizers, speakers, participants, onFormDataUpdate]);

  const renderPartyList = () => {
    let list: SelectableParty[] = [];
    let currentType: "organizers" | "speakers" | "participants" =
      "participants";

    if (activeTab === "Organizer") {
      list = organizers;
      currentType = "organizers";
    } else if (activeTab === "Speakers" || activeTab === "Speaker") {
      list = speakers;
      currentType = "speakers";
    } else {
      list = participants;
      currentType = "participants";
    }

    // Show empty state if no parties found
    if (list.length === 0) {
      const emptyMessage =
        activeTab === "Organizer"
          ? "No organizer found for this event"
          : activeTab === "Speakers" || activeTab === "Speaker"
          ? "No speakers found for this event"
          : "No participants found associated to this event";

      return (
        <div className="text-center py-8">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      );
    }

    return list.map((party) => (
      <div
        key={party.userId}
        onClick={() => toggleSelection(party, currentType)}
        className={`p-4 border rounded-lg cursor-pointer transition-all ${
          party.selected
            ? "border-orange-400 bg-orange-50"
            : "border-gray-200 hover:border-orange-300"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{party.name}</h4>
            <p className="text-xs text-gray-500">{party.email}</p>
          </div>
          <div
            className={`w-5 h-5 flex items-center justify-center rounded border-2 transition-colors ${
              party.selected
                ? "border-orange-500 bg-orange-500"
                : "border-gray-300 bg-white"
            }`}
          >
            {party.selected && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-orange-500 mb-2">
          Identify Parties Involved
        </h3>
        <p className="text-gray-600 mb-1">
          Select all Parties involved in this dispute
        </p>
        <p className="text-sm text-gray-500">
          Select individuals or entities that are part of this dispute
        </p>
        {selectedEvent && (
          <p className="text-xs text-gray-400 mt-2">
            Event: {selectedEvent.eventName} | Manual Speakers:{" "}
            {selectedEvent.speakers?.manualSpeakers?.length || 0} | Platform
            Speakers: {selectedEvent.speakers?.platformSpeakers?.length || 0}
          </p>
        )}
      </div>

      <div className="flex space-x-0 bg-gray-100 p-1 rounded-full">
        {availableTabs.map((tab) => (
          <button
            key={tab}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              activeTab === tab
                ? "text-white bg-orange-500"
                : "text-gray-500 bg-transparent"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3">{renderPartyList()}</div>
    </div>
  );
}
