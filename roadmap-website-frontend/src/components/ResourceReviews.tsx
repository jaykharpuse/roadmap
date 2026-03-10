import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import {
  fetchResourceReviews,
  createResourceReview,
  updateResourceReview,
  deleteResourceReview,
  type ResourceReview
} from '@/state/slices/resourceSlice';
import { useAuth } from '@/contexts/authContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, ThumbsUp, MessageSquare } from 'lucide-react';
import StarRating from '@/components/StarRating';
import { toast } from 'sonner';

interface ResourceReviewsProps {
  resourceId: string;
}

const ResourceReviews: React.FC<ResourceReviewsProps> = ({ resourceId }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resourceReviews } = useAppSelector((state) => state.resource);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingReview, setEditingReview] = useState<ResourceReview | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  // Form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [prosInput, setProsInput] = useState('');
  const [consInput, setConsInput] = useState('');

  useEffect(() => {
    if (resourceId) {
      dispatch(fetchResourceReviews(resourceId));
    }
  }, [dispatch, resourceId]);

  const userReview = resourceReviews.find(review => review.user._id === user?._id);

  const resetForm = () => {
    setRating(5);
    setTitle('');
    setReview('');
    setPros([]);
    setCons([]);
    setProsInput('');
    setConsInput('');
    setIsEditMode(false);
    setEditingReview(null);
  };

  const handleOpenReviewModal = (editReview?: ResourceReview) => {
    if (editReview) {
      setIsEditMode(true);
      setEditingReview(editReview);
      setRating(editReview.rating);
      setTitle(editReview.title || '');
      setReview(editReview.review);
      setPros(editReview.pros || []);
      setCons(editReview.cons || []);
    } else {
      resetForm();
    }
    setIsReviewModalOpen(true);
  };

  const handleAddPro = () => {
    if (prosInput.trim()) {
      setPros([...pros, prosInput.trim()]);
      setProsInput('');
    }
  };

  const handleAddCon = () => {
    if (consInput.trim()) {
      setCons([...cons, consInput.trim()]);
      setConsInput('');
    }
  };

  const handleRemovePro = (index: number) => {
    setPros(pros.filter((_, i) => i !== index));
  };

  const handleRemoveCon = (index: number) => {
    setCons(cons.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please login to submit a review');
      navigate('/login');
      return;
    }

    if (!review.trim()) {
      toast.error('Please write a review');
      return;
    }

    const reviewData = {
      resource: resourceId,
      rating,
      title: title.trim() || undefined,
      review: review.trim(),
      pros: pros.length > 0 ? pros : undefined,
      cons: cons.length > 0 ? cons : undefined,
    };

    try {
      if (isEditMode && editingReview) {
        await dispatch(updateResourceReview({
          reviewId: editingReview._id,
          updates: {
            rating,
            title: title.trim() || undefined,
            review: review.trim(),
            pros: pros.length > 0 ? pros : undefined,
            cons: cons.length > 0 ? cons : undefined,
          }
        })).unwrap();
        toast.success('Review updated successfully!');
      } else {
        await dispatch(createResourceReview(reviewData)).unwrap();
        toast.success('Review submitted successfully!');
      }
      setIsReviewModalOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit review');
    }
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      await dispatch(deleteResourceReview(reviewToDelete)).unwrap();
      toast.success('Review deleted successfully!');
      setIsDeleteConfirmOpen(false);
      setReviewToDelete(null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete review');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-[#60A5FA]" />
          <h3 className="text-lg font-semibold text-[#E2E8F0]">
            Reviews ({resourceReviews.length})
          </h3>
        </div>
        {user && !userReview && (
          <Button
            onClick={() => handleOpenReviewModal()}
            className="bg-[#60A5FA] hover:bg-[#3B82F6] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Write Review
          </Button>
        )}
        {user && userReview && (
          <Button
            onClick={() => handleOpenReviewModal(userReview)}
            variant="outline"
            className="border-[#60A5FA] text-[#60A5FA] hover:bg-[#60A5FA] hover:text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Review
          </Button>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {resourceReviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-[#94A3B8] mx-auto mb-4" />
            <p className="text-[#94A3B8]">No reviews yet. Be the first to review this resource!</p>
          </div>
        ) : (
          resourceReviews.map((review) => (
            <div
              key={review._id}
              className="bg-[#1E293B] border border-[#334155] rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#60A5FA] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {review.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-[#E2E8F0]">{review.user.name}</p>
                    <p className="text-sm text-[#94A3B8]">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} readonly size="sm" />
                  {review.isVerified && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              {review.title && (
                <h4 className="font-semibold text-[#E2E8F0] mb-2">{review.title}</h4>
              )}

              <p className="text-[#CBD5E1] mb-4 leading-relaxed">{review.review}</p>

              {/* Pros and Cons */}
              {(review.pros && review.pros.length > 0 || review.cons && review.cons.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {review.pros && review.pros.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4" />
                        Pros
                      </h5>
                      <ul className="space-y-1">
                        {review.pros.map((pro, index) => (
                          <li key={index} className="text-sm text-[#CBD5E1] flex items-start gap-2">
                            <span className="text-green-400 mt-1">•</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {review.cons && review.cons.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-red-400 mb-2">Cons</h5>
                      <ul className="space-y-1">
                        {review.cons.map((con, index) => (
                          <li key={index} className="text-sm text-[#CBD5E1] flex items-start gap-2">
                            <span className="text-red-400 mt-1">•</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Review Actions (only for review owner) */}
              {user && review.user._id === user._id && (
                <div className="flex gap-2 pt-4 border-t border-[#334155]">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenReviewModal(review)}
                    className="border-[#60A5FA] text-[#60A5FA] hover:bg-[#60A5FA] hover:text-white"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReviewToDelete(review._id);
                      setIsDeleteConfirmOpen(true);
                    }}
                    className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit Review' : 'Write a Review'}
            </DialogTitle>
            <DialogDescription>
              Share your experience with this resource. Your review helps others make informed decisions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Rating */}
            <div className="space-y-2">
              <Label className="text-[#E2E8F0]">Rating *</Label>
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size="lg"
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="review-title" className="text-[#E2E8F0]">Title (Optional)</Label>
              <Input
                id="review-title"
                placeholder="Summarize your review..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-[#0F172A] border-[#334155] text-[#E2E8F0]"
              />
            </div>

            {/* Review */}
            <div className="space-y-2">
              <Label htmlFor="review-text" className="text-[#E2E8F0]">Review *</Label>
              <Textarea
                id="review-text"
                placeholder="Share your detailed experience with this resource..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
                className="bg-[#0F172A] border-[#334155] text-[#E2E8F0]"
              />
            </div>

            {/* Pros */}
            <div className="space-y-2">
              <Label className="text-[#E2E8F0]">Pros</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a pro..."
                  value={prosInput}
                  onChange={(e) => setProsInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPro()}
                  className="bg-[#0F172A] border-[#334155] text-[#E2E8F0]"
                />
                <Button
                  type="button"
                  onClick={handleAddPro}
                  variant="outline"
                  className="border-[#60A5FA] text-[#60A5FA] hover:bg-[#60A5FA] hover:text-white"
                >
                  Add
                </Button>
              </div>
              {pros.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {pros.map((pro, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-green-500/10 text-green-400 border-green-500/30 cursor-pointer hover:bg-green-500/20"
                      onClick={() => handleRemovePro(index)}
                    >
                      {pro} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Cons */}
            <div className="space-y-2">
              <Label className="text-[#E2E8F0]">Cons</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a con..."
                  value={consInput}
                  onChange={(e) => setConsInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCon()}
                  className="bg-[#0F172A] border-[#334155] text-[#E2E8F0]"
                />
                <Button
                  type="button"
                  onClick={handleAddCon}
                  variant="outline"
                  className="border-[#60A5FA] text-[#60A5FA] hover:bg-[#60A5FA] hover:text-white"
                >
                  Add
                </Button>
              </div>
              {cons.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {cons.map((con, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-red-500/10 text-red-400 border-red-500/30 cursor-pointer hover:bg-red-500/20"
                      onClick={() => handleRemoveCon(index)}
                    >
                      {con} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReviewModalOpen(false)}
              className="border-[#334155] text-[#E2E8F0] hover:bg-[#1E293B]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              className="bg-[#60A5FA] hover:bg-[#3B82F6] text-white"
              disabled={!review.trim()}
            >
              {isEditMode ? 'Update Review' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your review will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ResourceReviews;