'use client'

import { useState } from 'react'

interface FiltersProps {
  onFilterChange: (filters: {
    search: string
    amount: string
    deadline: string
  }) => void
}

export function Filters({ onFilterChange }: FiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    amount: '',
    deadline: ''
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">Filter Programs</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Programs
          </label>
          <input
            type="text"
            id="search"
            className="input"
            placeholder="Enter keywords..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Grant Amount
          </label>
          <select
            id="amount"
            className="input"
            value={filters.amount}
            onChange={(e) => handleFilterChange('amount', e.target.value)}
          >
            <option value="">Any Amount</option>
            <option value="under-10k">Under $10,000</option>
            <option value="10k-25k">$10,000 - $25,000</option>
            <option value="25k-50k">$25,000 - $50,000</option>
            <option value="50k-100k">$50,000 - $100,000</option>
            <option value="over-100k">Over $100,000</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
            Deadline
          </label>
          <select
            id="deadline"
            className="input"
            value={filters.deadline}
            onChange={(e) => handleFilterChange('deadline', e.target.value)}
          >
            <option value="">Any Deadline</option>
            <option value="30-days">Within 30 days</option>
            <option value="60-days">Within 60 days</option>
            <option value="90-days">Within 90 days</option>
            <option value="no-deadline">No deadline</option>
          </select>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => {
            const resetFilters = { search: '', amount: '', deadline: '' }
            setFilters(resetFilters)
            onFilterChange(resetFilters)
          }}
          className="btn-secondary"
        >
          Clear Filters
        </button>
      </div>
    </div>
  )
}


