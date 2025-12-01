import React, { useEffect, useState } from 'react';
import { Shield, Users, UserX, Calendar, CalendarX, FileText } from 'lucide-react';

interface Policy {
  // Participant Refund Policy
  participantRefund: {
    allowRefunds: boolean;
    refundDeadline: number | ''; // days before event
    refundPercentage: number | '';
    processingTime: string; // Fixed at 48 hours
    refundConditions: string[];
  };
  
  // Speaker Cancellation Policy
  speakerCancellation: {
    allowCancellation: boolean;
    cancellationDeadline: number | ''; // days before event
    partialRefundPercentage: number | '';
    requireReplacement: boolean;
    paymentTerms: string;
    speakerConditions: string[];
  };
  
  // Event Cancellation Policy
  eventCancellation: {
    allowCancellation: boolean;
    fullRefundDeadline: number | ''; // days before event
    partialRefundPercentage: number | '';
    refundMethod: string;
    processingTime: string;
    cancellationConditions: string;
  };
  
  // Event Postponement Policy
  eventPostponement: {
    allowPostponement: boolean;
    noticeRequired: number | ''; // days
    maxPostponementDuration: number | ''; // days
    partialRefundRequestDeadline: number | ''; // days
    ticketsValidForNewDate: boolean;
    offerRefundOnPostponement: boolean;
    allowSpeakersToCancelOnPostponement: boolean;
    refundPercentageOnPostponement: number | '';
    postponementConditions: string[];
  };
  
  // General Terms & Conditions
  generalTerms: string;
}

interface PoliciesStepProps {
  formData: {
    policies: Policy | null | undefined;
  };
  onFormDataUpdate: (data: { policies: Policy }) => void;
}

export default function PoliciesStep({ formData, onFormDataUpdate }: PoliciesStepProps) {
  const [activePolicy, setActivePolicy] = useState<'participant' | 'speaker' | 'event' | 'postponement' | 'general'>('participant');

  // Initialize default policies if not present - all fields start empty
  const defaultPolicies: Policy = {
    participantRefund: {
      allowRefunds: false,
      refundDeadline: '',
      refundPercentage: '',
      processingTime: '48 hours',
      refundConditions: []
    },
    speakerCancellation: {
      allowCancellation: false,
      cancellationDeadline: '',
      partialRefundPercentage: '',
      requireReplacement: false,
      paymentTerms: '',
      speakerConditions: []
    },
    eventCancellation: {
      allowCancellation: false,
      fullRefundDeadline: '',
      partialRefundPercentage: '',
      refundMethod: '',
      processingTime: '48 hours',
      cancellationConditions: 'Refunds processed to original payment method within 48 hours'
    },
    eventPostponement: {
      allowPostponement: false,
      noticeRequired: '',
      maxPostponementDuration: '',
      partialRefundRequestDeadline: '',
      ticketsValidForNewDate: false,
      offerRefundOnPostponement: false,
      allowSpeakersToCancelOnPostponement: false,
      refundPercentageOnPostponement: '',
      postponementConditions: []
    },
    generalTerms: ''
  };


  // Keep a local copy for immediate UI responsiveness
  const [localPolicies, setLocalPolicies] = useState<Policy>(formData?.policies ?? defaultPolicies);

  // If parent didn't provide policies, seed it with defaults ONCE.
  useEffect(() => {
    if (!formData?.policies) {
      onFormDataUpdate({ policies: defaultPolicies });
      setLocalPolicies(defaultPolicies);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync local state when parent formData.policies changes (useful if parent updates externally)
  useEffect(() => {
    if (formData?.policies) {
      setLocalPolicies(formData.policies);
    }
  }, [formData?.policies]);

  // Helper to update both local state and parent's form state
  const updatePolicy = (policyType: keyof Policy, field: string, value: string | number | boolean | string[]) => {
    setLocalPolicies(prev => {
      const updatedPolicies = {
        ...prev,
        [policyType]: {
          // @ts-expect-error dynamic field assignment
          ...prev[policyType],
          [field]: value
        }
      } as Policy;
      onFormDataUpdate({ policies: updatedPolicies });
      return updatedPolicies;
    });
  };

  const updateCondition = (policyType: 'participantRefund' | 'speakerCancellation' | 'eventPostponement', conditionIndex: number, value: string) => {
    let conditions: string[] = [];
    let fieldName = '';
    
    if (policyType === 'participantRefund') {
      conditions = [...localPolicies.participantRefund.refundConditions];
      fieldName = 'refundConditions';
    } else if (policyType === 'speakerCancellation') {
      conditions = [...localPolicies.speakerCancellation.speakerConditions];
      fieldName = 'speakerConditions';
    } else if (policyType === 'eventPostponement') {
      conditions = [...localPolicies.eventPostponement.postponementConditions];
      fieldName = 'postponementConditions';
    }
    
    conditions[conditionIndex] = value;
    updatePolicy(policyType, fieldName, conditions);
  };

  const addCondition = (policyType: 'participantRefund' | 'speakerCancellation' | 'eventPostponement') => {
    let conditions: string[] = [];
    let fieldName = '';
    
    if (policyType === 'participantRefund') {
      conditions = [...localPolicies.participantRefund.refundConditions];
      fieldName = 'refundConditions';
    } else if (policyType === 'speakerCancellation') {
      conditions = [...localPolicies.speakerCancellation.speakerConditions];
      fieldName = 'speakerConditions';
    } else if (policyType === 'eventPostponement') {
      conditions = [...localPolicies.eventPostponement.postponementConditions];
      fieldName = 'postponementConditions';
    }
    
    conditions.push('');
    updatePolicy(policyType, fieldName, conditions);
  };

  const removeCondition = (policyType: 'participantRefund' | 'speakerCancellation' | 'eventPostponement', conditionIndex: number) => {
    let conditions: string[] = [];
    let fieldName = '';
    
    if (policyType === 'participantRefund') {
      conditions = [...localPolicies.participantRefund.refundConditions];
      fieldName = 'refundConditions';
    } else if (policyType === 'speakerCancellation') {
      conditions = [...localPolicies.speakerCancellation.speakerConditions];
      fieldName = 'speakerConditions';
    } else if (policyType === 'eventPostponement') {
      conditions = [...localPolicies.eventPostponement.postponementConditions];
      fieldName = 'postponementConditions';
    }
    
    conditions.splice(conditionIndex, 1);
    updatePolicy(policyType, fieldName, conditions);
  };

  const policyTabs = [
    { id: 'participant', label: 'Participant Refund Policy', icon: Users },
    { id: 'speaker', label: 'Speaker Cancellation Policy', icon: UserX },
    { id: 'event', label: 'Event Cancellation Policy', icon: CalendarX },
    { id: 'postponement', label: 'Event Postponement Policy', icon: Calendar },
    { id: 'general', label: 'General Terms & Conditions', icon: FileText }
  ];

  const policies = localPolicies; // alias used throughout JSX to keep rest of code consistent

  return (
    <div className="space-y-6 p-6">
      <div className="border border-gray-300 rounded-lg bg-white">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-[#FF6B35]" />
            <label className="block text-lg font-medium text-[#FF6B35]">
              Refund & Cancellation Policies
            </label>
          </div>
          <p className="text-sm text-gray-600">
            Configure policies for refunds, cancellations, and postponements
          </p>
        </div>

        <div className="p-6">
          {/* Policy Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {policyTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePolicy(tab.id as 'participant' | 'speaker' | 'event' | 'postponement' | 'general')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activePolicy === tab.id
                      ? 'bg-[#FF6B35] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Policy Content */}
          <div className="space-y-6">
            {/* Participant Refund Policy */}
            {activePolicy === 'participant' && (
              <div className="border border-[#FF6B35] rounded-lg p-6 bg-orange-50">
                <div className="flex items-center space-x-2 mb-6">
                  <Users className="w-5 h-5 text-[#FF6B35]" />
                  <h4 className="text-base font-medium text-[#FF6B35]">Participant Refund Policy</h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="allowParticipantRefunds"
                        checked={policies.participantRefund.allowRefunds}
                        onChange={(e) => updatePolicy('participantRefund', 'allowRefunds', e.target.checked)}
                        className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                      />
                      <label htmlFor="allowParticipantRefunds" className="text-sm font-medium text-gray-900">
                        Allow participant refunds
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={policies.participantRefund.refundDeadline === '' ? '' : policies.participantRefund.refundDeadline}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value) || '';
                          updatePolicy('participantRefund', 'refundDeadline', val);
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="Enter days before event"
                        disabled={!policies.participantRefund.allowRefunds}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Refund deadline (days before event)
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={policies.participantRefund.refundPercentage === '' ? '' : policies.participantRefund.refundPercentage}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value, 10) || '';
                          updatePolicy('participantRefund', 'refundPercentage', val);
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="Enter refund percentage"
                        disabled={!policies.participantRefund.allowRefunds}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Refund percentage (%)
                      </label>
                    </div>


                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-[#FF6B35]">Refund conditions (one per line)</label>
                      {policies.participantRefund.refundConditions.length === 0 ? (
                        <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                          <p className="text-gray-400 text-sm">No conditions added yet</p>
                          <p className="text-gray-400 text-xs">Click &quot;Add Condition&quot; to add refund conditions</p>
                        </div>
                      ) : (
                        policies.participantRefund.refundConditions.map((condition, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={condition}
                              onChange={(e) => updateCondition('participantRefund', index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                              placeholder="Enter condition"
                              disabled={!policies.participantRefund.allowRefunds}
                            />
                            <button
                              type="button"
                              onClick={() => removeCondition('participantRefund', index)}
                              className="px-2 py-1 text-red-500 hover:text-red-700"
                              disabled={!policies.participantRefund.allowRefunds}
                            >
                              ×
                            </button>
                          </div>
                        ))
                      )}
                      <button
                        type="button"
                        onClick={() => addCondition('participantRefund')}
                        className="px-3 py-1 border border-[#FF6B35] text-[#FF6B35] text-sm rounded hover:bg-orange-50"
                        disabled={!policies.participantRefund.allowRefunds}
                      >
                        + Add Condition
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Automated Processing Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-blue-800 mb-1">Automated Processing:</h4>
                          <p className="text-sm text-blue-700">
                            All refunds are processed automatically within 48 hours to the original payment method. No processing fees apply.
                          </p>
                        </div>
                    </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* Speaker Cancellation Policy */}
            {activePolicy === 'speaker' && (
              <div className="border border-[#FF6B35] rounded-lg p-6 bg-orange-50">
                <div className="flex items-center space-x-2 mb-6">
                  <UserX className="w-5 h-5 text-[#FF6B35]" />
                  <h4 className="text-base font-medium text-[#FF6B35]">Speaker Cancellation Policy</h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="allowSpeakerCancellation"
                        checked={policies.speakerCancellation.allowCancellation}
                        onChange={(e) => updatePolicy('speakerCancellation', 'allowCancellation', e.target.checked)}
                        className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                      />
                      <label htmlFor="allowSpeakerCancellation" className="text-sm font-medium text-gray-900">
                        Allow speaker cancellation
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={policies.speakerCancellation.cancellationDeadline === '' ? '' : policies.speakerCancellation.cancellationDeadline}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value, 10) || '';
                          updatePolicy('speakerCancellation', 'cancellationDeadline', val);
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="Enter days before event"
                        disabled={!policies.speakerCancellation.allowCancellation}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Cancellation deadline (days before event)
                      </label>
                    </div>


                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-[#FF6B35]">Speaker conditions (one per line)</label>
                      {policies.speakerCancellation.speakerConditions.length === 0 ? (
                        <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                          <p className="text-gray-400 text-sm">No conditions added yet</p>
                          <p className="text-gray-400 text-xs">Click &quot;Add Condition&quot; to add speaker conditions</p>
                        </div>
                      ) : (
                        policies.speakerCancellation.speakerConditions.map((condition, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={condition}
                              onChange={(e) => updateCondition('speakerCancellation', index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                              placeholder="Enter condition"
                              disabled={!policies.speakerCancellation.allowCancellation}
                            />
                            <button
                              type="button"
                              onClick={() => removeCondition('speakerCancellation', index)}
                              className="px-2 py-1 text-red-500 hover:text-red-700"
                              disabled={!policies.speakerCancellation.allowCancellation}
                            >
                              ×
                            </button>
                          </div>
                        ))
                      )}
                      <button
                        type="button"
                        onClick={() => addCondition('speakerCancellation')}
                        className="px-3 py-1 border border-[#FF6B35] text-[#FF6B35] text-sm rounded hover:bg-orange-50"
                        disabled={!policies.speakerCancellation.allowCancellation}
                      >
                        + Add Condition
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="requireReplacementSpeaker"
                        checked={policies.speakerCancellation.requireReplacement}
                        onChange={(e) => updatePolicy('speakerCancellation', 'requireReplacement', e.target.checked)}
                        className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                        disabled={!policies.speakerCancellation.allowCancellation}
                      />
                      <label htmlFor="requireReplacementSpeaker" className="text-sm font-medium text-gray-900">
                        Require replacement speaker
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Event Cancellation Policy */}
            {activePolicy === 'event' && (
              <div className="border border-[#FF6B35] rounded-lg p-6 bg-orange-50">
                <div className="flex items-center space-x-2 mb-6">
                  <CalendarX className="w-5 h-5 text-[#FF6B35]" />
                  <h4 className="text-base font-medium text-[#FF6B35]">Event Cancellation Policy</h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="allowEventCancellation"
                        checked={policies.eventCancellation.allowCancellation}
                        onChange={(e) => updatePolicy('eventCancellation', 'allowCancellation', e.target.checked)}
                        className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                      />
                      <label htmlFor="allowEventCancellation" className="text-sm font-medium text-gray-900">
                        Allow event cancellation
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={policies.eventCancellation.fullRefundDeadline === '' ? '' : policies.eventCancellation.fullRefundDeadline}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value, 10) || '';
                          updatePolicy('eventCancellation', 'fullRefundDeadline', val);
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="Enter days before event"
                        disabled={!policies.eventCancellation.allowCancellation}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Full refund deadline (days before)
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={policies.eventCancellation.partialRefundPercentage === '' ? '' : policies.eventCancellation.partialRefundPercentage}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value, 10) || '';
                          updatePolicy('eventCancellation', 'partialRefundPercentage', val);
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="Enter partial refund percentage"
                        disabled={!policies.eventCancellation.allowCancellation}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Partial refund percentage (%)
                      </label>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="relative">
                      <select
                        value={policies.eventCancellation.refundMethod}
                        onChange={(e) => updatePolicy('eventCancellation', 'refundMethod', e.target.value)}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        disabled={!policies.eventCancellation.allowCancellation}
                      >
                        <option value="">Select refund method</option>
                        <option value="Original Payment Method">Original Payment Method</option>
                        <option value="Event Credit">Event Credit</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Refund method
                      </label>
                    </div>

                    {/* Automated Processing Info Box */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-red-800 mb-1">Automated Processing:</h4>
                          <p className="text-sm text-red-700">
                            All refunds are processed automatically within 48 hours. No administrative fees or processing fees apply.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Cancellation Conditions */}
                    <div className="space-y-3 mt-6">
                      <label className="block text-sm font-medium text-[#FF6B35]">Cancellation conditions (one per line)</label>
                      <textarea
                        value={policies.eventCancellation.cancellationConditions || 'Refunds processed to original payment method within 48 hours'}
                        onChange={(e) => updatePolicy('eventCancellation', 'cancellationConditions', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900 resize-none"
                        placeholder="Enter cancellation conditions..."
                        disabled={!policies.eventCancellation.allowCancellation}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Event Postponement Policy */}
            {activePolicy === 'postponement' && (
              <div className="border border-[#FF6B35] rounded-lg p-6 bg-orange-50">
                <div className="flex items-center space-x-2 mb-6">
                  <Calendar className="w-5 h-5 text-[#FF6B35]" />
                  <h4 className="text-base font-medium text-[#FF6B35]">Event Postponement Policy</h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="allowEventPostponement"
                        checked={policies.eventPostponement.allowPostponement}
                        onChange={(e) => updatePolicy('eventPostponement', 'allowPostponement', e.target.checked)}
                        className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                      />
                      <label htmlFor="allowEventPostponement" className="text-sm font-medium text-gray-900">
                        Allow event postponement
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={policies.eventPostponement.noticeRequired === '' ? '' : policies.eventPostponement.noticeRequired}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value, 10) || '';
                          updatePolicy('eventPostponement', 'noticeRequired', val);
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="Enter notice required in days"
                        disabled={!policies.eventPostponement.allowPostponement}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Notice required (days)
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={policies.eventPostponement.maxPostponementDuration === '' ? '' : policies.eventPostponement.maxPostponementDuration}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value, 10) || '';
                          updatePolicy('eventPostponement', 'maxPostponementDuration', val);
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="Enter max postponement duration"
                        disabled={!policies.eventPostponement.allowPostponement}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Max postponement duration (days)
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={policies.eventPostponement.partialRefundRequestDeadline === '' ? '' : policies.eventPostponement.partialRefundRequestDeadline}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value, 10) || '';
                          updatePolicy('eventPostponement', 'partialRefundRequestDeadline', val);
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="Enter participant refund request deadline"
                        disabled={!policies.eventPostponement.allowPostponement}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Participant refund request deadline (days)
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Participants must request refund within this timeframe after postponement announcement
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-[#FF6B35]">Postponement conditions (one per line)</label>
                      {policies.eventPostponement.postponementConditions.length === 0 ? (
                        <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                          <p className="text-gray-400 text-sm">No conditions added yet</p>
                          <p className="text-gray-400 text-xs">Click &quot;Add Condition&quot; to add postponement conditions</p>
                        </div>
                      ) : (
                        policies.eventPostponement.postponementConditions.map((condition, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={condition}
                              onChange={(e) => updateCondition('eventPostponement', index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                              placeholder="Enter condition"
                              disabled={!policies.eventPostponement.allowPostponement}
                            />
                            <button
                              type="button"
                              onClick={() => removeCondition('eventPostponement', index)}
                              className="px-2 py-1 text-red-500 hover:text-red-700"
                              disabled={!policies.eventPostponement.allowPostponement}
                            >
                              ×
                            </button>
                          </div>
                        ))
                      )}
                      <button
                        type="button"
                        onClick={() => addCondition('eventPostponement')}
                        className="px-3 py-1 border border-[#FF6B35] text-[#FF6B35] text-sm rounded hover:bg-orange-50"
                        disabled={!policies.eventPostponement.allowPostponement}
                      >
                        + Add Condition
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="ticketsValidForNewDate"
                        checked={policies.eventPostponement.ticketsValidForNewDate}
                        onChange={(e) => updatePolicy('eventPostponement', 'ticketsValidForNewDate', e.target.checked)}
                        className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                        disabled={!policies.eventPostponement.allowPostponement}
                      />
                      <label htmlFor="ticketsValidForNewDate" className="text-sm font-medium text-gray-900">
                        Tickets valid for new date
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="offerRefundOnPostponement"
                        checked={policies.eventPostponement.offerRefundOnPostponement}
                        onChange={(e) => updatePolicy('eventPostponement', 'offerRefundOnPostponement', e.target.checked)}
                        className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                        disabled={!policies.eventPostponement.allowPostponement}
                      />
                      <label htmlFor="offerRefundOnPostponement" className="text-sm font-medium text-gray-900">
                        Offer refund on postponement
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="allowSpeakersToCancelOnPostponement"
                        checked={policies.eventPostponement.allowSpeakersToCancelOnPostponement}
                        onChange={(e) => updatePolicy('eventPostponement', 'allowSpeakersToCancelOnPostponement', e.target.checked)}
                        className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                        disabled={!policies.eventPostponement.allowPostponement}
                      />
                      <label htmlFor="allowSpeakersToCancelOnPostponement" className="text-sm font-medium text-gray-900">
                        Allow speakers to cancel on postponement
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        value={policies.eventPostponement.refundPercentageOnPostponement === '' ? '' : policies.eventPostponement.refundPercentageOnPostponement}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value, 10) || '';
                          updatePolicy('eventPostponement', 'refundPercentageOnPostponement', val);
                        }}
                        className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900"
                        placeholder="Enter refund percentage"
                        disabled={!policies.eventPostponement.offerRefundOnPostponement}
                      />
                      <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                        Refund percentage on postponement (%)
                      </label>
                    </div>

                    {/* Postponement Policy Summary Box */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-6">
                      <h4 className="text-sm font-bold text-orange-800 mb-2">Postponement Policy:</h4>
                      <p className="text-sm text-orange-700">
                        Participants can request refunds within {policies.eventPostponement.partialRefundRequestDeadline || 'X'} days of postponement announcement or accept the new date. Speakers can also choose to cancel or accept the new date.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* General Terms & Conditions */}
            {activePolicy === 'general' && (
              <div className="border border-[#FF6B35] rounded-lg p-6 bg-orange-50">
                <div className="flex items-center space-x-2 mb-6">
                  <FileText className="w-5 h-5 text-[#FF6B35]" />
                  <h4 className="text-base font-medium text-[#FF6B35]">General Terms & Conditions</h4>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <textarea
                      value={policies.generalTerms}
                      onChange={(e) => {
                        const updatedPolicies = {
                          ...localPolicies,
                          generalTerms: e.target.value
                        };
                        setLocalPolicies(updatedPolicies);
                        onFormDataUpdate({ policies: updatedPolicies });
                      }}
                      rows={6}
                      className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg bg-white focus:ring-2 focus:ring-[#FF6B35] text-gray-900 resize-none"
                      placeholder="Enter additional terms and conditions..."
                    />
                    <label className="absolute -top-2 left-3 bg-orange-50 px-1 text-xs font-medium text-[#FF6B35]">
                      Additional terms and conditions
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}