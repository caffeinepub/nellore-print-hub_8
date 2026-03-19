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
export type Time = bigint;
export interface QuoteRequest {
    id: bigint;
    serviceType: string;
    name: string;
    attachedFile?: ExternalBlob;
    timestamp: Time;
    phoneNumber: string;
    projectDetails: string;
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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createGalleryItem(id: string, title: string, description: string, image: ExternalBlob): Promise<void>;
    deleteGalleryItem(id: string): Promise<void>;
    getAllGalleryItems(): Promise<Array<GalleryItem>>;
    getAllQuoteRequests(): Promise<Array<QuoteRequest>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGalleryItem(id: string): Promise<GalleryItem>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitQuoteRequest(serviceType: string, projectDetails: string, name: string, phoneNumber: string, attachedFile: ExternalBlob | null): Promise<void>;
    updateGalleryItem(id: string, title: string, description: string, image: ExternalBlob): Promise<void>;
}
