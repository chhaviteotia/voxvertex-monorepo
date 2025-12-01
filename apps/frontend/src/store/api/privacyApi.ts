import { baseApi } from './baseApi';

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'connections';
  showContactInformation: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showSocialLinks: boolean;
  showExperience: boolean;
  showEducation: boolean;
  showAwards: boolean;
}

export interface PrivacySettingsResponse {
  success: boolean;
  message: string;
  data: PrivacySettings;
}

// Inject endpoints into baseApi
export const privacyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPrivacySettings: builder.query<PrivacySettingsResponse, void>({
      query: () => '/privacy/settings',
      providesTags: ['PrivacySettings'],
    }),
    updatePrivacySettings: builder.mutation<
      PrivacySettingsResponse,
      Partial<PrivacySettings>
    >({
      query: (settings) => ({
        url: '/privacy/settings',
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: ['PrivacySettings'],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useGetPrivacySettingsQuery,
  useUpdatePrivacySettingsMutation,
} = privacyApi;

