'use client'

import { useState, useEffect } from 'react'
import { ChevronDownIcon } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  children?: Category[]
  fields?: any[]
}

interface CategorySelectorProps {
  categories: Category[]
  selectedCategoryId?: string
  onCategorySelect: (category: Category) => void
  placeholder?: string
}

export default function CategorySelector({ 
  categories, 
  selectedCategoryId, 
  onCategorySelect, 
  placeholder = "Kategori seçiniz" 
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  useEffect(() => {
    if (selectedCategoryId) {
      const findCategory = (cats: Category[]): Category | null => {
        for (const cat of cats) {
          if (cat.id === selectedCategoryId) {
            return cat
          }
          if (cat.children) {
            const found = findCategory(cat.children)
            if (found) return found
          }
        }
        return null
      }
      const found = findCategory(categories)
      setSelectedCategory(found)
    }
  }, [selectedCategoryId, categories])

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category)
    onCategorySelect(category)
    setIsOpen(false)
  }

  const renderCategories = (cats: Category[], level = 0) => {
    return cats.map((category) => (
      <div key={category.id}>
        <button
          type="button"
          onClick={() => handleCategoryClick(category)}
          className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center ${
            level > 0 ? 'pl-8' : ''
          }`}
        >
          {category.icon && (
            <span className="mr-2 text-lg">{category.icon}</span>
          )}
          <span className="text-sm text-gray-900">{category.name}</span>
        </button>
        {category.children && category.children.length > 0 && (
          <div className="bg-gray-50">
            {renderCategories(category.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <span className="flex items-center">
          {selectedCategory ? (
            <>
              {selectedCategory.icon && (
                <span className="mr-2 text-lg">{selectedCategory.icon}</span>
              )}
              <span className="block truncate">{selectedCategory.name}</span>
            </>
          ) : (
            <span className="block truncate text-gray-500">{placeholder}</span>
          )}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {categories.length > 0 ? (
            renderCategories(categories)
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              Kategori bulunamadı
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}