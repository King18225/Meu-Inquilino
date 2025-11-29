import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'destructive' | 'outline';
    size?: 'default' | 'lg';
    fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'default', fullWidth = false, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    // Base styles
                    "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    // Sizes (Min height 50px for accessibility)
                    size === 'default' && "h-[50px] px-6 py-2 text-lg",
                    size === 'lg' && "h-[60px] px-8 text-xl",
                    // Variants
                    variant === 'primary' && "bg-blue-600 text-white hover:bg-blue-700", // Fallback blue if not defined, but we have semantic colors
                    variant === 'success' && "bg-success-dark text-white hover:bg-success",
                    variant === 'destructive' && "bg-error-dark text-white hover:bg-error",
                    variant === 'secondary' && "bg-gray-100 text-gray-900 hover:bg-gray-200",
                    variant === 'outline' && "border-2 border-gray-200 bg-transparent hover:bg-gray-50 text-gray-900",
                    // Full width
                    fullWidth && "w-full",
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";

export { Button };
