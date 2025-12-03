'use client';

import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
}

export default function VideoModal({ isOpen, onClose, videoUrl }: VideoModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            📞 Gulf-El Call Center
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          {videoUrl ? (
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={videoUrl}
              title="Gulf-El Marketing Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🎥</div>
                <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-4">
                  Welcome to Gulf-El!
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  Your partner in green transportation investment
                </p>
                <div className="space-y-4 text-left max-w-md mx-auto">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400">Electric Fleet</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">100% eco-friendly vehicles</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400">High Returns</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Up to 5% monthly ROI</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🌍</span>
                    <div>
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400">Save the Planet</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Reduce CO₂ emissions daily</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📈</span>
                    <div>
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400">Proven Track Record</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Thousands of satisfied investors</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Contact Us:</p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold">📞 +1-XXX-XXX-XXXX</p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold">✉️ invest@gulf-el.com</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
