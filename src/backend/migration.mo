import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
  type OldQuoteRequest = {
    id : Nat;
    serviceType : Text;
    projectDetails : Text;
    name : Text;
    phoneNumber : Text;
    timestamp : Time.Time;
  };

  type NewQuoteRequest = {
    id : Nat;
    serviceType : Text;
    projectDetails : Text;
    name : Text;
    phoneNumber : Text;
    attachedFile : ?Storage.ExternalBlob;
    timestamp : Time.Time;
  };

  type OldActor = {
    galleryItems : Map.Map<Text, { id : Text; title : Text; description : Text; image : Storage.ExternalBlob }>;
    quoteRequests : Map.Map<Nat, OldQuoteRequest>;
    nextQuoteRequestId : Nat;
  };

  type NewActor = {
    galleryItems : Map.Map<Text, { id : Text; title : Text; description : Text; image : Storage.ExternalBlob }>;
    quoteRequests : Map.Map<Nat, NewQuoteRequest>;
    nextQuoteRequestId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newQuoteRequests = old.quoteRequests.map<Nat, OldQuoteRequest, NewQuoteRequest>(
      func(_id, oldQuoteRequest) {
        { oldQuoteRequest with attachedFile = null };
      }
    );
    { old with quoteRequests = newQuoteRequests };
  };
};
