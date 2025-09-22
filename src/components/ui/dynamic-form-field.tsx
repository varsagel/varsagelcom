"use client";

import React from 'react';
import { Input } from './input';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Label } from './label';
import { CarSelector } from './car-selector';
import { DynamicFormField as DynamicFormFieldType } from '@/data/categories';

interface DynamicFormFieldProps {
  field: DynamicFormFieldType;
  value?: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  error?: string;
}

export function DynamicFormField({ field, value, onChange, error }: DynamicFormFieldProps) {
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={String(value || '')}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={String(value || '')}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
            placeholder={field.placeholder}
            required={field.required}
            min={field.min}
            max={field.max}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={String(value || '')}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'select':
        return (
          <Select value={String(value || '')} onValueChange={onChange}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder || 'Seçiniz'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'car-selector':
        // Convert simple value to object format expected by CarSelector
        const carSelectorValue = typeof value === 'string' ? 
          (field.fieldType === 'brand' ? { brand: value } : 
           field.fieldType === 'series' ? { series: value } : 
           { model: value }) : 
          undefined;
          
        return (
          <CarSelector
            value={carSelectorValue}
            onChange={(carValue) => {
              // Handle CarSelector's object return value
              if (field.fieldType === 'brand') {
                onChange(carValue.brand || '');
              } else if (field.fieldType === 'series') {
                onChange(carValue.series || '');
              } else if (field.fieldType === 'model') {
                onChange(carValue.model || '');
              } else {
                onChange(carValue.brand || '');
              }
            }}
            required={field.required}
            className={error ? 'border-red-500' : ''}
            fieldType={field.fieldType}
            dependentValue={field.dependentValue}
          />
        );

      default:
        return (
          <Input
            type="text"
            value={String(value || '')}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={error ? 'border-red-500' : ''}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {field.description && (
        <p className="text-sm text-gray-500">{field.description}</p>
      )}
    </div>
  );
}

export default DynamicFormField;