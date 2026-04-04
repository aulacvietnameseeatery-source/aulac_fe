'use client';

import React, { useState, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EmailChipInputProps {
  value: string[];
  onChange: (emails: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function EmailChipInput({
  value,
  onChange,
  placeholder = 'Enter email and press Enter',
  disabled = false,
  className,
}: EmailChipInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addEmails = useCallback(
    (raw: string) => {
      const parts = raw
        .split(/[;,\n]+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      const valid: string[] = [];
      for (const email of parts) {
        if (!EMAIL_RE.test(email)) {
          setError(`Invalid: ${email}`);
          continue;
        }
        if (value.includes(email)) continue;
        valid.push(email);
      }
      if (valid.length > 0) {
        onChange([...value, ...valid]);
        setError('');
      }
      setInputValue('');
    },
    [value, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ';' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) addEmails(inputValue);
    }
    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    if (pasted) addEmails(pasted);
  };

  const handleBlur = () => {
    if (inputValue.trim()) addEmails(inputValue);
  };

  const removeEmail = (email: string) => {
    onChange(value.filter((v) => v !== email));
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div
        className={cn(
          'flex flex-wrap gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((email) => (
          <Badge
            key={email}
            variant="secondary"
            className="gap-1 pr-1 text-xs font-normal"
          >
            {email}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeEmail(email);
                }}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled}
          className="flex-1 min-w-[180px] bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
