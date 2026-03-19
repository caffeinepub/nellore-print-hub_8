import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  include MixinStorage();

  // Authorization setup
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management ----------------------------------------------

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Gallery Management ----------------------------------------------

  public type GalleryItem = {
    id : Text;
    title : Text;
    description : Text;
    image : Storage.ExternalBlob;
  };

  module GalleryItem {
    public func compare(galleryItem1 : GalleryItem, galleryItem2 : GalleryItem) : Order.Order {
      Text.compare(galleryItem1.id, galleryItem2.id);
    };
  };

  let galleryItems = Map.empty<Text, GalleryItem>();

  public shared ({ caller }) func createGalleryItem(id : Text, title : Text, description : Text, image : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create gallery items");
    };

    let item : GalleryItem = {
      id;
      title;
      description;
      image;
    };

    galleryItems.add(id, item);
  };

  public shared ({ caller }) func updateGalleryItem(id : Text, title : Text, description : Text, image : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update gallery items");
    };

    switch (galleryItems.get(id)) {
      case (null) { Runtime.trap("Gallery item not found") };
      case (?_) {
        let updatedItem : GalleryItem = {
          id;
          title;
          description;
          image;
        };
        galleryItems.add(id, updatedItem);
      };
    };
  };

  public query func getGalleryItem(id : Text) : async GalleryItem {
    // Public access - no authorization needed
    switch (galleryItems.get(id)) {
      case (null) { Runtime.trap("Gallery item not found") };
      case (?item) { item };
    };
  };

  public query func getAllGalleryItems() : async [GalleryItem] {
    // Public access - no authorization needed
    galleryItems.values().toArray().sort();
  };

  public shared ({ caller }) func deleteGalleryItem(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete gallery items");
    };

    if (not galleryItems.containsKey(id)) {
      Runtime.trap("Gallery item not found");
    };

    galleryItems.remove(id);
  };

  // Quote Requests -------------------------------------------

  type QuoteRequest = {
    id : Nat;
    serviceType : Text;
    projectDetails : Text;
    name : Text;
    phoneNumber : Text;
    attachedFile : ?Storage.ExternalBlob;
    timestamp : Time.Time;
    response : ?Text;
    responseTimestamp : ?Time.Time;
    isRead : Bool;
  };

  module QuoteRequest {
    public func compare(quoteRequest1 : QuoteRequest, quoteRequest2 : QuoteRequest) : Order.Order {
      Text.compare(quoteRequest1.name, quoteRequest2.name);
    };

    public func compareByTimestamp(quoteRequest1 : QuoteRequest, quoteRequest2 : QuoteRequest) : Order.Order {
      if (quoteRequest1.timestamp < quoteRequest2.timestamp) { #less } else { #greater };
    };
  };

  var nextQuoteRequestId = 1;

  let quoteRequests = Map.empty<Nat, QuoteRequest>();

  public shared ({ caller }) func submitQuoteRequest(serviceType : Text, projectDetails : Text, name : Text, phoneNumber : Text, attachedFile : ?Storage.ExternalBlob) : async () {
    // Public access - no authorization needed (guests can submit)
    let request : QuoteRequest = {
      id = nextQuoteRequestId;
      serviceType;
      projectDetails;
      name;
      phoneNumber;
      attachedFile;
      timestamp = Time.now();
      response = null;
      responseTimestamp = null;
      isRead = false;
    };

    quoteRequests.add(nextQuoteRequestId, request);
    nextQuoteRequestId += 1;
  };

  public query ({ caller }) func getAllQuoteRequests() : async [QuoteRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view quote requests");
    };

    quoteRequests.values().toArray().sort(QuoteRequest.compareByTimestamp);
  };

  public shared ({ caller }) func respondToQuoteRequest(quoteId : Nat, response : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can respond to quote requests");
    };

    switch (quoteRequests.get(quoteId)) {
      case (null) { Runtime.trap("Quote request not found") };
      case (?request) {
        let updatedRequest = {
          request with
          response = ?response;
          responseTimestamp = ?Time.now();
          isRead = true;
        };
        quoteRequests.add(quoteId, updatedRequest);
      };
    };
  };

  public shared ({ caller }) func markAllQuotesAsRead() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark quotes as read");
    };

    for ((id, request) in quoteRequests.entries()) {
      let updatedRequest = { request with isRead = true };
      quoteRequests.add(id, updatedRequest);
    };
  };

  public query func getQuoteCountByPhoneNumber(phoneNumber : Text) : async Nat {
    // Public access - no authorization needed
    var count = 0;
    for (request in quoteRequests.values()) {
      if (request.phoneNumber == phoneNumber) {
        count += 1;
      };
    };
    count;
  };

  public query func getQuoteResponseByPhoneNumber(phoneNumber : Text) : async [QuoteRequest] {
    // Public access - no authorization needed
    let filtered = Array.fromIter(
      quoteRequests.values().filter(
        func(req) { req.phoneNumber == phoneNumber and req.response != null }
      )
    );
    filtered;
  };

  // Reviews -----------------------------------------------

  type Review = {
    id : Nat;
    reviewerName : Text;
    rating : Nat; // 1-5
    reviewText : Text;
    timestamp : Time.Time;
  };

  module Review {
    public func compare(review1 : Review, review2 : Review) : Order.Order {
      Text.compare(review1.reviewerName, review2.reviewerName);
    };

    public func compareByTimestamp(Review1 : Review, review2 : Review) : Order.Order {
      if (Review1.timestamp < review2.timestamp) { #less } else { #greater };
    };
  };

  var nextReviewId = 1;

  let reviews = Map.empty<Nat, Review>();

  public shared ({ caller }) func submitReview(reviewerName : Text, rating : Nat, reviewText : Text) : async () {
    let review : Review = {
      id = nextReviewId;
      reviewerName;
      rating;
      reviewText;
      timestamp = Time.now();
    };

    reviews.add(nextReviewId, review);
    nextReviewId += 1;
  };

  public shared ({ caller }) func adminAddReview(reviewerName : Text, rating : Nat, reviewText : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add reviews");
    };

    let review : Review = {
      id = nextReviewId;
      reviewerName;
      rating;
      reviewText;
      timestamp = Time.now();
    };

    reviews.add(nextReviewId, review);
    nextReviewId += 1;
  };

  public shared ({ caller }) func updateReview(id : Nat, reviewerName : Text, rating : Nat, reviewText : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update reviews");
    };

    switch (reviews.get(id)) {
      case (null) { Runtime.trap("Review not found") };
      case (?existingReview) {
        let updatedReview = {
          id;
          reviewerName;
          rating;
          reviewText;
          timestamp = existingReview.timestamp;
        };
        reviews.add(id, updatedReview);
      };
    };
  };

  public query func getAllReviews() : async [Review] {
    // Public access - no authorization needed
    reviews.values().toArray().sort(Review.compareByTimestamp);
  };

  // Services -----------------------------------------------

  public type Service = {
    id : Nat;
    title : Text;
    description : Text;
    icon : Text;
    timestamp : Time.Time;
  };

  module Service {
    public func compare(service1 : Service, service2 : Service) : Order.Order {
      Text.compare(service1.title, service2.title);
    };

    public func compareByTimestamp(service1 : Service, service2 : Service) : Order.Order {
      if (service1.timestamp < service2.timestamp) { #less } else { #greater };
    };
  };

  var nextServiceId = 1;
  let services = Map.empty<Nat, Service>();

  public shared ({ caller }) func createService(title : Text, description : Text, icon : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create services");
    };

    let service : Service = {
      id = nextServiceId;
      title;
      description;
      icon;
      timestamp = Time.now();
    };

    services.add(nextServiceId, service);
    nextServiceId += 1;
  };

  public shared ({ caller }) func updateService(id : Nat, title : Text, description : Text, icon : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update services");
    };

    switch (services.get(id)) {
      case (null) { Runtime.trap("Service not found") };
      case (?existingService) {
        let updatedService = {
          id;
          title;
          description;
          icon;
          timestamp = existingService.timestamp;
        };
        services.add(id, updatedService);
      };
    };
  };

  public query func getService(id : Nat) : async Service {
    switch (services.get(id)) {
      case (null) { Runtime.trap("Service not found") };
      case (?service) { service };
    };
  };

  public query func getAllServices() : async [Service] {
    services.values().toArray().sort();
  };

  public shared ({ caller }) func deleteService(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete services");
    };

    if (not services.containsKey(id)) {
      Runtime.trap("Service not found");
    };

    services.remove(id);
  };

  // Site Settings -------------------------------------------

  public type SiteSettings = {
    companyName : Text;
    tagline : Text;
    heroText : Text;
    aboutText : Text;
    phoneNumber : Text;
    whatsappNumber : Text;
    address : Text;
    websiteDescription : Text;
    websiteUrl : Text;
  };

  var siteSettings : SiteSettings = {
    companyName = "Printing Company";
    tagline = "Your Solution for Quality Printing";
    heroText = "Professional Printing Services";
    aboutText = "We offer a wide range of printing services for all your business and personal needs.";
    phoneNumber = "+123-456-7890";
    whatsappNumber = "+123-456-7890";
    address = "56 W 117th St, New York, NY 10026";
    websiteDescription = "Professional printing services for businesses and individuals. Quality prints, fast turnaround times, and exceptional customer service.";
    websiteUrl = "https://printingcompany.com";
  };

  public shared ({ caller }) func updateSiteSettings(settings : SiteSettings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update site settings");
    };
    siteSettings := settings;
  };

  public query func getSiteSettings() : async SiteSettings {
    siteSettings;
  };

  // Visitor Logs ---------------------------------------------

  public type VisitorLog = {
    name : Text;
    mobileNumber : Text;
    timestamp : Time.Time;
  };

  let visitorLogs = List.empty<VisitorLog>();

  public shared ({ caller }) func logVisit(name : Text, mobileNumber : Text) : async () {
    let log : VisitorLog = {
      name;
      mobileNumber;
      timestamp = Time.now();
    };
    visitorLogs.add(log);
  };

  public query ({ caller }) func getVisitorLogs() : async [VisitorLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view visitor logs");
    };
    visitorLogs.toArray();
  };

  public query ({ caller }) func getUnreadQuoteCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view unread quote count");
    };

    var count = 0;
    for (request in quoteRequests.values()) {
      if (not request.isRead and request.response == null) {
        count += 1;
      };
    };
    count;
  };

  // --- Delete Operations ---

  public shared ({ caller }) func deleteQuoteRequest(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete quote requests");
    };

    if (not quoteRequests.containsKey(id)) {
      Runtime.trap("Quote request not found");
    };

    quoteRequests.remove(id);
  };

  public shared ({ caller }) func deleteReview(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete reviews");
    };

    if (not reviews.containsKey(id)) {
      Runtime.trap("Review not found");
    };

    reviews.remove(id);
  };
};
