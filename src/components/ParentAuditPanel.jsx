'use client';

import React, { useState, useEffect, useCallback } from 'react';

export default function ParentAuditPanel({ currentWord, bookType, onNextWord }) {
  const [inputValue, setInputValue] = useState('');
  const score = currentWord.review_score;

  const handleAudit = useCallback(
    async (isCorrect) => {
      await fetch('/api/update-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookType, word: currentWord.word, isCorrect }),
      });
      setInputValue('');
      onNextWord();
    },
    [bookType, currentWord.word, onNextWord]
  );

  // Bind keyboard shortcuts Y / N
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'y') handleAudit(true);
      if (e.key.toLowerCase() === 'n') handleAudit(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAudit]);

  return (
    <div className="min-h-screen bg-[#ECEFF4] text-[#2E3440] p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-xl p-6 shadow border border-[#D8DEE9]">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold text-[#4C566A]">
            书本: {bookType.toUpperCase()}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-bold ${
              score < 0
                ? 'bg-red-100 text-red-600 animate-pulse'
                : 'bg-[#E5E9F0] text-[#4C566A]'
            }`}
          >
            掌握度: {score} / 7
          </span>
        </div>

        <h1 className="text-4xl font-bold mb-2 text-[#5E81AC]">{currentWord.word}</h1>
        <div className="flex gap-4 text-sm text-[#4C566A] mb-4">
          <span>[{currentWord.ldoce_pron}]</span>
          <span>{currentWord.ldoce_syllable}</span>
        </div>
        <p className="text-lg font-medium">释义: {currentWord.chinese_def}</p>

        {currentWord.examples && currentWord.examples.length > 0 && (
          <div className="mt-4 p-4 bg-[#F8FAF1] rounded border-l-4 border-[#81A1C1]">
            <p className="italic text-[#2E3440]">{currentWord.examples[0].text}</p>
            <p className="text-sm text-gray-500 mt-1">
              {currentWord.examples[0].translation}
            </p>
          </div>
        )}
      </div>

      <div className="w-full max-w-2xl mt-6">
        <textarea
          className="w-full h-32 p-4 rounded-xl border border-[#D8DEE9] focus:outline-none focus:ring-2 focus:ring-[#88C0D0] text-lg"
          placeholder="孩子造句输入..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>

      <div className="w-full max-w-2xl mt-6 flex justify-between items-center">
        <p className="text-sm text-[#7B88A1]">
          快捷键:{' '}
          <kbd className="bg-gray-200 px-2 rounded">Y</kbd> 正确 |{' '}
          <kbd className="bg-gray-200 px-2 rounded">N</kbd> 错误
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => handleAudit(false)}
            className="px-6 py-3 bg-[#BF616A] text-white rounded-xl font-bold"
          >
            ❌ 判错 (-1)
          </button>
          <button
            onClick={() => handleAudit(true)}
            className="px-6 py-3 bg-[#A3BE8C] text-white rounded-xl font-bold"
          >
            ✅ 判对 (+1)
          </button>
        </div>
      </div>
    </div>
  );
}
