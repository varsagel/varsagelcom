'use client'

import { useState, useEffect } from 'react'
import { FieldType } from '@prisma/client'

interface CategoryField {
  id: string
  name: string
  label: string
  type: FieldType
  isRequired: boolean
  options?: any
  placeholder?: string
  validation?: any
}

interface DynamicFormProps {
  fields: CategoryField[]
  values?: Record<string, any>
  onChange: (values: Record<string, any>) => void
  errors?: Record<string, string>
}

export default function DynamicForm({ fields, values = {}, onChange, errors = {} }: DynamicFormProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>(values)

  useEffect(() => {
    setFormValues(values)
  }, [values])

  const handleFieldChange = (fieldName: string, value: any) => {
    const newValues = { ...formValues, [fieldName]: value }
    setFormValues(newValues)
    onChange(newValues)
  }

  const renderField = (field: CategoryField) => {
    const fieldValue = formValues[field.name] || ''
    const fieldError = errors[field.name]

    const baseClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    const errorClasses = fieldError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""

    switch (field.type) {
      case FieldType.TEXT:
      case FieldType.EMAIL:
      case FieldType.PHONE:
      case FieldType.URL:
        return (
          <input
            type={field.type === FieldType.EMAIL ? 'email' : field.type === FieldType.PHONE ? 'tel' : field.type === FieldType.URL ? 'url' : 'text'}
            id={field.name}
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.isRequired}
            className={`${baseClasses} ${errorClasses}`}
          />
        )

      case FieldType.NUMBER:
        return (
          <input
            type="number"
            id={field.name}
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value ? Number(e.target.value) : '')}
            placeholder={field.placeholder}
            required={field.isRequired}
            min={field.validation?.min}
            max={field.validation?.max}
            className={`${baseClasses} ${errorClasses}`}
          />
        )

      case FieldType.TEXTAREA:
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.isRequired}
            rows={4}
            className={`${baseClasses} ${errorClasses}`}
          />
        )

      case FieldType.SELECT:
        return (
          <select
            id={field.name}
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.isRequired}
            className={`${baseClasses} ${errorClasses}`}
          >
            <option value="">Seçiniz...</option>
            {field.options?.values?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case FieldType.MULTISELECT:
        return (
          <select
            id={field.name}
            name={field.name}
            value={fieldValue || []}
            onChange={(e) => {
              const selectedValues = Array.from(e.target.selectedOptions, option => option.value)
              handleFieldChange(field.name, selectedValues)
            }}
            required={field.isRequired}
            multiple
            className={`${baseClasses} ${errorClasses}`}
          >
            {field.options?.values?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case FieldType.RADIO:
        return (
          <div className="space-y-2">
            {field.options?.values?.map((option: string) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name={field.name}
                  value={option}
                  checked={fieldValue === option}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  required={field.isRequired}
                  className="mr-2 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      case FieldType.CHECKBOX:
        return (
          <div className="space-y-2">
            {field.options?.values?.map((option: string) => {
              const isChecked = Array.isArray(fieldValue) ? fieldValue.includes(option) : false
              return (
                <label key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    name={field.name}
                    value={option}
                    checked={isChecked}
                    onChange={(e) => {
                      const currentValues = Array.isArray(fieldValue) ? fieldValue : []
                      if (e.target.checked) {
                        handleFieldChange(field.name, [...currentValues, option])
                      } else {
                        handleFieldChange(field.name, currentValues.filter((v: string) => v !== option))
                      }
                    }}
                    className="mr-2 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              )
            })}
          </div>
        )

      case FieldType.BOOLEAN:
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              name={field.name}
              checked={fieldValue === true}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              className="mr-2 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Evet</span>
          </label>
        )

      case FieldType.DATE:
        return (
          <input
            type="date"
            id={field.name}
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.isRequired}
            className={`${baseClasses} ${errorClasses}`}
          />
        )

      case FieldType.FILE:
        return (
          <input
            type="file"
            id={field.name}
            name={field.name}
            onChange={(e) => handleFieldChange(field.name, e.target.files?.[0])}
            required={field.isRequired}
            className={`${baseClasses} ${errorClasses}`}
          />
        )

      default:
        return (
          <input
            type="text"
            id={field.name}
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.isRequired}
            className={`${baseClasses} ${errorClasses}`}
          />
        )
    }
  }

  return (
    <div className="space-y-6">
      {fields.map((field) => (
        <div key={field.id}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
            {field.label}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(field)}
          {errors[field.name] && (
            <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
          )}
        </div>
      ))}
    </div>
  )
}