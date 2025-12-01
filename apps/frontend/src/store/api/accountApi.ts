import { baseApi } from './baseApi';

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

export const accountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    deleteAccount: builder.mutation<DeleteAccountResponse, void>({
      query: () => ({
        url: '/auth/account',
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'Account'],
    }),
  }),
  overrideExisting: false,
});

export const { useDeleteAccountMutation } = accountApi;

