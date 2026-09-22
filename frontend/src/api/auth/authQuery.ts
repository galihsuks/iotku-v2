import { useMutation, useQuery } from "@tanstack/react-query";
import type { LoginPayload, SignupPayload } from "../../interfaces/auth";
import { queryKeys } from "../queryKeys";
import { authApi } from "./authApi";

export const useAuthLoginMutation = () => {
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
  });
};

export const useAuthSignupMutation = () => {
  return useMutation({
    mutationFn: (payload: SignupPayload) => authApi.signup(payload),
  });
};

export const useAuthLogoutMutation = () => {
  return useMutation({
    mutationFn: authApi.logout,
  });
};

export const useAuthMeQuery = () => {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.me,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};

export const useChangeOwnPasswordMutation = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
  });
};

export const useAuthImpersonateMutation = () => {
  return useMutation({
    mutationFn: authApi.impersonate,
  });
};
