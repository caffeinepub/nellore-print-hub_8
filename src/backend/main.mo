import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
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

  type GalleryItem = {
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
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
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
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
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
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
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
    };

    quoteRequests.add(nextQuoteRequestId, request);
    nextQuoteRequestId += 1;
  };

  public query ({ caller }) func getAllQuoteRequests() : async [QuoteRequest] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view quote requests");
    };

    quoteRequests.values().toArray().sort(QuoteRequest.compareByTimestamp);
  };
};
