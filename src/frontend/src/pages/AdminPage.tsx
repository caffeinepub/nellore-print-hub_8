import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  Download,
  Eye,
  EyeOff,
  Home,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  ExternalBlob,
  type GalleryItem,
  type QuoteRequest,
  type Review,
  type Service,
} from "../backend";
import type { SiteSettings } from "../backend";
import {
  useAdminAddReview,
  useCreateGalleryItem,
  useCreateService,
  useDeleteGalleryItem,
  useDeleteReview,
  useDeleteService,
  useGetAllGalleryItems,
  useGetAllQuoteRequests,
  useGetAllReviews,
  useGetAllServices,
  useGetSiteSettings,
  useGetUnreadQuoteCount,
  useGetVisitorLogs,
  useMarkAllQuotesAsRead,
  useRespondToQuoteRequest,
  useUpdateGalleryItem,
  useUpdateReview,
  useUpdateService,
  useUpdateSiteSettings,
} from "../hooks/useQueries";

const ADMIN_PASSWORD = "Munnu1998@";
const AUTH_KEY = "nph_admin_auth";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={
            i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}

function StarInput({
  value,
  onChange,
}: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
        >
          <Star
            size={20}
            className={
              (hover || value) >= i
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        </button>
      ))}
    </div>
  );
}

// ---------- FILE PREVIEW HELPER ----------
function FilePreview({
  blob,
  filename,
}: { blob: ExternalBlob; filename?: string }) {
  const url = blob.getDirectURL();
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  const imgExts = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const pdfExt = ext === "pdf";

  const handleDownload = async () => {
    try {
      const bytes = await blob.getBytes();
      const b = new Blob([bytes]);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = filename || `file.${ext || "bin"}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      toast.error("Failed to download file");
    }
  };

  return (
    <div className="space-y-2">
      {imgExts.includes(ext) && (
        <img
          src={url}
          alt="Attached file"
          className="max-w-xs max-h-48 rounded-lg border object-contain"
        />
      )}
      {pdfExt && (
        <iframe
          src={url}
          title="PDF Preview"
          className="w-full h-56 rounded-lg border"
        />
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={handleDownload}
        className="text-brand-red border-brand-red hover:bg-red-50"
      >
        <Download size={14} className="mr-1" /> Download File
      </Button>
    </div>
  );
}

// ---------- QUOTE RESPONSE ITEM ----------
function QuoteItem({ req, idx }: { req: QuoteRequest; idx: number }) {
  const [responseText, setResponseText] = useState("");
  const [expanded, setExpanded] = useState(false);
  const respondMutation = useRespondToQuoteRequest();

  const handleRespond = async () => {
    if (!responseText.trim()) {
      toast.error("Please enter a response.");
      return;
    }
    await respondMutation.mutateAsync({
      quoteId: req.id,
      response: responseText.trim(),
    });
    const waMsg = `Hello ${req.name}, your quote request for '${req.serviceType}' has been reviewed. Our response: ${responseText.trim()} - Nellore Print Hub`;
    window.open(
      `https://wa.me/${req.phoneNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(waMsg)}`,
      "_blank",
    );
    toast.success("Response sent!");
    setResponseText("");
  };

  return (
    <div
      data-ocid={`admin.quotes.item.${idx + 1}`}
      className={`bg-white rounded-xl border p-5 space-y-4 ${
        !req.isRead ? "border-l-4 border-l-brand-red" : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900">{req.name}</span>
            {!req.isRead && (
              <Badge className="bg-brand-red text-white text-xs">New</Badge>
            )}
            <span className="bg-red-50 text-brand-red text-xs font-semibold px-2 py-0.5 rounded">
              {req.serviceType}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            📞 {req.phoneNumber} &nbsp;•&nbsp;
            {new Date(Number(req.timestamp) / 1_000_000).toLocaleString(
              "en-IN",
            )}
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setExpanded((p) => !p)}
          data-ocid={`admin.quotes.expand.button.${idx + 1}`}
        >
          {expanded ? "Collapse" : "View Details"}
        </Button>
      </div>

      {expanded && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-500 mb-1">
              Project Details
            </p>
            <p className="text-gray-800 text-sm">{req.projectDetails}</p>
          </div>

          {req.attachedFile && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">
                Attached File
              </p>
              <FilePreview
                blob={req.attachedFile}
                filename={`quote-${req.id}`}
              />
            </div>
          )}

          {req.response ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-green-700 mb-1">
                ✅ Response Sent
              </p>
              <p className="text-green-800 text-sm">{req.response}</p>
              <p className="text-xs text-green-600 mt-1">
                {req.responseTimestamp
                  ? new Date(
                      Number(req.responseTimestamp) / 1_000_000,
                    ).toLocaleString("en-IN")
                  : ""}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500">
                Send Response
              </p>
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Type your response here..."
                rows={3}
                data-ocid={`admin.quotes.response.textarea.${idx + 1}`}
              />
              <Button
                onClick={handleRespond}
                disabled={respondMutation.isPending}
                data-ocid={`admin.quotes.respond.button.${idx + 1}`}
                className="bg-brand-red hover:bg-brand-red-hover text-white"
              >
                {respondMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={14} />{" "}
                    Sending...
                  </>
                ) : (
                  "Send Response via WhatsApp"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- MAIN ADMIN PAGE ----------
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(AUTH_KEY) === "1",
  );
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "1");
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Incorrect password. Please try again.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setPasswordInput("");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <Toaster />
      <header className="bg-brand-dark text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            data-ocid="admin.home.link"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <Home size={18} />
            <span className="text-sm">Back to Site</span>
          </Link>
          <span className="text-gray-600">|</span>
          <h1 className="text-lg font-bold">Admin Panel — Nellore Print Hub</h1>
        </div>
        {isAuthenticated && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            data-ocid="admin.logout.button"
            className="border-gray-500 text-gray-300 hover:text-white hover:border-white"
          >
            <LogOut size={14} className="mr-1" /> Logout
          </Button>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {!isAuthenticated ? (
          <div
            className="flex flex-col items-center justify-center min-h-[60vh]"
            data-ocid="admin.login.panel"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">
                Admin Login
              </h2>
              <p className="text-gray-500 text-sm text-center mb-6">
                Enter your password to continue
              </p>
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="Password"
                    data-ocid="admin.password.input"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {loginError && (
                  <p
                    className="text-red-500 text-sm"
                    data-ocid="admin.login.error_state"
                  >
                    {loginError}
                  </p>
                )}
                <Button
                  onClick={handleLogin}
                  data-ocid="admin.login.button"
                  className="w-full bg-brand-red text-white hover:bg-brand-red-hover"
                >
                  Login
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <AdminDashboard />
        )}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { data: quotes = [] } = useGetAllQuoteRequests();
  const { data: unreadCount = 0n } = useGetUnreadQuoteCount();
  const { data: visitors = [] } = useGetVisitorLogs();
  const { data: reviews = [] } = useGetAllReviews();
  const markAllRead = useMarkAllQuotesAsRead();

  const handleBellClick = () => {
    markAllRead.mutate();
  };

  const unreadNum = Number(unreadCount);

  return (
    <Tabs defaultValue="dashboard">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <TabsList className="bg-white border">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="quotes" className="relative">
            Quotes
            {unreadNum > 0 && (
              <Badge className="ml-1.5 bg-brand-red text-white text-xs px-1.5 py-0">
                {unreadNum}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
        </TabsList>

        <button
          type="button"
          onClick={handleBellClick}
          data-ocid="admin.bell.button"
          className="relative p-2 rounded-lg bg-white border text-gray-600 hover:text-brand-red hover:border-brand-red transition-colors"
          title="Mark all quotes as read"
        >
          <Bell size={20} />
          {unreadNum > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-red text-white text-xs rounded-full flex items-center justify-center">
              {unreadNum}
            </span>
          )}
        </button>
      </div>

      {/* DASHBOARD */}
      <TabsContent value="dashboard">
        <DashboardTab
          quotes={quotes}
          visitors={visitors}
          reviews={reviews}
          unreadNum={unreadNum}
        />
      </TabsContent>

      {/* QUOTES */}
      <TabsContent value="quotes">
        <QuotesTab quotes={quotes} />
      </TabsContent>

      {/* GALLERY */}
      <TabsContent value="gallery">
        <GalleryTab />
      </TabsContent>

      {/* REVIEWS */}
      <TabsContent value="reviews">
        <ReviewsTab />
      </TabsContent>

      {/* SERVICES */}
      <TabsContent value="services">
        <ServicesTab />
      </TabsContent>

      {/* SETTINGS */}
      <TabsContent value="settings">
        <SettingsTab />
      </TabsContent>

      {/* VISITORS */}
      <TabsContent value="visitors">
        <VisitorsTab visitors={visitors} />
      </TabsContent>
    </Tabs>
  );
}

// ---------- DASHBOARD TAB ----------
function DashboardTab({
  quotes,
  visitors,
  reviews,
  unreadNum,
}: {
  quotes: QuoteRequest[];
  visitors: { name: string; mobileNumber: string; timestamp: bigint }[];
  reviews: Review[];
  unreadNum: number;
}) {
  const cards = [
    {
      label: "Total Quotes",
      value: quotes.length,
      emoji: "📋",
      color: "bg-blue-50 border-blue-200",
    },
    {
      label: "Unread Quotes",
      value: unreadNum,
      emoji: "🔴",
      color: "bg-red-50 border-red-200",
    },
    {
      label: "Total Visitors",
      value: visitors.length,
      emoji: "👥",
      color: "bg-green-50 border-green-200",
    },
    {
      label: "Total Reviews",
      value: reviews.length,
      emoji: "⭐",
      color: "bg-yellow-50 border-yellow-200",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div
            key={c.label}
            data-ocid={`admin.dashboard.card.${i + 1}`}
            className={`rounded-xl border p-6 text-center ${c.color}`}
          >
            <div className="text-3xl mb-2">{c.emoji}</div>
            <div className="text-3xl font-bold text-gray-900">{c.value}</div>
            <div className="text-sm text-gray-600 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-bold text-gray-900 text-lg mb-4">
          Recent Quote Requests
        </h3>
        {quotes.length === 0 ? (
          <p
            className="text-gray-400 text-center py-6"
            data-ocid="admin.dashboard.quotes.empty_state"
          >
            No quotes yet.
          </p>
        ) : (
          <div className="space-y-3">
            {quotes.slice(0, 5).map((q) => (
              <div
                key={String(q.id)}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <span className="font-semibold text-gray-900 text-sm">
                    {q.name}
                  </span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-brand-red text-xs font-medium">
                    {q.serviceType}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!q.isRead && (
                    <Badge className="bg-brand-red text-white text-xs">
                      New
                    </Badge>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(
                      Number(q.timestamp) / 1_000_000,
                    ).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- QUOTES TAB ----------
function QuotesTab({ quotes }: { quotes: QuoteRequest[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">
        Quote Requests ({quotes.length})
      </h2>
      {quotes.length === 0 ? (
        <div
          className="text-center py-16 text-gray-400"
          data-ocid="admin.quotes.empty_state"
        >
          No quote requests yet.
        </div>
      ) : (
        quotes.map((req, idx) => (
          <QuoteItem key={String(req.id)} req={req} idx={idx} />
        ))
      )}
    </div>
  );
}

// ---------- GALLERY TAB ----------
function GalleryTab() {
  const { data: galleryItems = [], isLoading } = useGetAllGalleryItems();
  const createMutation = useCreateGalleryItem();
  const updateMutation = useUpdateGalleryItem();
  const deleteMutation = useDeleteGalleryItem();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageFile: null as File | null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFormData({ title: "", description: "", imageFile: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploadProgress(0);
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.imageFile) {
      toast.error("Title and image required");
      return;
    }
    setIsUploading(true);
    try {
      const bytes = new Uint8Array(await formData.imageFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setUploadProgress(pct),
      );
      await createMutation.mutateAsync({
        id: generateId(),
        title: formData.title,
        description: formData.description,
        image: blob,
      });
      toast.success("Gallery item added!");
      setUploadOpen(false);
      resetForm();
    } catch {
      toast.error("Failed to add item");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    setIsUploading(true);
    try {
      let image = editItem.image;
      if (formData.imageFile) {
        const bytes = new Uint8Array(await formData.imageFile.arrayBuffer());
        image = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(pct),
        );
      }
      await updateMutation.mutateAsync({
        id: editItem.id,
        title: formData.title || editItem.title,
        description: formData.description,
        image,
      });
      toast.success("Updated!");
      setEditItem(null);
      resetForm();
    } catch {
      toast.error("Failed to update");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Gallery</h2>
        <Button
          onClick={() => {
            resetForm();
            setUploadOpen(true);
          }}
          data-ocid="admin.gallery.open_modal_button"
          className="bg-brand-red text-white hover:bg-brand-red-hover"
        >
          <Plus size={16} className="mr-1" /> Add Item
        </Button>
      </div>

      {isLoading ? (
        <div
          className="flex justify-center py-12"
          data-ocid="admin.gallery.loading_state"
        >
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : galleryItems.length === 0 ? (
        <div
          className="text-center py-16 text-gray-400"
          data-ocid="admin.gallery.empty_state"
        >
          No gallery items yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryItems.map((item, idx) => (
            <div
              key={item.id}
              data-ocid={`admin.gallery.item.${idx + 1}`}
              className="bg-white rounded-xl shadow-card overflow-hidden"
            >
              <div className="relative h-40 bg-gray-100">
                <img
                  src={item.image.getDirectURL()}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm text-gray-800 truncate">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {item.description}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditItem(item);
                      setFormData({
                        title: item.title,
                        description: item.description,
                        imageFile: null,
                      });
                    }}
                    data-ocid={`admin.gallery.edit_button.${idx + 1}`}
                    className="flex-1 text-xs"
                  >
                    <Pencil size={12} className="mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteId(item.id)}
                    data-ocid={`admin.gallery.delete_button.${idx + 1}`}
                    className="flex-1 text-xs border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={12} className="mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent data-ocid="admin.gallery.dialog">
          <DialogHeader>
            <DialogTitle>Add Gallery Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Business Card Design"
                data-ocid="admin.gallery.title.input"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                data-ocid="admin.gallery.description.textarea"
              />
            </div>
            <div>
              <Label>Image *</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    imageFile: e.target.files?.[0] ?? null,
                  }))
                }
                data-ocid="admin.gallery.upload_button"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100 cursor-pointer"
              />
            </div>
            {isUploading && uploadProgress > 0 && (
              <Progress value={uploadProgress} className="h-1.5" />
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadOpen(false)}
              data-ocid="admin.gallery.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isUploading}
              data-ocid="admin.gallery.submit_button"
              className="bg-brand-red text-white hover:bg-brand-red-hover"
            >
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={14} />{" "}
                  Uploading...
                </>
              ) : (
                "Add Item"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editItem}
        onOpenChange={(open) => {
          if (!open) setEditItem(null);
        }}
      >
        <DialogContent data-ocid="admin.gallery.edit.dialog">
          <DialogHeader>
            <DialogTitle>Edit Gallery Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, title: e.target.value }))
                }
                data-ocid="admin.gallery.edit.input"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                data-ocid="admin.gallery.edit.textarea"
              />
            </div>
            <div>
              <Label>New Image (optional)</Label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    imageFile: e.target.files?.[0] ?? null,
                  }))
                }
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100 cursor-pointer"
              />
            </div>
            {isUploading && uploadProgress > 0 && (
              <Progress value={uploadProgress} className="h-1.5" />
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditItem(null)}
              data-ocid="admin.gallery.edit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isUploading}
              data-ocid="admin.gallery.edit.save_button"
              className="bg-brand-red text-white hover:bg-brand-red-hover"
            >
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={14} />{" "}
                  Uploading...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <DialogContent data-ocid="admin.delete.dialog">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-sm">
            Are you sure? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="admin.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={deleteMutation.isPending}
              data-ocid="admin.delete.confirm_button"
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- REVIEWS TAB ----------
function ReviewsTab() {
  const { data: reviews = [], isLoading } = useGetAllReviews();
  const addReview = useAdminAddReview();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();

  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<Review | null>(null);
  const [form, setForm] = useState({ name: "", rating: 5, text: "" });
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const resetForm = () => setForm({ name: "", rating: 5, text: "" });

  const handleAdd = async () => {
    if (!form.name.trim() || !form.text.trim()) {
      toast.error("Name and review text required");
      return;
    }
    try {
      await addReview.mutateAsync({
        reviewerName: form.name,
        rating: BigInt(form.rating),
        reviewText: form.text,
      });
      toast.success("Review added!");
      setShowAdd(false);
      resetForm();
    } catch {
      toast.error("Failed to add review");
    }
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    try {
      await updateReview.mutateAsync({
        id: editItem.id,
        reviewerName: form.name,
        rating: BigInt(form.rating),
        reviewText: form.text,
      });
      toast.success("Review updated!");
      setEditItem(null);
      resetForm();
    } catch {
      toast.error("Failed to update review");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteReview.mutateAsync(id);
      toast.success("Deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">
          Reviews ({reviews.length})
        </h2>
        <Button
          onClick={() => {
            resetForm();
            setShowAdd(true);
          }}
          data-ocid="admin.reviews.open_modal_button"
          className="bg-brand-red text-white hover:bg-brand-red-hover"
        >
          <Plus size={16} className="mr-1" /> Add Review
        </Button>
      </div>

      {isLoading ? (
        <div
          className="flex justify-center py-12"
          data-ocid="admin.reviews.loading_state"
        >
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : reviews.length === 0 ? (
        <div
          className="text-center py-16 text-gray-400"
          data-ocid="admin.reviews.empty_state"
        >
          No reviews yet.
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r, idx) => (
            <div
              key={String(r.id)}
              data-ocid={`admin.reviews.item.${idx + 1}`}
              className="bg-white rounded-xl border p-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 text-sm">
                    {r.reviewerName}
                  </span>
                  <StarDisplay rating={Number(r.rating)} />
                </div>
                <p className="text-gray-600 text-sm">{r.reviewText}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditItem(r);
                    setForm({
                      name: r.reviewerName,
                      rating: Number(r.rating),
                      text: r.reviewText,
                    });
                  }}
                  data-ocid={`admin.reviews.edit_button.${idx + 1}`}
                >
                  <Pencil size={12} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteId(r.id)}
                  data-ocid={`admin.reviews.delete_button.${idx + 1}`}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={showAdd || !!editItem}
        onOpenChange={(open) => {
          if (!open) {
            setShowAdd(false);
            setEditItem(null);
          }
        }}
      >
        <DialogContent data-ocid="admin.reviews.dialog">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Review" : "Add Review"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reviewer Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                data-ocid="admin.reviews.name.input"
              />
            </div>
            <div>
              <Label className="mb-2 block">Rating</Label>
              <StarInput
                value={form.rating}
                onChange={(v) => setForm((p) => ({ ...p, rating: v }))}
              />
            </div>
            <div>
              <Label>Review Text</Label>
              <Textarea
                value={form.text}
                onChange={(e) =>
                  setForm((p) => ({ ...p, text: e.target.value }))
                }
                rows={4}
                data-ocid="admin.reviews.text.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAdd(false);
                setEditItem(null);
              }}
              data-ocid="admin.reviews.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={editItem ? handleUpdate : handleAdd}
              disabled={addReview.isPending || updateReview.isPending}
              data-ocid="admin.reviews.submit_button"
              className="bg-brand-red text-white hover:bg-brand-red-hover"
            >
              {editItem ? "Save Changes" : "Add Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <DialogContent data-ocid="admin.reviews.delete.dialog">
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this review?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="admin.reviews.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteId !== null && handleDelete(deleteId)}
              disabled={deleteReview.isPending}
              data-ocid="admin.reviews.delete.confirm_button"
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteReview.isPending ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- SERVICES TAB ----------
function ServicesTab() {
  const { data: services = [], isLoading } = useGetAllServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<Service | null>(null);
  const [form, setForm] = useState({ title: "", description: "", icon: "🖨️" });
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const resetForm = () => setForm({ title: "", description: "", icon: "🖨️" });

  const handleAdd = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      await createService.mutateAsync({
        title: form.title,
        description: form.description,
        icon: form.icon,
      });
      toast.success("Service added!");
      setShowAdd(false);
      resetForm();
    } catch {
      toast.error("Failed to add service");
    }
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    try {
      await updateService.mutateAsync({
        id: editItem.id,
        title: form.title,
        description: form.description,
        icon: form.icon,
      });
      toast.success("Service updated!");
      setEditItem(null);
      resetForm();
    } catch {
      toast.error("Failed to update service");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteService.mutateAsync(id);
      toast.success("Deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">
          Services ({services.length})
        </h2>
        <Button
          onClick={() => {
            resetForm();
            setShowAdd(true);
          }}
          data-ocid="admin.services.open_modal_button"
          className="bg-brand-red text-white hover:bg-brand-red-hover"
        >
          <Plus size={16} className="mr-1" /> Add Service
        </Button>
      </div>

      {isLoading ? (
        <div
          className="flex justify-center py-12"
          data-ocid="admin.services.loading_state"
        >
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : services.length === 0 ? (
        <div
          className="text-center py-16 text-gray-400"
          data-ocid="admin.services.empty_state"
        >
          No services added yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s, idx) => (
            <div
              key={String(s.id)}
              data-ocid={`admin.services.item.${idx + 1}`}
              className="bg-white rounded-xl border p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-2xl">{s.icon}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {s.title}
                    </p>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                      {s.description}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditItem(s);
                      setForm({
                        title: s.title,
                        description: s.description,
                        icon: s.icon,
                      });
                    }}
                    data-ocid={`admin.services.edit_button.${idx + 1}`}
                  >
                    <Pencil size={12} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteId(s.id)}
                    data-ocid={`admin.services.delete_button.${idx + 1}`}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={showAdd || !!editItem}
        onOpenChange={(open) => {
          if (!open) {
            setShowAdd(false);
            setEditItem(null);
          }
        }}
      >
        <DialogContent data-ocid="admin.services.dialog">
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Edit Service" : "Add Service"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Flex Banner Printing"
                data-ocid="admin.services.title.input"
              />
            </div>
            <div>
              <Label>Icon (emoji)</Label>
              <Input
                value={form.icon}
                onChange={(e) =>
                  setForm((p) => ({ ...p, icon: e.target.value }))
                }
                placeholder="e.g. 🖨️"
                data-ocid="admin.services.icon.input"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                placeholder="Brief description..."
                data-ocid="admin.services.description.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAdd(false);
                setEditItem(null);
              }}
              data-ocid="admin.services.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={editItem ? handleUpdate : handleAdd}
              disabled={createService.isPending || updateService.isPending}
              data-ocid="admin.services.submit_button"
              className="bg-brand-red text-white hover:bg-brand-red-hover"
            >
              {editItem ? "Save Changes" : "Add Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <DialogContent data-ocid="admin.services.delete.dialog">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">Are you sure?</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="admin.services.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteId !== null && handleDelete(deleteId)}
              disabled={deleteService.isPending}
              data-ocid="admin.services.delete.confirm_button"
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteService.isPending ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- SETTINGS TAB ----------
function SettingsTab() {
  const { data: settings, isLoading } = useGetSiteSettings();
  const updateSettings = useUpdateSiteSettings();
  const [form, setForm] = useState<SiteSettings>({
    companyName: "Nellore Print Hub",
    tagline: "Your Vision Printed to Perfection",
    heroText: "Professional Printing Services in Nellore",
    aboutText:
      "We are Nellore's premier printing shop, offering high-quality printing services.",
    phoneNumber: "+91 93905 35070",
    whatsappNumber: "919390535070",
    address: "Dargamitta, Nellore, Andhra Pradesh",
    websiteDescription: "Nellore Print Hub - Professional Printing Services",
    websiteUrl: window.location.origin,
  });
  const [initialized, setInitialized] = useState(false);

  if (settings && !initialized) {
    setForm(settings);
    setInitialized(true);
  }

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(form);
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const field = (
    key: keyof SiteSettings,
    label: string,
    multiline?: boolean,
  ) => (
    <div>
      <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
        {label}
      </Label>
      {multiline ? (
        <Textarea
          value={form[key]}
          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
          rows={3}
          data-ocid={`admin.settings.${key}.textarea`}
        />
      ) : (
        <Input
          value={form[key]}
          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
          data-ocid={`admin.settings.${key}.input`}
        />
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div
        className="flex justify-center py-12"
        data-ocid="admin.settings.loading_state"
      >
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Site Settings</h2>
      <div className="bg-white rounded-xl border p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {field("companyName", "Company Name")}
          {field("tagline", "Tagline")}
          {field("phoneNumber", "Phone Number")}
          {field("whatsappNumber", "WhatsApp Number (no + or spaces)")}
          {field("address", "Address")}
          {field("websiteUrl", "Website URL")}
        </div>
        {field("heroText", "Hero Text")}
        {field("aboutText", "About Section Text", true)}
        {field("websiteDescription", "Website Description (for sharing)", true)}

        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          data-ocid="admin.settings.save_button"
          className="bg-brand-red text-white hover:bg-brand-red-hover"
        >
          {updateSettings.isPending ? (
            <>
              <Loader2 className="animate-spin mr-2" size={14} /> Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  );
}

// ---------- VISITORS TAB ----------
function VisitorsTab({
  visitors,
}: { visitors: { name: string; mobileNumber: string; timestamp: bigint }[] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">
        Visitor Logs ({visitors.length})
      </h2>
      {visitors.length === 0 ? (
        <div
          className="text-center py-16 text-gray-400"
          data-ocid="admin.visitors.empty_state"
        >
          No visitors logged yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <Table data-ocid="admin.visitors.table">
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Mobile Number</TableHead>
                <TableHead>Visit Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitors.map((v, idx) => (
                <TableRow
                  key={v.mobileNumber + String(v.timestamp)}
                  data-ocid={`admin.visitors.row.${idx + 1}`}
                >
                  <TableCell className="text-gray-500 text-sm">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>{v.mobileNumber}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(Number(v.timestamp) / 1_000_000).toLocaleString(
                      "en-IN",
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
