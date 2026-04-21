import React, { useEffect, useRef } from 'react';

const MessageInput = ({
  draft,
  setDraft,
  onSubmit,
  isListening,
  onToggleListening,
  disabled,
}) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = '0px';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
  }, [draft]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="rounded-[28px] border border-white/60 bg-white/84 p-3 shadow-[0_24px_60px_rgba(148,163,184,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/45 dark:shadow-[0_26px_70px_rgba(2,6,23,0.45)]">
      <textarea
        ref={textareaRef}
        rows={1}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message the assistant"
        className="max-h-[220px] min-h-[24px] w-full resize-none border-0 bg-transparent px-2 py-2 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
      />

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={onToggleListening}
            className={`rounded-lg px-3 py-2 font-medium transition ${
              isListening
                ? 'bg-rose-500 text-white'
                : 'bg-white/70 text-slate-600 hover:bg-white dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
            }`}
          >
            {isListening ? 'Listening' : 'Voice'}
          </button>
          <span className="text-[11px] sm:text-xs">Enter to send, Shift+Enter for a new line</span>
        </div>

        <button
          type="button"
          disabled={disabled || !draft.trim()}
          onClick={() => onSubmit()}
          className="w-full rounded-xl bg-gradient-to-r from-slate-900 via-sky-900 to-indigo-900 px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(30,41,59,0.2)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:from-sky-400 dark:via-cyan-300 dark:to-indigo-400 dark:text-slate-950"
        >
          {disabled ? 'Working...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
