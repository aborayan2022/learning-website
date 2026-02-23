import { Loader2 } from 'lucide-react';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
}

const SIZES = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export default function LoadingSpinner({ size = 'md', text, fullPage = false }: Props) {
  const content = (
    <div className="flex flex-col items-center gap-3">
      <Loader2 className={`${SIZES[size]} animate-spin text-gray-400`} />
      {text && <p className="text-sm text-gray-500 font-['Poppins']">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">{content}</div>
    );
  }

  return content;
}
