import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, Star } from "lucide-react";
import { useAuth } from "@/contexts/authContext";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { createReview } from "@/state/slices/reviewSlice";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmapId: string;
}

interface FormData {
  rating: number | null;
  title: string;
  review: string;
  pros: string[];
  cons: string[];
}

interface FormErrors {
  rating?: string;
  review?: string;
  title?: string;
}

export default function ReviewModal({
  isOpen,
  onClose,
  roadmapId,
}: ReviewModalProps) {
    const dispatch = useAppDispatch();
    
  const [formData, setFormData] = useState<FormData>({
    rating: null,
    title: "",
    review: "",
    pros: [],
    cons: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [prosInput, setProsInput] = useState("");
  const [consInput, setConsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {user} = useAuth();
  const userId = user?._id ?? "";

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.rating === null) {
      newErrors.rating = "Rating is required";
    }

    if (!formData.review.trim()) {
      newErrors.review = "Review is required";
    } else if (formData.review.length > 1000) {
      newErrors.review = "Review must be 1000 characters or less";
    }

    if (formData.title.length > 100) {
      newErrors.title = "Title must be 100 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    dispatch(createReview({ ...formData, rating: formData.rating ?? undefined })).unwrap().then(()=>{}).catch(()=>{})
    try {
      // Mock API call - replace with actual submission logic
      const reviewData = {
        ...formData,
        roadmapId,
        userId,
        createdAt: new Date().toISOString(),
      };

      console.log("Submitting review:", reviewData);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset form and close modal on success
      setFormData({
        rating: null,
        title: "",
        review: "",
        pros: [],
        cons: [],
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = (type: "pros" | "cons", value: string) => {
    if (!value.trim()) return;

    const currentTags = formData[type];
    if (!currentTags.includes(value.trim())) {
      setFormData((prev) => ({
        ...prev,
        [type]: [...currentTags, value.trim()],
      }));
    }

    if (type === "pros") setProsInput("");
    if (type === "cons") setConsInput("");
  };

  const removeTag = (type: "pros" | "cons", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: "pros" | "cons") => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = type === "pros" ? prosInput : consInput;
      addTag(type, value);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 shadow-2xl transition-all">
        <div className="bg-slate-800 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-sky-400">Submit Review</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div className="space-y-2">
              <Label htmlFor="rating" className="text-blue-400 font-medium">
                Rating *
              </Label>
              <Select
                value={formData.rating ? formData.rating.toString() : ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, rating: parseInt(value) }))
                }
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-400">
                  <SelectValue placeholder="Select a rating" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem
                      key={rating}
                      value={rating.toString()}
                      className="text-slate-200 focus:bg-slate-600"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-slate-400"
                              }`}
                            />
                          ))}
                        </div>
                        <span>
                          {rating} star{rating !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.rating && (
                <p className="text-red-400 text-sm">{errors.rating}</p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-blue-400 font-medium">
                Title{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Brief title for your review"
                maxLength={100}
                className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400 focus:border-blue-400"
              />
              <div className="flex justify-between text-sm">
                {errors.title && <p className="text-red-400">{errors.title}</p>}
                <p className="text-slate-400 ml-auto">
                  {formData.title.length}/100
                </p>
              </div>
            </div>

            {/* Review */}
            <div className="space-y-2">
              <Label htmlFor="review" className="text-blue-400 font-medium">
                Review *
              </Label>
              <Textarea
                id="review"
                value={formData.review}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, review: e.target.value }))
                }
                placeholder="Share your detailed thoughts about this roadmap..."
                maxLength={1000}
                rows={4}
                className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400 focus:border-blue-400 resize-none"
              />
              <div className="flex justify-between text-sm">
                {errors.review && (
                  <p className="text-red-400">{errors.review}</p>
                )}
                <p className="text-slate-400 ml-auto">
                  {formData.review.length}/1000
                </p>
              </div>
            </div>

            {/* Pros */}
            <div className="space-y-2">
              <Label className="text-blue-400 font-medium">
                Pros{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={prosInput}
                  onChange={(e) => setProsInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, "pros")}
                  placeholder="Add a positive point"
                  className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400 focus:border-blue-400"
                />
                <Button
                  type="button"
                  onClick={() => addTag("pros", prosInput)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.pros.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.pros.map((pro, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-900/30 text-green-300 rounded-full text-sm border border-green-700"
                    >
                      {pro}
                      <button
                        type="button"
                        onClick={() => removeTag("pros", index)}
                        className="hover:text-green-100"
                        title="Remove pro"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Cons */}
            <div className="space-y-2">
              <Label className="text-blue-400 font-medium">
                Cons{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={consInput}
                  onChange={(e) => setConsInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, "cons")}
                  placeholder="Add a negative point"
                  className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400 focus:border-blue-400"
                />
                <Button
                  type="button"
                  onClick={() => addTag("cons", consInput)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.cons.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.cons.map((con, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-red-900/30 text-red-300 rounded-full text-sm border border-red-700"
                    >
                      {con}
                      <button
                        type="button"
                        onClick={() => removeTag("cons", index)}
                        className="hover:text-red-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-slate-400 hover:text-white hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}