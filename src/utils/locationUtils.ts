/**
 * Şehir ve ilçe isimlerini büyük harfe çeviren utility fonksiyonları
 */

/**
 * Verilen metni büyük harfe çevirir
 * @param text - Çevrilecek metin
 * @returns Büyük harfli metin
 */
export const toUpperCase = (text: string | null | undefined): string => {
  if (!text) return '';
  return text.toUpperCase();
};

/**
 * Şehir ismini büyük harfe çevirir
 * @param city - Şehir ismi
 * @returns Büyük harfli şehir ismi
 */
export const formatCity = (city: string | null | undefined): string => {
  return toUpperCase(city);
};

/**
 * İlçe ismini büyük harfe çevirir
 * @param district - İlçe ismi
 * @returns Büyük harfli ilçe ismi
 */
export const formatDistrict = (district: string | null | undefined): string => {
  return toUpperCase(district);
};

/**
 * Şehir ve ilçeyi birleştirip büyük harfe çevirir
 * @param city - Şehir ismi
 * @param district - İlçe ismi (opsiyonel)
 * @returns Formatlanmış konum metni
 */
export const formatLocation = (city: string | null | undefined, district?: string | null | undefined): string => {
  const formattedCity = formatCity(city);
  const formattedDistrict = formatDistrict(district);
  
  if (formattedCity && formattedDistrict) {
    return `${formattedDistrict}, ${formattedCity}`;
  }
  
  return formattedCity || formattedDistrict || '';
};