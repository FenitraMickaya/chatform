'use client';

import React, { useId } from 'react';

/**
 * Chatform brand mark.
 *
 * A speech bubble drawn with an angular tail, holding two form fields and
 * a cursor block. The fields are cut out with an SVG mask, so the mark
 * inherits the colour of its context (`currentColor`) and stays legible on
 * any background.
 */
export const ChatformMark: React.FC<{ className?: string; title?: string }> = ({
  className = 'w-7 h-7',
  title = 'Chatform',
}) => {
  const maskId = useId();
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <mask id={maskId}>
        <rect width="40" height="40" fill="black" />
        {/* Bubble + tail: kept */}
        <rect x="7.4" y="8" width="25.2" height="17" rx="6.6" fill="white" />
        <path d="M10.6 21.4 8.3 32 19 25.2Z" fill="white" />
        {/* Form fields + cursor: cut out */}
        <rect x="13.3" y="13.2" width="10.4" height="2.6" rx="1.3" fill="black" />
        <rect x="13.3" y="18" width="6.2" height="2.6" rx="1.3" fill="black" />
        <rect x="20.8" y="18" width="2.6" height="2.6" rx="0.6" fill="black" />
      </mask>
      <rect width="40" height="40" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
};

interface BrandProps {
  className?: string;
  markClassName?: string;
  /** Hide the wordmark and keep the mark only. */
  markOnly?: boolean;
  onClick?: () => void;
}

/** Mark + wordmark lockup. */
export const Brand: React.FC<BrandProps> = ({
  className = '',
  markClassName = 'w-7 h-7',
  markOnly = false,
  onClick,
}) => {
  const content = (
    <>
      <ChatformMark className={markClassName} />
      {!markOnly && (
        <span className="font-display font-bold tracking-tight text-zinc-950 text-lg leading-none">
          Chatform
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-2 cursor-pointer hover:opacity-80 transition ${className}`}
        aria-label="Chatform"
      >
        {content}
      </button>
    );
  }

  return (
    <span className={`flex items-center gap-2 ${className}`}>{content}</span>
  );
};
