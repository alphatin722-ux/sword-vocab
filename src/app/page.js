'use client';

import { useState, useCallback } from 'react';
import ParentAuditPanel from '@/components/ParentAuditPanel';

const BOOK_TYPES = [
  { id: 'ket', label: 'KET' },
  { id: 'greenbook', label: '绿皮书' },
  { id: 'school', label: '校内英语' },
];

export default function Home() {
  const [bookType, setBookType] = useState(null);
  const [currentWord, setCurrentWord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchNextWord = useCallback(async (bt) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/get-next-word?bookType=${bt}`);
      const data = await res.json();
      if (data.message) {
        setMessage(data.message);
        setCurrentWord(null);
      } else {
        setCurrentWord(data);
      }
    } catch (err) {
      setMessage('请求失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectBook = (bt) => {
    setBookType(bt);
    fetchNextWord(bt);
  };

  const handleNextWord = useCallback(() => {
    if (bookType) fetchNextWord(bookType);
  }, [bookType, fetchNextWord]);

  // Book selection screen
  if (!bookType) {
    return (
      <div className="min-h-screen bg-[#ECEFF4] flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold text-[#2E3440] mb-8">📚 Sword-Vocab 复习系统</h1>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          {BOOK_TYPES.map((bt) => (
            <button
              key={bt.id}
              onClick={() => handleSelectBook(bt.id)}
              className="w-full py-4 px-6 bg-white rounded-xl border border-[#D8DEE9] text-lg font-bold text-[#5E81AC] hover:bg-[#E5E9F0] transition-colors shadow-sm"
            >
              {bt.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => fetchNextWord('ket')}
          className="mt-8 px-6 py-3 bg-[#5E81AC] text-white rounded-xl font-bold"
        >
          ➕ 添加初始错题 (KET)
        </button>
      </div>
    );
  }

  // Loading / All mastered
  if (loading) {
    return (
      <div className="min-h-screen bg-[#ECEFF4] flex items-center justify-center">
        <p className="text-xl text-[#4C566A]">加载中...</p>
      </div>
    );
  }

  if (message) {
    return (
      <div className="min-h-screen bg-[#ECEFF4] flex flex-col items-center justify-center p-8">
        <p className="text-xl text-[#4C566A] mb-4">{message}</p>
        <div className="flex gap-4">
          <button
            onClick={() => setBookType(null)}
            className="px-6 py-3 bg-[#5E81AC] text-white rounded-xl font-bold"
          >
            🔙 选择课本
          </button>
          <button
            onClick={() => fetchNextWord(bookType)}
            className="px-6 py-3 bg-[#A3BE8C] text-white rounded-xl font-bold"
          >
            🔄 刷新
          </button>
        </div>
      </div>
    );
  }

  // Review panel
  return (
    <div>
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => setBookType(null)}
          className="px-4 py-2 bg-white rounded-lg border border-[#D8DEE9] text-sm font-bold text-[#4C566A] hover:bg-[#E5E9F0]"
        >
          🔙 换课本
        </button>
      </div>
      {currentWord && (
        <ParentAuditPanel
          currentWord={currentWord}
          bookType={bookType}
          onNextWord={handleNextWord}
        />
      )}
    </div>
  );
}
