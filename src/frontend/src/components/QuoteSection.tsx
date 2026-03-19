import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageCircle, Paperclip, Send, X } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useSubmitQuoteRequest } from "../hooks/useQueries";

const SERVICES = [
  "Flex Banner",
  "Business Cards",
  "Sticker Printing",
  "T-shirt Printing",
  "Packaging",
  "Logo Design",
];

export default function QuoteSection() {
  const [service, setService] = useState("");
  const [details, setDetails] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitMutation = useSubmitQuoteRequest();

  const buildBlob = async (file: File): Promise<ExternalBlob> => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    return ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
      setUploadProgress(pct),
    );
  };

  const resetForm = () => {
    setService("");
    setDetails("");
    setName("");
    setPhone("");
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleWhatsApp = async () => {
    if (!service || !name || !phone) {
      toast.error("Please fill in service, name and phone number.");
      return;
    }
    const msg = `Hello Nellore Print Hub! I need a quote for: ${service}. Name: ${name}. Phone: ${phone}. Details: ${details}`;
    const url = `https://wa.me/919390535070?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");

    // Also submit to backend (fire and forget)
    try {
      setIsUploading(true);
      const attachedFile = selectedFile ? await buildBlob(selectedFile) : null;
      submitMutation.mutate(
        {
          serviceType: service,
          projectDetails: details,
          name,
          phoneNumber: phone,
          attachedFile,
        },
        {
          onSuccess: () => toast.success("Quote request saved!"),
          onError: () => {
            /* silently ignore */
          },
        },
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !name || !phone) {
      toast.error("Please fill all required fields.");
      return;
    }
    try {
      setIsUploading(true);
      const attachedFile = selectedFile ? await buildBlob(selectedFile) : null;
      await submitMutation.mutateAsync({
        serviceType: service,
        projectDetails: details,
        name,
        phoneNumber: phone,
        attachedFile,
      });
      toast.success("Quote request submitted!");
      resetForm();
    } catch {
      toast.error("Failed to submit. Please try WhatsApp.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const isPending = submitMutation.isPending || isUploading;

  return (
    <section id="quote" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="section-title">GET A FREE QUOTE</h2>
          <div className="flex justify-center mb-4">
            <span className="inline-block w-16 h-1 bg-brand-red rounded-full" />
          </div>
          <p className="section-subtitle">
            Tell us about your project and we'll get back to you with the best
            pricing.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-card p-8 md:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Service Required *
              </Label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger
                  data-ocid="quote.service.select"
                  className="border-gray-300"
                >
                  <SelectValue placeholder="Select a service..." />
                </SelectTrigger>
                <SelectContent>
                  {SERVICES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Your Name *
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ravi Kumar"
                  className="border-gray-300"
                  data-ocid="quote.name.input"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Phone Number *
                </Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  type="tel"
                  className="border-gray-300"
                  data-ocid="quote.phone.input"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Project Details
              </Label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe your project: size, quantity, design notes, deadline..."
                rows={4}
                className="border-gray-300 resize-none"
                data-ocid="quote.details.textarea"
              />
            </div>

            {/* File Upload */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Attach Your File{" "}
                <span className="font-normal text-gray-400">(Optional)</span>
              </Label>
              <p className="text-xs text-gray-400 mb-2">
                Supports PDF, JPEG, PNG, PSD, AI, CDR, and all other file types
              </p>

              {!selectedFile ? (
                <label
                  htmlFor="quote-file-input"
                  className="flex items-center justify-center gap-3 w-full border-2 border-dashed border-gray-300 rounded-lg py-6 px-4 cursor-pointer hover:border-brand-red hover:bg-red-50 transition-colors"
                  data-ocid="quote.dropzone"
                >
                  <Paperclip size={20} className="text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Click to attach a file
                  </span>
                  <input
                    id="quote-file-input"
                    ref={fileInputRef}
                    type="file"
                    accept="*"
                    className="hidden"
                    data-ocid="quote.upload_button"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setSelectedFile(file);
                    }}
                  />
                </label>
              ) : (
                <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-red-50">
                  <Paperclip size={16} className="text-brand-red shrink-0" />
                  <span className="text-sm text-gray-700 truncate flex-1">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {(selectedFile.size / 1024).toFixed(0)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Upload progress bar */}
              {isUploading && uploadProgress > 0 && (
                <div className="mt-3 space-y-1" data-ocid="quote.loading_state">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Uploading file...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-brand-red h-1.5 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleWhatsApp}
                disabled={isPending}
                data-ocid="quote.whatsapp.primary_button"
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold uppercase tracking-wide px-6 py-3 rounded-md shadow transition-colors"
              >
                <MessageCircle size={18} /> Send via WhatsApp
              </button>
              <button
                type="submit"
                disabled={isPending}
                data-ocid="quote.submit.button"
                className="flex-1 flex items-center justify-center gap-2 btn-red disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Uploading...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
