// src/hooks/useVisitor.ts

import { useMutation } from "@tanstack/react-query";
import { createVisitor } from "../api/auth.api";

export const useVisitor = () => {
  const mutation = useMutation({
    mutationFn: createVisitor,
   
  });

  return {
    createVisitor: mutation.mutateAsync,
    loading: mutation.isPending,
  };
};