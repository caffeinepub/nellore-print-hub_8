import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ExternalBlob, GalleryItem, QuoteRequest } from "../backend";
import { useActor } from "./useActor";

export function useGetAllGalleryItems() {
  const { actor, isFetching } = useActor();
  return useQuery<GalleryItem[]>({
    queryKey: ["galleryItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllGalleryItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllQuoteRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<QuoteRequest[]>({
    queryKey: ["quoteRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllQuoteRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitQuoteRequest() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      serviceType,
      projectDetails,
      name,
      phoneNumber,
      attachedFile,
    }: {
      serviceType: string;
      projectDetails: string;
      name: string;
      phoneNumber: string;
      attachedFile: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitQuoteRequest(
        serviceType,
        projectDetails,
        name,
        phoneNumber,
        attachedFile,
      );
    },
  });
}

export function useCreateGalleryItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      image,
    }: {
      id: string;
      title: string;
      description: string;
      image: ExternalBlob;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createGalleryItem(id, title, description, image);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["galleryItems"] }),
  });
}

export function useUpdateGalleryItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      image,
    }: {
      id: string;
      title: string;
      description: string;
      image: ExternalBlob;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateGalleryItem(id, title, description, image);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["galleryItems"] }),
  });
}

export function useDeleteGalleryItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteGalleryItem(id);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["galleryItems"] }),
  });
}
