// src/hooks/useVisitor.ts

import { useMutation } from "@tanstack/react-query";
import { createVisitor } from "../api/auth.api";

export const useVisitor = () => {
  const mutation = useMutation({
    mutationFn: createVisitor,
    onError: (error: any) => {
      console.log("Visitor API error:", error?.message);
    },
  });

  return {
    createVisitor: mutation.mutateAsync,
    loading: mutation.isPending,
  };
};