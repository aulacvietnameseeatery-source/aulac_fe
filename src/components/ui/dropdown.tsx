import * as React from "react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

interface DropdownProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    align?: 'start' | 'end' | 'center';
    className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
    trigger,
    children,
    open: controlledOpen,
    onOpenChange,
    align = 'start',
    className
}) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;
    
    const triggerRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [position, setPosition] = React.useState({ top: 0, left: 0 });

    const handleToggle = () => {
        const newOpen = !isOpen;
        if (isControlled) {
            onOpenChange?.(newOpen);
        } else {
            setInternalOpen(newOpen);
        }
    };

    const handleClose = () => {
        if (isControlled) {
            onOpenChange?.(false);
        } else {
            setInternalOpen(false);
        }
    };

    React.useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            const scrollX = window.scrollX || document.documentElement.scrollLeft;

            let left = rect.left + scrollX;
            if (align === 'end') {
                left = rect.right + scrollX;
            } else if (align === 'center') {
                left = rect.left + scrollX + rect.width / 2;
            }

            setPosition({
                top: rect.bottom + scrollY,
                left
            });
        }
    }, [isOpen, align]);

    React.useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                contentRef.current &&
                !contentRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                handleClose();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    return (
        <>
            <div ref={triggerRef} onClick={handleToggle} className="inline-block">
                {trigger}
            </div>
            {isOpen && createPortal(
                <div
                    ref={contentRef}
                    className={cn(
                        "absolute z-50 bg-white rounded-md shadow-lg border border-gray-200",
                        "animate-in fade-in-0 zoom-in-95",
                        align === 'end' && '-translate-x-full',
                        align === 'center' && '-translate-x-1/2',
                        className
                    )}
                    style={{
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                    }}
                >
                    <DropdownContext.Provider value={{ handleClose }}>
                        {children}
                    </DropdownContext.Provider>
                </div>,
                document.body
            )}
        </>
    );
};

const DropdownContext = React.createContext<{ handleClose: () => void }>({ handleClose: () => {} });

export const DropdownItem: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    selected?: boolean;
}> = ({ children, onClick, className, disabled, selected }) => {
    const { handleClose } = React.useContext(DropdownContext);

    const handleClick = () => {
        if (disabled) return;
        onClick?.();
        handleClose();
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                "px-3 py-2 text-sm cursor-pointer transition-colors flex items-center gap-2",
                "hover:bg-gray-100",
                selected && "bg-green-50 text-green-700",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            {children}
        </div>
    );
};

export const DropdownSeparator: React.FC = () => {
    return <div className="h-px bg-gray-200 my-1" />;
};

export const DropdownContent: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className }) => {
    return (
        <div className={cn("py-1", className)}>
            {children}
        </div>
    );
};
