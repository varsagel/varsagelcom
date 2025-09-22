"use client";

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Label } from './label';
import { 
  CarBrand, 
  CarSeries, 
  getAllBrands, 
  getSeriesByBrand,
  getBrandById,
  getSeriesByBrandAndId
} from '@/data/car-brands';

interface CarSelectorProps {
  value?: {
    brand?: string;
    series?: string;
    model?: string;
  };
  onChange: (value: {
    brand?: string;
    series?: string;
    model?: string;
    brandName?: string;
    seriesName?: string;
    modelName?: string;
  }) => void;
  required?: boolean;
  className?: string;
  fieldType?: 'brand' | 'series' | 'model';
  dependentValue?: string | number | boolean;
}

export function CarSelector({ value, onChange, required = false, className, fieldType, dependentValue }: CarSelectorProps) {
  // Handle both string and object values
  const parseValue = (val: string | object | undefined): { brand?: string; series?: string; model?: string } => {
    if (typeof val === 'string') {
      if (fieldType === 'brand') {
        return { brand: val };
      } else if (fieldType === 'series') {
        return { series: val };
      }
      return { model: val };
    }
    return (val as { brand?: string; series?: string; model?: string }) || {};
  };
  
  const parsedValue = parseValue(value);
  const [selectedBrand, setSelectedBrand] = useState<string>(parsedValue?.brand || '');
  const [selectedSeries, setSelectedSeries] = useState<string>(parsedValue?.series || '');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  const [brands] = useState<CarBrand[]>(getAllBrands());
  const [series, setSeries] = useState<CarSeries[]>([]);

  // Update series when brand changes
  useEffect(() => {
    if (selectedBrand) {
      const brandSeries = getSeriesByBrand(selectedBrand);
      setSeries(brandSeries);
      
      // Reset series if current selection is not valid for new brand
      if (selectedSeries && !brandSeries.find(s => s.id === selectedSeries)) {
        setSelectedSeries('');
      }
    } else {
      setSeries([]);
      setSelectedSeries('');
    }
  }, [selectedBrand]);

  // Update state when value prop changes
  useEffect(() => {
    const parsedValue = parseValue(value);
    setSelectedBrand(parsedValue?.brand || '');
    setSelectedSeries(parsedValue?.series || '');
  }, [value]);

  // Initialize component
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Notify parent component of changes (skip initial render)
  useEffect(() => {
    if (!isInitialized) return;
    
    const brand = selectedBrand ? getBrandById(selectedBrand) : undefined;
    const seriesObj = selectedBrand && selectedSeries ? getSeriesByBrandAndId(selectedBrand, selectedSeries) : undefined;
    
    onChange({
      brand: selectedBrand || undefined,
      series: selectedSeries || undefined,
      model: undefined,
      brandName: brand?.name,
      seriesName: seriesObj?.name,
      modelName: undefined
    });
  }, [selectedBrand, selectedSeries, isInitialized]);

  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId);
    setSelectedSeries('');
  };

  const handleSeriesChange = (seriesId: string) => {
    setSelectedSeries(seriesId);
  };

  // Render only the specific field type
  const renderSingleField = () => {
    if (fieldType === 'brand') {
      return (
        <div className="space-y-2">
          <Label htmlFor="brand-select">
            Marka {required && <span className="text-red-500">*</span>}
          </Label>
          <Select value={selectedBrand} onValueChange={(brandId) => {
            setSelectedBrand(brandId);
            onChange({ brand: brandId, brandName: getBrandById(brandId)?.name });
          }}>
            <SelectTrigger id="brand-select">
              <SelectValue placeholder="Marka seçiniz" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  <div className="flex items-center gap-2">
                    <span>{brand.name}</span>
                    <span className="text-xs text-gray-500">({brand.country})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (fieldType === 'series') {
      // Use dependentValue (brand) to get series
      const brandId = typeof dependentValue === 'string' ? dependentValue : String(dependentValue || '');
      const availableSeries = brandId ? getSeriesByBrand(brandId) : [];
      
      return (
        <div className="space-y-2">
          <Label htmlFor="series-select">
            Seri {required && <span className="text-red-500">*</span>}
          </Label>
          <Select 
            value={selectedSeries} 
            onValueChange={(seriesId) => {
              setSelectedSeries(seriesId);
              const seriesObj = brandId ? getSeriesByBrandAndId(brandId, seriesId) : undefined;
              onChange({ series: seriesId, seriesName: seriesObj?.name });
            }}
            disabled={!brandId || availableSeries.length === 0}
          >
            <SelectTrigger id="series-select">
              <SelectValue placeholder={brandId ? "Seri seçiniz" : "Önce marka seçiniz"} />
            </SelectTrigger>
            <SelectContent>
              {availableSeries.map((seriesItem) => (
                <SelectItem key={seriesItem.id} value={seriesItem.id}>
                  {seriesItem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Default: show all fields
    return null;
  };

  // Always render only the specific field when fieldType is provided
  if (fieldType) {
    return (
      <div className={className}>
        {renderSingleField()}
      </div>
    );
  }

  // Default: show all fields (for backward compatibility)
  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="brand-select">
            Marka {required && <span className="text-red-500">*</span>}
          </Label>
          <Select value={selectedBrand} onValueChange={handleBrandChange}>
            <SelectTrigger id="brand-select">
              <SelectValue placeholder="Marka seçiniz" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  <div className="flex items-center gap-2">
                    <span>{brand.name}</span>
                    <span className="text-xs text-gray-500">({brand.country})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedBrand && (
          <div className="space-y-2">
            <Label htmlFor="series-select">
              Seri {required && <span className="text-red-500">*</span>}
            </Label>
            <Select value={selectedSeries} onValueChange={handleSeriesChange}>
              <SelectTrigger id="series-select">
                <SelectValue placeholder="Seri seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {series.map((seriesItem) => (
                  <SelectItem key={seriesItem.id} value={seriesItem.id}>
                    {seriesItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}

export default CarSelector;