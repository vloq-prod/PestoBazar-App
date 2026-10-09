import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { submitRequestCallBack } from "../api/requestCallBack.api";
import {
  RequestCallBackPayload,
  RequestCallBackResponse,
} from "../types/requestCallBack.types";

export const useRequestCallBack = (
  options?: UseMutationOptions<
    RequestCallBackResponse,
    Error,
    RequestCallBackPayload
  >,
) => {
  return useMutation({
    mutationFn: (payload: RequestCallBackPayload) =>
      submitRequestCallBack(payload),
    ...options,
  });
};
