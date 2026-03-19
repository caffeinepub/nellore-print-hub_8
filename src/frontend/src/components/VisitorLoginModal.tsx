import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useLogVisit } from "../hooks/useQueries";

const SESSION_KEY = "nph_visitor_logged";
const STORAGE_NAME_KEY = "nph_visitor_name";
const STORAGE_PHONE_KEY = "nph_visitor_phone";

interface Props {
  onEntered: (name: string, phone: string) => void;
}

export default function VisitorLoginModal({ onEntered }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const logVisit = useLogVisit();

  const validate = () => {
    const errs: { name?: string; phone?: string } = {};
    if (!name.trim()) errs.name = "Full name is required";
    if (!phone.trim()) errs.phone = "Mobile number is required";
    else if (!/^[0-9+\-\s]{7,15}$/.test(phone.trim()))
      errs.phone = "Enter a valid mobile number";
    return errs;
  };

  const handleEnter = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    try {
      await logVisit.mutateAsync({
        name: name.trim(),
        mobileNumber: phone.trim(),
      });
    } catch {
      // silently ignore backend errors
    }
    sessionStorage.setItem(SESSION_KEY, "1");
    localStorage.setItem(STORAGE_NAME_KEY, name.trim());
    localStorage.setItem(STORAGE_PHONE_KEY, phone.trim());
    onEntered(name.trim(), phone.trim());
    toast.success(`Welcome, ${name.trim()}!`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.85)" }}
        data-ocid="visitor.login.modal"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
        >
          {/* Logo/Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-brand-red rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <span className="text-white text-3xl">🖨️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Nellore Print Hub
            </h1>
            <p className="text-gray-500 text-sm mt-1 text-center">
              Please enter your details to continue
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Full Name *
              </Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name)
                    setErrors((p) => ({ ...p, name: undefined }));
                }}
                onKeyDown={(e) => e.key === "Enter" && handleEnter()}
                placeholder="e.g. Ravi Kumar"
                data-ocid="visitor.name.input"
                className={errors.name ? "border-red-400" : ""}
              />
              {errors.name && (
                <p
                  className="text-red-500 text-xs mt-1"
                  data-ocid="visitor.name.error_state"
                >
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Mobile Number *
              </Label>
              <Input
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone)
                    setErrors((p) => ({ ...p, phone: undefined }));
                }}
                onKeyDown={(e) => e.key === "Enter" && handleEnter()}
                placeholder="+91 XXXXX XXXXX"
                type="tel"
                data-ocid="visitor.phone.input"
                className={errors.phone ? "border-red-400" : ""}
              />
              {errors.phone && (
                <p
                  className="text-red-500 text-xs mt-1"
                  data-ocid="visitor.phone.error_state"
                >
                  {errors.phone}
                </p>
              )}
            </div>

            <Button
              onClick={handleEnter}
              disabled={logVisit.isPending}
              data-ocid="visitor.enter.primary_button"
              className="w-full bg-brand-red hover:bg-brand-red-hover text-white font-semibold text-base py-3 h-auto"
            >
              {logVisit.isPending ? "Please wait..." : "Enter Site"}
            </Button>

            <p className="text-xs text-gray-400 text-center">
              Your information is kept private and used only for service
              improvement.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export { SESSION_KEY, STORAGE_NAME_KEY, STORAGE_PHONE_KEY };
