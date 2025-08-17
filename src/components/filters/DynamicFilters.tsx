'use client';

import React, { useState, useEffect } from 'react';
import { FilterField, getCategoryFilters, commonFilters } from '@/config/dynamicFilters';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DynamicFiltersProps {
  categoryId?: string;
  filters: Record<string, any>;
  onFilterChange: (filterId: string, value: any) => void;
  onClearFilters: () => void;
  locationData?: any;
  carMakes?: any;
  carModels?: any;
  secondHandBrands?: any;
}

interface FilterComponentProps {
  field: FilterField;
  value: any;
  onChange: (value: any) => void;
  options?: { value: string; label: string }[];
  disabled?: boolean;
}

const FilterComponent: React.FC<FilterComponentProps> = ({ 
  field, 
  value, 
  onChange, 
  options = [], 
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderSelectField = () => (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value ? options.find(opt => opt.value === value)?.label || field.placeholder : field.placeholder}
        </span>
        <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </button>
      
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.length > 10 && (
            <div className="p-2 border-b">
              <input
                type="text"
                placeholder="Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
          <div className="py-1">
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className="w-full px-3 py-2 text-left text-gray-500 hover:bg-gray-100 text-sm"
              >
                Seçimi Temizle
              </button>
            )}
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${
                  value === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-gray-500 text-sm">Sonuç bulunamadı</div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderMultiSelectField = () => {
    const selectedValues = Array.isArray(value) ? value : [];
    
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <span className={selectedValues.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
            {selectedValues.length > 0 
              ? `${selectedValues.length} seçili`
              : field.placeholder
            }
          </span>
          <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </button>
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="py-1">
              {options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter(v => v !== option.value);
                      onChange(newValues);
                    }}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRangeField = () => {
    const [minValue, maxValue] = Array.isArray(value) ? value : [field.min || 0, field.max || 100];
    
    return (
      <div className="space-y-2">
        <div className="flex space-x-2">
          <div className="flex-1">
            <input
              type="number"
              placeholder="Min"
              value={minValue || ''}
              onChange={(e) => onChange([parseInt(e.target.value) || field.min || 0, maxValue])}
              min={field.min}
              max={field.max}
              step={field.step}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex-1">
            <input
              type="number"
              placeholder="Max"
              value={maxValue || ''}
              onChange={(e) => onChange([minValue, parseInt(e.target.value) || field.max || 100])}
              min={field.min}
              max={field.max}
              step={field.step}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {field.min?.toLocaleString()} - {field.max?.toLocaleString()}
        </div>
      </div>
    );
  };

  const renderCheckboxField = () => (
    <label className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <span className="text-gray-900">{field.label}</span>
    </label>
  );

  const renderTextField = () => (
    <input
      type="text"
      placeholder={field.placeholder}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  );

  const renderNumberField = () => (
    <input
      type="number"
      placeholder={field.placeholder}
      value={value || ''}
      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      min={field.min}
      max={field.max}
      step={field.step}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  );

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.relative')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  switch (field.type) {
    case 'select':
      return renderSelectField();
    case 'multiselect':
      return renderMultiSelectField();
    case 'range':
      return renderRangeField();
    case 'checkbox':
      return renderCheckboxField();
    case 'text':
      return renderTextField();
    case 'number':
      return renderNumberField();
    default:
      return null;
  }
};

const DynamicFilters: React.FC<DynamicFiltersProps> = ({
  categoryId,
  filters,
  onFilterChange,
  onClearFilters,
  locationData,
  carMakes,
  carModels,
  secondHandBrands
}) => {
  const [activeFilters, setActiveFilters] = useState<FilterField[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const categoryFilters = categoryId ? getCategoryFilters(categoryId) : commonFilters;
    setActiveFilters(categoryFilters);
  }, [categoryId]);

  const getFieldOptions = (field: FilterField): { value: string; label: string }[] => {
    // Statik seçenekler varsa onları kullan
    if (field.options) {
      return field.options;
    }

    // Dinamik seçenekler
    switch (field.id) {
      case 'location':
        return locationData?.cities?.map((city: any) => ({
          value: city.id,
          label: city.name
        })) || [];
      
      case 'district':
        const selectedCity = filters.location;
        if (!selectedCity || !locationData?.districts) return [];
        return locationData.districts[selectedCity]?.map((district: any) => ({
          value: district.id,
          label: district.name
        })) || [];
      
      case 'carMake':
        return carMakes?.map((make: any) => ({
          value: make.id,
          label: make.name
        })) || [];
      
      case 'carModel':
        const selectedMake = filters.carMake;
        if (!selectedMake || !carModels) return [];
        return carModels[selectedMake]?.map((model: any) => ({
          value: model.id,
          label: model.name
        })) || [];
      
      case 'brand':
        const selectedSubcategory = filters.subcategory;
        if (!selectedSubcategory || !secondHandBrands) return [];
        return secondHandBrands[selectedSubcategory]?.brands?.map((brand: any) => ({
          value: brand.id,
          label: brand.name
        })) || [];
      
      case 'model':
        const selectedBrand = filters.brand;
        const subcategory = filters.subcategory;
        if (!selectedBrand || !subcategory || !secondHandBrands) return [];
        const brandData = secondHandBrands[subcategory]?.brands?.find((b: any) => b.id === selectedBrand);
        return brandData?.models?.map((model: any) => ({
          value: model.id,
          label: model.name
        })) || [];
      
      default:
        return [];
    }
  };

  const isFieldDisabled = (field: FilterField): boolean => {
    if (!field.dependsOn) return false;
    return !filters[field.dependsOn];
  };

  const shouldShowField = (field: FilterField): boolean => {
    if (!field.conditional) return true;
    const { field: conditionField, values } = field.conditional;
    return values.includes(filters[conditionField]);
  };

  const getActiveFilterCount = (): number => {
    return Object.values(filters).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== '' && value !== null && value !== undefined;
    }).length;
  };

  const visibleFilters = activeFilters.filter(shouldShowField);
  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
          {activeFilterCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Temizle
            </button>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <ChevronDownIcon 
              className={`h-5 w-5 transform transition-transform ${
                isCollapsed ? 'rotate-180' : ''
              }`} 
            />
          </button>
        </div>
      </div>

      {/* Filters */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleFilters.map((field) => {
              if (field.type === 'checkbox') {
                return (
                  <div key={field.id} className="col-span-1">
                    <FilterComponent
                      field={field}
                      value={filters[field.id]}
                      onChange={(value) => onFilterChange(field.id, value)}
                      disabled={isFieldDisabled(field)}
                    />
                  </div>
                );
              }

              return (
                <div key={field.id} className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <FilterComponent
                    field={field}
                    value={filters[field.id]}
                    onChange={(value) => onFilterChange(field.id, value)}
                    options={getFieldOptions(field)}
                    disabled={isFieldDisabled(field)}
                  />
                </div>
              );
            })}
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value || (Array.isArray(value) && value.length === 0)) return null;
                  
                  const field = activeFilters.find(f => f.id === key);
                  if (!field) return null;

                  const displayValue = Array.isArray(value) 
                    ? `${value.length} seçili`
                    : field.options?.find(opt => opt.value === value)?.label || value;

                  return (
                    <span
                      key={key}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      <span className="mr-1">{field.label}:</span>
                      <span>{displayValue}</span>
                      <button
                        onClick={() => onFilterChange(key, Array.isArray(value) ? [] : '')}
                        className="ml-1 hover:text-blue-600"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DynamicFilters;