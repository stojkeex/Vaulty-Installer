import { useState, useEffect } from 'react';
import { RatingModal } from './rating-modal';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export function RatingProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    const checkShouldShowRating = async () => {
      try {
        const ratingRef = doc(db, 'ratings', user.uid);
        const ratingDoc = await getDoc(ratingRef);
        
        const now = new Date();
        let shouldShow = false;

        if (!ratingDoc.exists()) {
          shouldShow = true;
        } else {
          const lastRatingDate = ratingDoc.data().lastRatingDate?.toDate?.();
          if (lastRatingDate && now >= lastRatingDate) {
            shouldShow = true;
          }
        }

        if (shouldShow) {
          setTimeout(() => {
            setShowRatingModal(true);
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking rating status:', error);
      }
    };

    const timer = setTimeout(checkShouldShowRating, 1000);
    return () => clearTimeout(timer);
  }, [user, loading]);

  const handleSubmitReview = async (rating: number) => {
    if (!user) return;

    try {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      await setDoc(
        doc(db, 'ratings', user.uid),
        {
          userId: user.uid,
          rating,
          lastRatingDate: nextMonth,
          submittedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Failed to save rating:', error);
      throw error;
    }
  };

  // TESTING: Reset rating to see modal again (remove in production)
  useEffect(() => {
    const handleResetRating = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'r' && e.altKey && user) {
        try {
          await setDoc(doc(db, 'ratings', user.uid), { lastRatingDate: new Date() }, { merge: true });
          setShowRatingModal(true);
          console.log('Rating reset for testing');
        } catch (error) {
          console.error('Reset failed:', error);
        }
      }
    };

    window.addEventListener('keydown', handleResetRating);
    return () => window.removeEventListener('keydown', handleResetRating);
  }, [user]);

  return (
    <>
      {children}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmitReview={handleSubmitReview}
      />
    </>
  );
}
