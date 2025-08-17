'use client';

import { useState, useEffect } from 'react';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  maxListingImages: number;
  listingExpiryDays: number;
  featuredListingDays: number;
  minListingPrice: number;
  maxListingPrice: number;
  commissionRate: number;
  autoApproveListings: boolean;
  requireEmailVerification: boolean;
  allowGuestViewing: boolean;
  maintenanceMode: boolean;
  bannedWords: string[];
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Varsagel',
    siteDescription: 'Güvenli alışveriş platformu',
    contactEmail: 'info@varsagel.com',
    supportEmail: 'support@varsagel.com',
    maxListingImages: 10,
    listingExpiryDays: 30,
    featuredListingDays: 7,
    minListingPrice: 1,
    maxListingPrice: 1000000,
    commissionRate: 5,
    autoApproveListings: false,
    requireEmailVerification: true,
    allowGuestViewing: true,
    maintenanceMode: false,
    bannedWords: []
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newBannedWord, setNewBannedWord] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'listings' | 'security' | 'banned-words'>('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Ayarlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Ayarlar başarıyla kaydedildi!');
      } else {
        alert('Ayarlar kaydedilirken hata oluştu!');
      }
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
      alert('Ayarlar kaydedilirken hata oluştu!');
    } finally {
      setSaving(false);
    }
  };

  const addBannedWord = () => {
    if (newBannedWord.trim() && !settings.bannedWords.includes(newBannedWord.trim().toLowerCase())) {
      setSettings({
        ...settings,
        bannedWords: [...settings.bannedWords, newBannedWord.trim().toLowerCase()]
      });
      setNewBannedWord('');
    }
  };

  const removeBannedWord = (word: string) => {
    setSettings({
      ...settings,
      bannedWords: settings.bannedWords.filter(w => w !== word)
    });
  };

  const handleInputChange = (field: keyof SiteSettings, value: any) => {
    setSettings({
      ...settings,
      [field]: value
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-center text-gray-600">Ayarlar yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Site Ayarları</h1>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'general', name: 'Genel' },
            { id: 'listings', name: 'İlanlar' },
            { id: 'security', name: 'Güvenlik' },
            { id: 'banned-words', name: 'Yasaklı Kelimeler' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        {/* Genel Ayarlar */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Genel Ayarlar</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Adı
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İletişim E-postası
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destek E-postası
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Komisyon Oranı (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.commissionRate}
                  onChange={(e) => handleInputChange('commissionRate', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Açıklaması
              </label>
              <textarea
                rows={3}
                value={settings.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                Bakım Modu (Site geçici olarak kapatılır)
              </label>
            </div>
          </div>
        )}

        {/* İlan Ayarları */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">İlan Ayarları</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maksimum Resim Sayısı
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={settings.maxListingImages}
                  onChange={(e) => handleInputChange('maxListingImages', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İlan Süresi (Gün)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={settings.listingExpiryDays}
                  onChange={(e) => handleInputChange('listingExpiryDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Öne Çıkarma Süresi (Gün)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.featuredListingDays}
                  onChange={(e) => handleInputChange('featuredListingDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Fiyat (TL)
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.minListingPrice}
                  onChange={(e) => handleInputChange('minListingPrice', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maksimum Fiyat (TL)
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.maxListingPrice}
                  onChange={(e) => handleInputChange('maxListingPrice', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoApproveListings"
                checked={settings.autoApproveListings}
                onChange={(e) => handleInputChange('autoApproveListings', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoApproveListings" className="ml-2 block text-sm text-gray-900">
                İlanları Otomatik Onayla
              </label>
            </div>
          </div>
        )}

        {/* Güvenlik Ayarları */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Güvenlik Ayarları</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onChange={(e) => handleInputChange('requireEmailVerification', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requireEmailVerification" className="ml-2 block text-sm text-gray-900">
                  E-posta Doğrulaması Zorunlu
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowGuestViewing"
                  checked={settings.allowGuestViewing}
                  onChange={(e) => handleInputChange('allowGuestViewing', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowGuestViewing" className="ml-2 block text-sm text-gray-900">
                  Misafir Kullanıcıların İlan Görüntülemesine İzin Ver
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Yasaklı Kelimeler */}
        {activeTab === 'banned-words' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Yasaklı Kelimeler</h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Yasaklı kelime ekle..."
                value={newBannedWord}
                onChange={(e) => setNewBannedWord(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addBannedWord()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addBannedWord}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Ekle
              </button>
            </div>
            
            <div className="border rounded-md p-4 max-h-96 overflow-y-auto">
              {settings.bannedWords.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Henüz yasaklı kelime eklenmemiş</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {settings.bannedWords.map((word, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                    >
                      {word}
                      <button
                        onClick={() => removeBannedWord(word)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}