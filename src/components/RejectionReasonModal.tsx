'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface RejectionReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isLoading?: boolean;
}

const predefinedReasons = [
  'Fiyat uygun değil',
  'Başka bir teklif kabul ettim',
  'Ürün artık satışta değil',
  'Teklif veren kişi ile iletişim kuramadım',
  'Ürün durumu beklentimi karşılamıyor',
  'Teslimat koşulları uygun değil',
  'Ödeme şekli uygun değil',
  'Diğer'
];

export default function RejectionReasonModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false 
}: RejectionReasonModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const reason = selectedReason === 'Diğer' ? customReason : selectedReason;
    
    if (!reason.trim()) {
      alert('Lütfen bir reddetme nedeni seçin veya yazın.');
      return;
    }

    onSubmit(reason.trim());
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedReason('');
      setCustomReason('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Reddetme Nedeni
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-gray-600 mb-4">
            Bu teklifi neden reddediyorsunuz? Lütfen bir neden seçin:
          </p>

          {/* Predefined Reasons */}
          <div className="space-y-3 mb-4">
            {predefinedReasons.map((reason) => (
              <label
                key={reason}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name="rejectionReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  disabled={isLoading}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{reason}</span>
              </label>
            ))}
          </div>

          {/* Custom Reason Input */}
          {selectedReason === 'Diğer' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reddetme nedeninizi yazın:
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                disabled={isLoading}
                placeholder="Reddetme nedeninizi detaylı olarak açıklayın..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {customReason.length}/500 karakter
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedReason}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Reddediliyor...' : 'Teklifi Reddet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}