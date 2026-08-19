import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SlideOverPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function SlideOverPanel({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  actions,
  children,
  width = 'xl',
}: SlideOverPanelProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
    '2xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      />

      {/* Drawer */}
      <div
        className={cn(
          'relative w-full skeuo-raised-3 bg-neutral-50 border-l border-neutral-200 flex flex-col z-10 shadow-2xl transition-transform duration-300 ease-out animate-in slide-in-from-right',
          widthClasses[width]
        )}
      >
        {/* Header */}
        <div className="p-fib-21 border-b border-neutral-200 bg-white flex items-center justify-between gap-fib-13 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-fib-8 mb-fib-3">
              <h3 className="text-base font-bold text-neutral-900 truncate">{title}</h3>
              {badge}
            </div>
            {subtitle && <p className="text-xs text-neutral-500 truncate">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-fib-8 shrink-0">
            {actions}
            <button
              onClick={onClose}
              className="p-fib-5 rounded-md hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-fib-21 space-y-fib-21">
          {children}
        </div>
      </div>
    </div>
  );
}
