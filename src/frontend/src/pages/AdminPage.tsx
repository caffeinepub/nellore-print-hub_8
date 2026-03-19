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
import { Toaster } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  Download,
  Eye,
  EyeOff,
  Home,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, type GalleryItem } from "../backend";
import {
  useCreateGalleryItem,
  useDeleteGalleryItem,
  useGetAllGalleryItems,
  useGetAllQuoteRequests,
  useUpdateGalleryItem,
} from "../hooks/useQueries";

const ADMIN_PASSWORD = "Munnu1998@";
const AUTH_KEY = "nph_admin_auth";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface GalleryFormData {
  title: string;
  description: string;
  imageFile: File | null;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(AUTH_KEY) === "1",
  );
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const { data: galleryItems = [], isLoading: galleryLoading } =
    useGetAllGalleryItems();
  const { data: quoteRequests = [], isLoading: quotesLoading } =
    useGetAllQuoteRequests();

  const createMutation = useCreateGalleryItem();
  const updateMutation = useUpdateGalleryItem();
  const deleteMutation = useDeleteGalleryItem();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<GalleryFormData>({
    title: "",
    description: "",
    imageFile: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const resetForm = () => {
    setFormData({ title: "", description: "", imageFile: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploadProgress(0);
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.imageFile) {
      toast.error("Title and image are required");
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
      toast.success("Gallery item updated!");
      setEditItem(null);
      resetForm();
    } catch {
      toast.error("Failed to update item");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Deleted successfully");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openEdit = (item: GalleryItem) => {
    setEditItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      imageFile: null,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <Toaster />
      {/* Header */}
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
          <h1 className="text-lg font-bold">Admin Panel</h1>
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

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Password Login */}
        {!isAuthenticated && (
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
        )}

        {/* Admin content */}
        {isAuthenticated && (
          <div className="space-y-10">
            {/* Gallery Management */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Gallery Management
                </h2>
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

              {galleryLoading ? (
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
                  No gallery items yet. Add your first item!
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
                            onClick={() => openEdit(item)}
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
            </section>

            {/* Quote Requests */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Quote Requests
              </h2>
              {quotesLoading ? (
                <div
                  className="flex justify-center py-8"
                  data-ocid="admin.quotes.loading_state"
                >
                  <Loader2 className="animate-spin" size={28} />
                </div>
              ) : quoteRequests.length === 0 ? (
                <div
                  className="text-center py-12 text-gray-400"
                  data-ocid="admin.quotes.empty_state"
                >
                  No quote requests yet.
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-card overflow-hidden">
                  <Table data-ocid="admin.quotes.table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>File</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quoteRequests.map((req, idx) => (
                        <TableRow
                          key={String(req.id)}
                          data-ocid={`admin.quotes.row.${idx + 1}`}
                        >
                          <TableCell className="text-gray-500 text-sm">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {req.name}
                          </TableCell>
                          <TableCell>{req.phoneNumber}</TableCell>
                          <TableCell>
                            <span className="bg-red-50 text-brand-red text-xs font-semibold px-2 py-1 rounded">
                              {req.serviceType}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-gray-600">
                            {req.projectDetails}
                          </TableCell>
                          <TableCell>
                            {req.attachedFile ? (
                              <a
                                href={req.attachedFile.getDirectURL()}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-ocid={`admin.quotes.download_button.${idx + 1}`}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-red hover:text-brand-red-hover bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                              >
                                <Download size={12} /> Download
                              </a>
                            ) : (
                              <span className="text-gray-400 text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {new Date(
                              Number(req.timestamp) / 1_000_000,
                            ).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
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
                placeholder="Brief description..."
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
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  Uploading... {uploadProgress}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-brand-red h-1.5 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
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
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  Uploading... {uploadProgress}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-brand-red h-1.5 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
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

      {/* Delete Confirmation */}
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
            Are you sure you want to delete this gallery item? This action
            cannot be undone.
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
