import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useGetAllReviews, useSubmitReview } from "../hooks/useQueries";

const SAMPLE_REVIEWS = [
  {
    id: "s1",
    reviewerName: "Ramesh Reddy",
    rating: 5,
    reviewText:
      "Outstanding quality! My business cards turned out absolutely perfect. The colors are vibrant and the print is crisp. Highly recommended!",
    timestamp: "Jan 2026",
  },
  {
    id: "s2",
    reviewerName: "Priya Lakshmi",
    rating: 5,
    reviewText:
      "Got my shop flex banner printed here. Excellent work, delivered on time, and the price was very reasonable. Will definitely come back!",
    timestamp: "Dec 2025",
  },
  {
    id: "s3",
    reviewerName: "Venkat Naidu",
    rating: 5,
    reviewText:
      "Best printing shop in Nellore. The T-shirt printing quality is amazing. The whole team was very helpful and professional.",
    timestamp: "Nov 2025",
  },
];

const STAR_POSITIONS = [1, 2, 3, 4, 5] as const;

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  const positions = STAR_POSITIONS.slice(0, max);
  return (
    <div className="flex gap-0.5">
      {positions.map((pos) => (
        <Star
          key={pos}
          size={16}
          className={
            pos <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}

function InteractiveStar({
  rating,
  onChange,
}: { rating: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {STAR_POSITIONS.map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5"
          aria-label={`Rate ${i}`}
        >
          <Star
            size={24}
            className={
              (hover || rating) >= i
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const { data: backendReviews = [], isLoading } = useGetAllReviews();
  const submitReview = useSubmitReview();

  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const allReviews = [
    ...SAMPLE_REVIEWS.map((r) => ({
      id: r.id,
      reviewerName: r.reviewerName,
      rating: r.rating,
      reviewText: r.reviewText,
      dateLabel: r.timestamp,
    })),
    ...backendReviews.map((r) => ({
      id: String(r.id),
      reviewerName: r.reviewerName,
      rating: Number(r.rating),
      reviewText: r.reviewText,
      dateLabel: new Date(Number(r.timestamp) / 1_000_000).toLocaleDateString(
        "en-IN",
        { month: "short", year: "numeric" },
      ),
    })),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!rating) {
      toast.error("Please select a rating.");
      return;
    }
    if (!text.trim()) {
      toast.error("Please write a review.");
      return;
    }
    try {
      await submitReview.mutateAsync({
        reviewerName: name.trim(),
        rating: BigInt(rating),
        reviewText: text.trim(),
      });
      toast.success("Thank you for your review!");
      setName("");
      setRating(0);
      setText("");
      setShowForm(false);
      setSubmitted(true);
    } catch {
      toast.error("Failed to submit review. Please try again.");
    }
  };

  return (
    <section id="reviews" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="section-title">CUSTOMER REVIEWS</h2>
          <div className="flex justify-center mb-4">
            <span className="inline-block w-16 h-1 bg-brand-red rounded-full" />
          </div>
          <p className="section-subtitle max-w-xl mx-auto">
            What our customers say about our work.
          </p>
        </motion.div>

        {isLoading ? (
          <div
            className="flex justify-center py-12"
            data-ocid="reviews.loading_state"
          >
            <Loader2 className="animate-spin text-brand-red" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {allReviews.map((review, idx) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.07 }}
                data-ocid={`reviews.item.${idx + 1}`}
                className="bg-white rounded-xl shadow-card p-6 flex flex-col gap-3 border-t-4 border-brand-red"
              >
                <div className="flex items-center justify-between">
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-gray-400">
                    {review.dateLabel}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed flex-1">
                  &ldquo;{review.reviewText}&rdquo;
                </p>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red font-bold text-sm">
                    {review.reviewerName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">
                    {review.reviewerName}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex justify-center">
          {!showForm && !submitted ? (
            <Button
              onClick={() => setShowForm(true)}
              data-ocid="reviews.write.primary_button"
              className="bg-brand-red hover:bg-brand-red-hover text-white px-8 py-3 h-auto font-semibold"
            >
              Write a Review
            </Button>
          ) : submitted ? (
            <div
              className="text-green-600 font-semibold text-center"
              data-ocid="reviews.success_state"
            >
              Thank you! Your review has been submitted.
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-card p-8 w-full max-w-xl"
              data-ocid="reviews.form.panel"
            >
              <h3 className="font-bold text-gray-900 text-xl mb-6">
                Write a Review
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    Your Name *
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Reddy"
                    data-ocid="reviews.name.input"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Rating *
                  </Label>
                  <InteractiveStar rating={rating} onChange={setRating} />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    Your Review *
                  </Label>
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Share your experience with us..."
                    rows={4}
                    data-ocid="reviews.text.textarea"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    data-ocid="reviews.cancel.button"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitReview.isPending}
                    data-ocid="reviews.submit.button"
                    className="flex-1 bg-brand-red hover:bg-brand-red-hover text-white"
                  >
                    {submitReview.isPending ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={14} />{" "}
                        Submitting...
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
