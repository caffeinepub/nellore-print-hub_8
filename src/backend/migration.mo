import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";

module {
  type OldQuoteRequest = {
    id : Nat;
    serviceType : Text;
    projectDetails : Text;
    name : Text;
    phoneNumber : Text;
    attachedFile : ?Storage.ExternalBlob;
    timestamp : Int;
  };

  type OldActor = {
    quoteRequests : Map.Map<Nat, OldQuoteRequest>;
  };

  type NewQuoteRequest = {
    id : Nat;
    serviceType : Text;
    projectDetails : Text;
    name : Text;
    phoneNumber : Text;
    attachedFile : ?Storage.ExternalBlob;
    timestamp : Int;
    response : ?Text;
    responseTimestamp : ?Int;
    isRead : Bool;
  };

  type NewActor = {
    quoteRequests : Map.Map<Nat, NewQuoteRequest>;
  };

  public func run(old : OldActor) : NewActor {
    let newQuoteRequests = old.quoteRequests.map<Nat, OldQuoteRequest, NewQuoteRequest>(
      func(_id, oldRequest) {
        {
          oldRequest with
          response = null;
          responseTimestamp = null;
          isRead = false;
        };
      }
    );
    { quoteRequests = newQuoteRequests };
  };
};
