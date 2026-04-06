"use client";

import { useMutation } from "@tanstack/react-query";
import { connectToDatabase, disconnectFromDatabase } from "@/services/connection-service";

export function useConnect() {
  return useMutation({
    mutationFn: connectToDatabase
  });
}

export function useDisconnect() {
  return useMutation({
    mutationFn: disconnectFromDatabase
  });
}
