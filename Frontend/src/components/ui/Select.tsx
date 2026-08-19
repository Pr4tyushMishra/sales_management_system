import React, { SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: Array<{ label: string; value: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, children, disabled, ...props }, ref) => {
    return (
      <div className="w-full space-y-fib-3 text-left">
        {label && (
          <label className="block text-xs font-semibold text-neutral-700 tracking-tight">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full appearance-none rounded-md skeuo-sunken text-xs text-neutral-900 py-fib-8 pl-fib-13 pr-fib-34 transition-all outline-none bg-neutral-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-rose-500 focus:border-rose-500',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-fib-8 pointer-events-none text-neutral-500">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
