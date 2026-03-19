import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Review {
    id: bigint;
    reviewText: string;
    reviewerName: string;
    timestamp: Time;
    rating: bigint;
}
export interface SiteSettings {
    websiteDescription: string;
    tagline: string;
    websiteUrl: string;
    heroText: string;
    whatsappNumber: string;
    address: string;
    aboutText: string;
    companyName: string;
    phoneNumber: string;
}
export type Time = bigint;
export interface QuoteRequest {
    id: bigint;
    serviceType: string;
    name: string;
    isRead: boolean;
    attachedFile?: ExternalBlob;
    responseTimestamp?: Time;
    response?: string;
    timestamp: Time;
    phoneNumber: string;
    projectDetails: string;
}
export interface VisitorLog {
    name: string;
    mobileNumber: string;
    timestamp: Time;
}
export interface Service {
    id: bigint;
    title: string;
    icon: string;
    description: string;
    timestamp: Time;
}
export interface GalleryItem {
    id: string;
    title: string;
    description: string;
    image: ExternalBlob;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminAddReview(reviewerName: string, rating: bigint, reviewText: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createGalleryItem(id: string, title: string, description: string, image: ExternalBlob): Promise<void>;
    createService(title: string, description: string, icon: string): Promise<void>;
    deleteGalleryItem(id: string): Promise<void>;
    deleteQuoteRequest(id: bigint): Promise<void>;
    deleteReview(id: bigint): Promise<void>;
    deleteService(id: bigint): Promise<void>;
    getAllGalleryItems(): Promise<Array<GalleryItem>>;
    getAllQuoteRequests(): Promise<Array<QuoteRequest>>;
    getAllReviews(): Promise<Array<Review>>;
    getAllServices(): Promise<Array<Service>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGalleryItem(id: string): Promise<GalleryItem>;
    getQuoteCountByPhoneNumber(phoneNumber: string): Promise<bigint>;
    getQuoteResponseByPhoneNumber(phoneNumber: string): Promise<Array<QuoteRequest>>;
    getService(id: bigint): Promise<Service>;
    getSiteSettings(): Promise<SiteSettings>;
    getUnreadQuoteCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVisitorLogs(): Promise<Array<VisitorLog>>;
    isCallerAdmin(): Promise<boolean>;
    logVisit(name: string, mobileNumber: string): Promise<void>;
    markAllQuotesAsRead(): Promise<void>;
    respondToQuoteRequest(quoteId: bigint, response: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitQuoteRequest(serviceType: string, projectDetails: string, name: string, phoneNumber: string, attachedFile: ExternalBlob | null): Promise<void>;
    submitReview(reviewerName: string, rating: bigint, reviewText: string): Promise<void>;
    updateGalleryItem(id: string, title: string, description: string, image: ExternalBlob): Promise<void>;
    updateReview(id: bigint, reviewerName: string, rating: bigint, reviewText: string): Promise<void>;
    updateService(id: bigint, title: string, description: string, icon: string): Promise<void>;
    updateSiteSettings(settings: SiteSettings): Promise<void>;
}
