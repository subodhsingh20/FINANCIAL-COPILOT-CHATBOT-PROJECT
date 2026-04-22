import React, { useEffect, useRef } from 'react';

const MessageInput = ({
  draft,
  setDraft,
  onSubmit,
  voiceState,
  onToggleListening,
  disabled,
}) => {
  const textareaRef = useRef(null);
  const isListening = voiceState === 'listening';
  const isTranscribing = voiceState === 'transcribing';
  const isVoiceActive = isListening || isTranscribing;

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
    <div className={`rounded-[24px] border p-2.5 shadow-[0_24px_60px_rgba(148,163,184,0.18)] backdrop-blur-2xl transition sm:rounded-[28px] sm:p-3 dark:shadow-[0_26px_70px_rgba(2,6,23,0.45)] ${
      isVoiceActive
        ? 'border-sky-300/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.94),_rgba(240,249,255,0.92))] shadow-[0_28px_72px_rgba(56,189,248,0.18)] dark:border-sky-400/35 dark:bg-[linear-gradient(180deg,_rgba(2,6,23,0.72),_rgba(15,23,42,0.6))]'
        : 'border-white/60 bg-white/84 dark:border-white/10 dark:bg-slate-950/45'
    }`}>
      <textarea
        ref={textareaRef}
        rows={1}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message the assistant"
        className="max-h-[220px] min-h-[24px] w-full resize-none border-0 bg-transparent px-2 py-2 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
      />

      <div className="mt-2.5 flex flex-col gap-2 sm:mt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={onToggleListening}
            aria-pressed={isVoiceActive}
            className={`group inline-flex items-center gap-2 rounded-xl px-3 py-2 font-medium transition touch-manipulation ${
              isListening
                ? 'bg-rose-500 text-white shadow-[0_12px_30px_rgba(244,63,94,0.35)]'
                : isTranscribing
                  ? 'bg-sky-500 text-white shadow-[0_12px_30px_rgba(14,165,233,0.28)]'
                  : 'bg-white/70 text-slate-600 hover:bg-white dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
            }`}
            disabled={isTranscribing}
          >
            <span className={`h-2.5 w-2.5 rounded-full transition ${
              isListening
                ? 'bg-white shadow-[0_0_0_6px_rgba(255,255,255,0.18)] animate-pulse'
                : isTranscribing
                  ? 'bg-white/90 animate-pulse'
                  : 'bg-sky-500 group-hover:bg-sky-600'
            }`} />
            <span>{isListening ? 'Listening' : isTranscribing ? 'Transcribing' : 'Voice'}</span>
          </button>
          <span className="min-w-0 text-[11px] leading-5 sm:text-xs">
            {isListening
              ? 'Speak naturally. Tap again to stop.'
              : isTranscribing
                ? 'Turning speech into text...'
                : 'Enter to send, Shift+Enter for a new line'}
          </span>
        </div>

        <button
          type="button"
          disabled={disabled || !draft.trim()}
          onClick={() => onSubmit()}
          className="w-full rounded-xl bg-gradient-to-r from-slate-900 via-sky-900 to-indigo-900 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(30,41,59,0.2)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2 dark:from-sky-400 dark:via-cyan-300 dark:to-indigo-400 dark:text-slate-950"
        >
          {disabled ? 'Working...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
