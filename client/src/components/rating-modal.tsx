import { useState, useEffect } from 'react';
import { Star, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (rating: number) => void;
}

export function RatingModal({ isOpen, onClose, onSubmitReview }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleRemindLater = () => {
    const today = new Date();
    today.setMonth(today.getMonth() + 1);
    localStorage.setItem('lastRatingPrompt', today.toISOString());
    onClose();
  };

  const handleStarClick = (value: number) => {
    setRating(value);
    setShowReviewForm(true);
  };

  const handleSubmitReview = async () => {
    setIsSubmitting(true);
    try {
      await onSubmitReview(rating);
      setShowThankYou(true);
      
      setTimeout(() => {
        setShowThankYou(false);
        setShowReviewForm(false);
        setRating(0);
        setReviewText('');
        onClose();
        setIsSubmitting(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to submit review:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !showReviewForm) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="w-full max-w-md relative"
          >
            {/* Glass morphism background with pac gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-black/40 to-purple-500 rounded-3xl blur-2xl" />

            <div className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              {/* Close button */}
              {!showThankYou && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                  data-testid="button-close-rating"
                >
                  <X size={24} />
                </button>
              )}

              {showThankYou ? (
                <>
                  {/* Thank You Section */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6 py-8"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="inline-block"
                    >
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Check size={32} className="text-white" />
                      </div>
                    </motion.div>
                    
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold text-white">Thank You!</h2>
                      <p className="text-white/60">Your review helps us improve Vaulty</p>
                    </div>
                  </motion.div>
                </>
              ) : !showReviewForm ? (
                <>
                  {/* Rating Section */}
                  <div className="text-center space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold text-white">Rate Us</h2>
                      <p className="text-white/60 text-sm">How's your experience with Vaulty?</p>
                    </div>

                    {/* Stars */}
                    <div className="flex justify-center gap-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => handleStarClick(star)}
                          className="relative transition-all"
                          data-testid={`button-star-${star}`}
                        >
                          <Star
                            size={48}
                            className={`transition-all ${
                              star <= (hoverRating || rating)
                                ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                                : 'text-white/30 hover:text-white/50'
                            }`}
                          />
                        </motion.button>
                      ))}
                    </div>

                    {rating > 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-white/80 font-medium"
                      >
                        {rating === 5 && "Excellent! We'd love to hear more."}
                        {rating === 4 && "Great! Any suggestions for improvement?"}
                        {rating === 3 && "Thanks for your feedback. Tell us what we can improve."}
                        {rating < 3 && "We're sorry to hear that. Please help us improve."}
                      </motion.p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={handleRemindLater}
                      className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
                      data-testid="button-remind-later"
                    >
                      Remind me later
                    </button>
                    <button
                      onClick={() => rating > 0 && setShowReviewForm(true)}
                      disabled={rating === 0}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-[#00d8ff] via-[#8b00ff] to-[#ff00ea] hover:shadow-[0_0_15px_rgba(255,0,234,0.4)] disabled:from-blue-500 disabled:to-purple-500 text-white font-semibold rounded-xl transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                      data-testid="button-write-review"
                    >
                      Write Review
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Review Form Section */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-white">Your Review</h2>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={24}
                            className={`${
                              star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-white/30'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your thoughts and help us improve..."
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder:text-white/40 resize-none focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all"
                      rows={5}
                      data-testid="textarea-review"
                    />

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowReviewForm(false)}
                        className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
                        disabled={isSubmitting}
                        data-testid="button-back-rating"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmitReview}
                        disabled={isSubmitting}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-[#00d8ff] via-[#8b00ff] to-[#ff00ea] hover:shadow-[0_0_15px_rgba(255,0,234,0.4)] disabled:from-blue-500 disabled:to-purple-500 text-white font-semibold rounded-xl transition-all active:scale-[0.98] disabled:cursor-not-allowed"
                        data-testid="button-submit-review"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
