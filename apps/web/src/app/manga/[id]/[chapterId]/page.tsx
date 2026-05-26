'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';

interface ChapterPage {
  page: number;
  imageUrl: string;
}

interface Chapter {
  id: string;
  number: number;
  title: string;
  pages: ChapterPage[];
}

export default function MangaReaderPage() {
  const params = useParams();
  const router = useRouter();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const readerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!params.chapterId) return;
    
    apiClient.get<{ data: Chapter }>(`/manga/chapter/${params.chapterId}`)
      .then((res) => {
        setChapter(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.chapterId]);

  const goToNextPage = useCallback(() => {
    if (chapter && currentPage < chapter.pages.length - 1) {
      setCurrentPage((p) => p + 1);
    }
  }, [chapter, currentPage]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
    }
  }, [currentPage]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Chapter...</div>;
  if (!chapter) return <div className="h-screen flex items-center justify-center">Chapter not found</div>;

  return (
    <div className="flex h-screen bg-black overflow-hidden" ref={readerRef}>
      <div className="absolute top-4 left-4 z-50">
        <button onClick={() => router.back()} className="p-2 bg-white/10 rounded-full hover:bg-white/20">← Back</button>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-auto p-4 cursor-pointer" onClick={goToNextPage}>
        <img 
          src={chapter.pages[currentPage].imageUrl} 
          alt={`Page ${currentPage + 1}`} 
          className="max-h-full object-contain shadow-2xl"
        />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 bg-black/60 px-4 py-2 rounded-full backdrop-blur-md">
        <button onClick={goToPrevPage} disabled={currentPage === 0}>Prev</button>
        <span className="font-mono">{currentPage + 1} / {chapter.pages.length}</span>
        <button onClick={goToNextPage} disabled={currentPage === chapter.pages.length - 1}>Next</button>
      </div>
    </div>
  );
}
