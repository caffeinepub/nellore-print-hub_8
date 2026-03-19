import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ExternalBlob,
  GalleryItem,
  QuoteRequest,
  Review,
  Service,
  SiteSettings,
  VisitorLog,
} from "../backend";
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

export function useGetUnreadQuoteCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["unreadQuoteCount"],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getUnreadQuoteCount();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useMarkAllQuotesAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.markAllQuotesAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unreadQuoteCount"] });
      queryClient.invalidateQueries({ queryKey: ["quoteRequests"] });
    },
  });
}

export function useRespondToQuoteRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      quoteId,
      response,
    }: { quoteId: bigint; response: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.respondToQuoteRequest(quoteId, response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quoteRequests"] });
      queryClient.invalidateQueries({ queryKey: ["unreadQuoteCount"] });
    },
  });
}

export function useGetQuoteResponseByPhone(phoneNumber: string) {
  const { actor, isFetching } = useActor();
  return useQuery<QuoteRequest[]>({
    queryKey: ["quoteResponseByPhone", phoneNumber],
    queryFn: async () => {
      if (!actor || !phoneNumber) return [];
      return actor.getQuoteResponseByPhoneNumber(phoneNumber);
    },
    enabled: !!actor && !isFetching && !!phoneNumber,
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

export function useGetAllReviews() {
  const { actor, isFetching } = useActor();
  return useQuery<Review[]>({
    queryKey: ["reviews"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReviews();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reviewerName,
      rating,
      reviewText,
    }: {
      reviewerName: string;
      rating: bigint;
      reviewText: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitReview(reviewerName, rating, reviewText);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useAdminAddReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reviewerName,
      rating,
      reviewText,
    }: {
      reviewerName: string;
      rating: bigint;
      reviewText: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminAddReview(reviewerName, rating, reviewText);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useUpdateReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      reviewerName,
      rating,
      reviewText,
    }: {
      id: bigint;
      reviewerName: string;
      rating: bigint;
      reviewText: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateReview(id, reviewerName, rating, reviewText);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useDeleteReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteReview(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useGetSiteSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<SiteSettings>({
    queryKey: ["siteSettings"],
    queryFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.getSiteSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateSiteSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: SiteSettings) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateSiteSettings(settings);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["siteSettings"] }),
  });
}

export function useGetAllServices() {
  const { actor, isFetching } = useActor();
  return useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllServices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      icon,
    }: {
      title: string;
      description: string;
      icon: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createService(title, description, icon);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useUpdateService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      icon,
    }: {
      id: bigint;
      title: string;
      description: string;
      icon: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateService(id, title, description, icon);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useDeleteService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteService(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useLogVisit() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      name,
      mobileNumber,
    }: { name: string; mobileNumber: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.logVisit(name, mobileNumber);
    },
  });
}

export function useGetVisitorLogs() {
  const { actor, isFetching } = useActor();
  return useQuery<VisitorLog[]>({
    queryKey: ["visitorLogs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVisitorLogs();
    },
    enabled: !!actor && !isFetching,
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
