import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const SIZES = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export default function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onChange,
}: RatingStarsProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, i) => (
        <button
          key={i}
          type={interactive ? 'button' : undefined}
          disabled={!interactive}
          onClick={() => interactive && onChange?.(i + 1)}
          className={interactive ? 'cursor-pointer hover:scale-110 transition' : 'cursor-default'}
        >
          <Star
            className={`${SIZES[size]} ${
              i < Math.round(rating)
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-200'
            }`}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-1 text-sm text-gray-600 font-medium">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
