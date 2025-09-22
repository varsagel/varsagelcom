import React from 'react';
import { Badge } from '@/components/ui/badge';
import { categoriesData, DynamicFormField } from '@/data/categories';

interface DynamicDataDisplayProps {
  categoryId: string;
  subcategoryId: string;
  categorySpecificData: Record<string, string | number | boolean>;
}

export const DynamicDataDisplay: React.FC<DynamicDataDisplayProps> = ({
  categoryId,
  subcategoryId,
  categorySpecificData
}) => {
  // Kategori ve alt kategori bilgilerini bul
  const category = categoriesData.find(cat => cat.id === categoryId);
  const subcategory = category?.subcategories?.find(sub => sub.id === subcategoryId);
  
  // Dinamik alanları al
  const dynamicFields = subcategory?.dynamicFields || [];
  
  // Eğer dinamik alan yoksa hiçbir şey gösterme
  if (!dynamicFields.length || !categorySpecificData) {
    return null;
  }

  // Veriyi görüntüle
  const renderFieldValue = (field: DynamicFormField, value: string | number | boolean) => {
    if (!value || value === '') return null;

    switch (field.type) {
      case 'select':
      case 'radio':
        // Select ve radio için option label'ını bul
        const option = field.options?.find((opt) => opt.value === value);
        return option ? option.label : String(value);
      
      case 'checkbox':
        if (typeof value === 'boolean') {
          return value ? 'Evet' : 'Hayır';
        }
        return String(value);
      
      case 'number':
        return field.unit ? `${value} ${field.unit}` : value;
      
      case 'textarea':
      case 'text':
      default:
        return value;
    }
  };

  // Görüntülenecek alanları filtrele (boş olmayanlar)
  const fieldsToDisplay = dynamicFields.filter(field => {
    const value = categorySpecificData[field.id];
    return value !== undefined && value !== null && value !== '';
  });

  if (fieldsToDisplay.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fieldsToDisplay.map((field) => {
          const value = categorySpecificData[field.id];
          const displayValue = renderFieldValue(field, value);
          
          if (!displayValue) return null;

          return (
            <div key={field.id} className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-gray-600">
                {field.label || field.name}
              </span>
              <div className="text-sm text-gray-900">
                {field.type === 'textarea' ? (
                  <p className="whitespace-pre-wrap">{displayValue}</p>
                ) : field.type === 'select' || field.type === 'radio' ? (
                  <Badge variant="secondary" className="w-fit">
                    {displayValue}
                  </Badge>
                ) : (
                  <span className="font-medium">{displayValue}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DynamicDataDisplay;