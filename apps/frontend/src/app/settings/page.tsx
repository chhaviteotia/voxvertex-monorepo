"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  User,
  Bell,
  Shield,
  Download,
  AlertTriangle,
  X,
  Check,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { useDeleteAccountMutation } from "@/store/api/accountApi";
import { useAuth } from "@/store/hooks";
import { useRouter } from "next/navigation";
import {
  useGetPrivacySettingsQuery,
  useUpdatePrivacySettingsMutation,
} from "@/store/api/privacyApi";

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [deleteAccount, { isLoading: isDeletingAccount }] =
    useDeleteAccountMutation();

  // Fetch privacy settings from API
  const { data: privacySettingsResponse, isLoading: isLoadingSettings } =
    useGetPrivacySettingsQuery(undefined, {
      skip: false,
    });
  const privacySettings = privacySettingsResponse?.data;
  const [updatePrivacySettings, { isLoading: isUpdatingSettings }] =
    useUpdatePrivacySettingsMutation();

  // Modal states (declare first to avoid hoisting issues)
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    setting: "",
    description: "",
    warning: "",
    action: "",
    icon: null as any,
    isEnabling: false,
  });
  const [pendingToggleKey, setPendingToggleKey] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [settings, setSettings] = useState({
    // Account Settings
    profileVisibility: privacySettings?.profileVisibility === "public" || false,
    showContactInfo: privacySettings?.showContactInformation || false,

    // Notification Preferences
    emailNotifications: privacySettings?.showEmail || false,
    pushNotifications: privacySettings?.showPhone || false,
    marketingCommunications: privacySettings?.showLocation || false,

    // Privacy & Security
    twoFactorAuth: false,
    dataProcessingConsent: true,
  });

  // Track if we've initialized settings from API
  const [isInitialized, setIsInitialized] = useState(false);

  // Update settings when API data changes (only on initial load)
  useEffect(() => {
    if (privacySettings && !isInitialized) {
      setSettings({
        profileVisibility: privacySettings.profileVisibility === "public",
        showContactInfo: privacySettings.showContactInformation,
        emailNotifications: privacySettings.showEmail,
        pushNotifications: privacySettings.showPhone,
        marketingCommunications: privacySettings.showLocation,
        twoFactorAuth: false,
        dataProcessingConsent: true,
      });
      setIsInitialized(true);
    }
  }, [privacySettings, isInitialized]);

  const handleToggle = (key: string) => {
    // Don't allow toggling if modal is already open or if we're updating
    if (showModal || isUpdating) return;

    const currentValue = settings[key as keyof typeof settings];
    const newValue = !currentValue;
    const isEnabling = newValue;

    // Define modal configurations for each setting
    const modalConfigs = {
      profileVisibility: {
        enable: {
          title: "Enable Profile Visibility",
          setting: "Profile Visibility",
          description: "Make your profile visible to other users",
          warning: "This will make your profile visible to other users.",
          action: "Enable",
          icon: <User className="w-5 h-5 text-orange-500" />,
        },
        disable: {
          title: "Disable Profile Visibility",
          setting: "Profile Visibility",
          description: "Make your profile visible to other users",
          warning: "Your profile will be hidden from other users.",
          action: "Disable",
          icon: <User className="w-5 h-5 text-orange-500" />,
        },
      },
      showContactInfo: {
        enable: {
          title: "Enable Show Contact Information",
          setting: "Show Contact Information",
          description: "Display your contact details on your public profile",
          warning: "This will make your information visible to other users.",
          action: "Enable",
          icon: <User className="w-5 h-5 text-orange-500" />,
        },
        disable: {
          title: "Disable Show Contact Information",
          setting: "Show Contact Information",
          description: "Display your contact details on your public profile",
          warning:
            "Your contact information will be hidden from your public profile.",
          action: "Disable",
          icon: <User className="w-5 h-5 text-orange-500" />,
        },
      },
      emailNotifications: {
        enable: {
          title: "Enable Email Notifications",
          setting: "Email Notifications",
          description: "Receive important updates via email",
          warning: "You will receive important updates via email.",
          action: "Enable",
          icon: <Bell className="w-5 h-5 text-orange-500" />,
        },
        disable: {
          title: "Disable Email Notifications",
          setting: "Email Notifications",
          description: "Receive important updates via email",
          warning: "You may miss important updates and communications.",
          action: "Disable",
          icon: <Bell className="w-5 h-5 text-orange-500" />,
        },
      },
      pushNotifications: {
        enable: {
          title: "Enable Push Notifications",
          setting: "Push Notifications",
          description: "Get real-time notifications on your devices",
          warning: "You will receive real-time notifications on your devices.",
          action: "Enable",
          icon: <Bell className="w-5 h-5 text-orange-500" />,
        },
        disable: {
          title: "Disable Push Notifications",
          setting: "Push Notifications",
          description: "Get real-time notifications on your devices",
          warning: "You may miss real-time notifications.",
          action: "Disable",
          icon: <Bell className="w-5 h-5 text-orange-500" />,
        },
      },
      marketingCommunications: {
        enable: {
          title: "Enable Marketing Communications",
          setting: "Marketing Communications",
          description: "Receive promotional content and updates",
          warning: "You will receive promotional content and updates.",
          action: "Enable",
          icon: <Bell className="w-5 h-5 text-orange-500" />,
        },
        disable: {
          title: "Disable Marketing Communications",
          setting: "Marketing Communications",
          description: "Receive promotional content and updates",
          warning: "You may miss important updates and communications.",
          action: "Disable",
          icon: <Bell className="w-5 h-5 text-orange-500" />,
        },
      },
      twoFactorAuth: {
        enable: {
          title: "Enable Two-Factor Authentication",
          setting: "Two-Factor Authentication",
          description: "Add an extra layer of security to your account",
          warning: "This will add an extra layer of security to your account.",
          action: "Enable",
          icon: <Shield className="w-5 h-5 text-orange-500" />,
        },
        disable: {
          title: "Disable Two-Factor Authentication",
          setting: "Two-Factor Authentication",
          description: "Add an extra layer of security to your account",
          warning:
            "Disabling this security feature may make your account more vulnerable.",
          action: "Disable",
          icon: <Shield className="w-5 h-5 text-orange-500" />,
        },
      },
      dataProcessingConsent: {
        enable: {
          title: "Enable Data Processing Consent",
          setting: "Data Processing Consent",
          description: "Allow processing of your data for service improvement",
          warning:
            "This will allow processing of your data for service improvement.",
          action: "Enable",
          icon: <Shield className="w-5 h-5 text-orange-500" />,
        },
        disable: {
          title: "Disable Data Processing Consent",
          setting: "Data Processing Consent",
          description: "Allow processing of your data for service improvement",
          warning: "This may limit our ability to improve our services.",
          action: "Disable",
          icon: <Shield className="w-5 h-5 text-orange-500" />,
        },
      },
    };

    // Get the appropriate modal configuration
    const config = modalConfigs[key as keyof typeof modalConfigs];
    if (config) {
      const modalData = isEnabling ? config.enable : config.disable;
      setModalConfig({
        ...modalData,
        isEnabling,
      });
      setPendingToggleKey(key);
      setShowModal(true);
    } else {
      // For settings without modals, toggle directly
      setSettings((prev) => ({
        ...prev,
        [key]: newValue,
      }));
    }
  };

  const handleConfirmToggle = async () => {
    if (!pendingToggleKey) return;

    setIsUpdating(true);
    const currentValue = settings[pendingToggleKey as keyof typeof settings];
    const newValue = !currentValue;

    console.log(
      "🔄 Toggling:",
      pendingToggleKey,
      "from",
      currentValue,
      "to",
      newValue
    );

    try {
      const updateData: any = {};

      switch (pendingToggleKey) {
        case "profileVisibility":
          updateData.profileVisibility = newValue ? "public" : "private";
          break;
        case "showContactInfo":
          updateData.showContactInformation = newValue;
          break;
        case "emailNotifications":
          updateData.showEmail = newValue;
          break;
        case "pushNotifications":
          updateData.showPhone = newValue;
          break;
        case "marketingCommunications":
          updateData.showLocation = newValue;
          break;
      }

      console.log("📤 Sending API update:", updateData);

      // Make the API call
      const result = await updatePrivacySettings(updateData).unwrap();
      console.log("📥 API Response:", result);

      // Update local state only after successful API call
      setSettings((prev) => {
        const newSettings = {
          ...prev,
          [pendingToggleKey]: newValue,
        };
        console.log("✅ Updated local state:", newSettings);
        return newSettings;
      });

      console.log("✅ Setting updated successfully");
      alert(
        `${pendingToggleKey} has been ${
          newValue ? "enabled" : "disabled"
        } successfully!`
      );
    } catch (error) {
      console.error("❌ Failed to update setting:", error);
      alert("Failed to update setting. Please try again.");
    } finally {
      setIsUpdating(false);
      setShowModal(false);
      setPendingToggleKey(null);
    }
  };

  const handleCancelToggle = () => {
    setShowModal(false);
    setPendingToggleKey(null);
    setIsUpdating(false);
  };

  const handleExportData = () => {
    // TODO: Implement data export functionality
    alert("Data export functionality will be implemented soon!");
  };

  const handleDeleteAccount = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data."
    );

    if (!confirmed) return;

    // Show second confirmation for extra safety
    const doubleConfirmed = window.confirm(
      "This is your final warning. Your account and all associated data will be permanently deleted. Are you absolutely sure?"
    );

    if (!doubleConfirmed) return;

    try {
      // Call the delete account API
      await deleteAccount().unwrap();

      // Show success message
      alert(
        "Your account has been successfully deleted. You will be redirected to the homepage."
      );

      // Logout the user and redirect to homepage
      await logout();
      router.push("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      alert(
        error?.data?.message ||
          "Failed to delete account. Please try again or contact support if the problem persists."
      );
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader />
      <Sidebar />
      <div className="ml-0 sm:ml-[18rem] md:ml-[19.5rem] lg:ml-[21.5rem] mr-0 sm:mr-[2.5rem] md:mr-[3rem] lg:mr-[3.5rem]">
        <div className="mb-8 mt-20 pt-20">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-[#FF6B35] rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-600">
            Manage your account preferences and privacy settings
          </p>
        </div>

        {/* Account Settings Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-[#FF6B35] rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Account Settings
              </h2>
              <p className="text-sm text-gray-600">
                Manage your account information and preferences
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Profile Visibility */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  Profile Visibility
                </h3>
                <p className="text-sm text-gray-600">
                  Make your profile visible to other users
                </p>
              </div>
              <button
                onClick={() => handleToggle("profileVisibility")}
                disabled={isUpdating}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.profileVisibility ? "bg-gray-900" : "bg-gray-200"
                } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.profileVisibility
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Show Contact Information */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  Show Contact Information
                </h3>
                <p className="text-sm text-gray-600">
                  Display your contact details on your public profile
                </p>
              </div>
              <button
                onClick={() => handleToggle("showContactInfo")}
                disabled={isUpdating}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.showContactInfo ? "bg-gray-900" : "bg-gray-200"
                } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showContactInfo ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Preferences Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-[#FF6B35] rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Notification Preferences
              </h2>
              <p className="text-sm text-gray-600">
                Control how and when you receive notifications
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  Email Notifications
                </h3>
                <p className="text-sm text-gray-600">
                  Receive important updates via email
                </p>
              </div>
              <button
                onClick={() => handleToggle("emailNotifications")}
                disabled={isUpdating}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications ? "bg-gray-900" : "bg-gray-200"
                } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailNotifications
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  Push Notifications
                </h3>
                <p className="text-sm text-gray-600">
                  Get real-time notifications on your devices
                </p>
              </div>
              <button
                onClick={() => handleToggle("pushNotifications")}
                disabled={isUpdating}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.pushNotifications ? "bg-gray-900" : "bg-gray-200"
                } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.pushNotifications
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Marketing Communications */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  Marketing Communications
                </h3>
                <p className="text-sm text-gray-600">
                  Receive promotional content and updates
                </p>
              </div>
              <button
                onClick={() => handleToggle("marketingCommunications")}
                disabled={isUpdating}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.marketingCommunications
                    ? "bg-gray-900"
                    : "bg-gray-200"
                } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.marketingCommunications
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy & Security Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-[#FF6B35] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Privacy & Security
              </h2>
              <p className="text-sm text-gray-600">
                Manage your privacy settings and security options
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  Two-Factor Authentication
                </h3>
                <p className="text-sm text-gray-600">
                  Add an extra layer of security to your account
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    settings.twoFactorAuth
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {settings.twoFactorAuth ? "Enabled" : "Disabled"}
                </span>
                <button
                  onClick={() => handleToggle("twoFactorAuth")}
                  disabled={isUpdating}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.twoFactorAuth ? "bg-gray-900" : "bg-gray-200"
                  } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.twoFactorAuth ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Data Processing Consent */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  Data Processing Consent
                </h3>
                <p className="text-sm text-gray-600">
                  Allow processing of your data for service improvement
                </p>
              </div>
              <button
                onClick={() => handleToggle("dataProcessingConsent")}
                disabled={isUpdating}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.dataProcessingConsent ? "bg-gray-900" : "bg-gray-200"
                } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.dataProcessingConsent
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-[#FF6B35] rounded-lg flex items-center justify-center">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Data Management
              </h2>
              <p className="text-sm text-gray-600">
                Export, backup, or delete your data
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Export Data */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Export Data</h3>
                <p className="text-sm text-gray-600">
                  Download a copy of all your data
                </p>
              </div>
              <button
                onClick={handleExportData}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Export
              </button>
            </div>

            {/* Delete Account */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900">Delete Account</h3>
                  <AlertTriangle className="w-4 h-4 text-[#FF6B35]" />
                </div>
                <p className="text-sm text-gray-600">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDeletingAccount
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                } text-white`}
              >
                {isDeletingAccount ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-6 border-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                {modalConfig.icon}
                <span className="ml-2">{modalConfig.title}</span>
              </h3>
              <button
                onClick={handleCancelToggle}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-700 mb-4">
              Are you sure you want to{" "}
              {modalConfig.isEnabling ? "enable" : "disable"} this setting?
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
              <p className="font-medium text-gray-800">
                {modalConfig.setting}: {modalConfig.description}
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-md flex items-center mb-4">
              <AlertTriangle size={20} className="mr-3" />
              <span>{modalConfig.warning}</span>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              You can {modalConfig.isEnabling ? "disable" : "re-enable"} this
              setting at any time from your preferences.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelToggle}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmToggle}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                  modalConfig.isEnabling
                    ? "bg-gray-800 text-white hover:bg-gray-900"
                    : "bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90"
                }`}
              >
                {modalConfig.isEnabling ? (
                  <Check size={16} className="mr-2" />
                ) : (
                  <X size={16} className="mr-2" />
                )}
                {modalConfig.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
