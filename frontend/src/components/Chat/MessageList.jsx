import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const EmptyState = ({ quickPrompts, onPromptClick }) => (
  <div className="flex flex-1 items-start justify-center py-5 sm:items-center sm:py-10">
    <div className="w-full max-w-3xl text-center">
      <div className="mx-auto mb-5 inline-flex items-center rounded-full border border-white/60 bg-white/78 px-4 py-1.5 text-sm text-slate-600 shadow-[0_12px_28px_rgba(148,163,184,0.14)] backdrop-blur dark:border-white/10 dark:bg-white/6 dark:text-slate-300">
        Quick chat
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
        How can I help today?
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 md:mt-4 md:text-base md:leading-7">
        Ask about everyday things like messages, meals, plans, reminders, or a quick joke.
      </p>
      <div className="mt-6 grid gap-2.5 sm:mt-8 sm:grid-cols-2 sm:gap-3">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPromptClick(prompt)}
            className="rounded-2xl border border-white/60 bg-white/76 px-4 py-3 text-center text-sm font-medium leading-6 text-slate-700 shadow-[0_18px_40px_rgba(148,163,184,0.14)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/6 dark:text-slate-200 dark:hover:bg-white/10 sm:py-4"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  </div>
);

const MessageActions = ({ message, onCopy, onRegenerate }) => {
  if (message.role !== 'assistant' || message.status === 'streaming') {
    return null;
  }

  return (
    <div className="mt-3 flex items-center gap-2 text-xs">
      <button
        type="button"
        onClick={() => onCopy(message.content)}
        className="rounded-lg px-2 py-1 text-slate-500 transition hover:bg-white/85 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
      >
        Copy
      </button>
      <button
        type="button"
        onClick={onRegenerate}
        className="rounded-lg px-2 py-1 text-slate-500 transition hover:bg-white/85 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
      >
        Regenerate
      </button>
    </div>
  );
};

const MessageBubble = ({ message, onCopy, onRegenerate }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <article className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`w-full ${isAssistant ? 'max-w-full px-1 py-2 sm:px-2 sm:py-3' : 'max-w-[92%] px-3 py-3 sm:max-w-3xl sm:px-5 sm:py-4'} rounded-3xl ${
          isAssistant
            ? 'bg-transparent'
            : 'border border-white/60 bg-white/84 shadow-[0_20px_44px_rgba(148,163,184,0.16)] backdrop-blur dark:border-white/10 dark:bg-white/8 dark:shadow-[0_18px_42px_rgba(2,6,23,0.3)]'
        }`}
      >
        <div className={`mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400 ${isAssistant ? 'max-w-4xl' : ''}`}>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {isAssistant ? 'Assistant' : 'You'}
          </span>
          <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {message.model ? <span>- {message.model}</span> : null}
        </div>

        {message.status === 'streaming' ? (
          <div className="flex items-center gap-2 py-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 dark:bg-slate-500" />
            Thinking...
          </div>
        ) : (
          <div className={`text-[15px] text-slate-800 dark:text-slate-100 ${isAssistant ? 'max-w-4xl' : ''}`}>
            <ReactMarkdown
              components={{
                p({ children }) {
                  return <p className="mb-4 leading-8 last:mb-0">{children}</p>;
                },
                h1({ children }) {
                  return <h1 className="mb-4 mt-6 text-2xl font-semibold tracking-tight first:mt-0">{children}</h1>;
                },
                h2({ children }) {
                  return <h2 className="mb-3 mt-6 text-xl font-semibold tracking-tight first:mt-0">{children}</h2>;
                },
                h3({ children }) {
                  return <h3 className="mb-3 mt-5 text-lg font-semibold tracking-tight first:mt-0">{children}</h3>;
                },
                ul({ children }) {
                  return <ul className="mb-4 list-disc space-y-2 pl-5 leading-8 marker:text-slate-400 last:mb-0">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="mb-4 list-decimal space-y-2 pl-5 leading-8 marker:text-slate-400 last:mb-0">{children}</ol>;
                },
                li({ children }) {
                  return <li className="pl-1">{children}</li>;
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="mb-4 rounded-r-2xl border-l-4 border-sky-300 bg-white/55 px-4 py-3 text-slate-700 dark:border-sky-400/60 dark:bg-white/5 dark:text-slate-200">
                      {children}
                    </blockquote>
                  );
                },
                a({ href, children }) {
                  return (
                    <a href={href} target="_blank" rel="noreferrer" className="font-medium text-sky-700 underline decoration-sky-300 underline-offset-4 dark:text-sky-300">
                      {children}
                    </a>
                  );
                },
                strong({ children }) {
                  return <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>;
                },
                hr() {
                  return <hr className="my-5 border-0 border-t border-slate-200/80 dark:border-white/10" />;
                },
                table({ children }) {
                  return (
                    <div className="mb-5 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/75 shadow-[0_10px_30px_rgba(148,163,184,0.12)] dark:border-white/10 dark:bg-white/5">
                      <table className="min-w-full border-collapse text-left text-sm">{children}</table>
                    </div>
                  );
                },
                thead({ children }) {
                  return <thead className="bg-slate-100/85 dark:bg-white/10">{children}</thead>;
                },
                th({ children }) {
                  return (
                    <th className="border-b border-slate-200/80 px-4 py-3 font-semibold text-slate-900 dark:border-white/10 dark:text-white">
                      {children}
                    </th>
                  );
                },
                td({ children }) {
                  return (
                    <td className="border-b border-slate-200/70 px-4 py-3 align-top leading-7 dark:border-white/10">
                      {children}
                    </td>
                  );
                },
                tbody({ children }) {
                  return <tbody className="[&_tr:last-child_td]:border-b-0">{children}</tbody>;
                },
                pre({ children }) {
                  return <div className="mb-4 overflow-x-auto rounded-2xl last:mb-0">{children}</div>;
                },
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        borderRadius: '1rem',
                        padding: '1rem',
                        fontSize: '0.9rem',
                        overflowX: 'auto',
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="rounded-lg bg-slate-100/90 px-1.5 py-0.5 text-[0.92em] dark:bg-white/10" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        <div className={isAssistant ? 'max-w-4xl' : ''}>
          <MessageActions message={message} onCopy={onCopy} onRegenerate={onRegenerate} />
        </div>
      </div>
    </article>
  );
};

const MessageList = ({ messages, quickPrompts, onPromptClick, onCopy, onRegenerate }) => {
  if (!messages.length) {
    return <EmptyState quickPrompts={quickPrompts} onPromptClick={onPromptClick} />;
  }

  return (
    <div className="space-y-5 py-2 sm:space-y-8">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onCopy={onCopy}
          onRegenerate={onRegenerate}
        />
      ))}
    </div>
  );
};

export default MessageList;
