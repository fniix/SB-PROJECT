'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface Country {
  name: string
  code: string
  dialCode: string
  flag: string
  placeholder: string
}

export const COUNTRIES: Country[] = [
  { name: 'Bahrain', code: 'BH', dialCode: '+973', flag: '🇧🇭', placeholder: '3660 0000' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦', placeholder: '50 000 0000' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪', placeholder: '50 000 0000' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965', flag: '🇰🇼', placeholder: '5000 0000' },
  { name: 'Qatar', code: 'QA', dialCode: '+974', flag: '🇶🇦', placeholder: '3000 0000' },
  { name: 'Oman', code: 'OM', dialCode: '+968', flag: '🇴🇲', placeholder: '9000 0000' },
  { name: 'Egypt', code: 'EG', dialCode: '+20', flag: '🇪🇬', placeholder: '10 0000 0000' },
  { name: 'Jordan', code: 'JO', dialCode: '+962', flag: '🇯🇴', placeholder: '7 9000 0000' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧', placeholder: '7700 900000' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸', placeholder: '201 555 0123' },
]

interface CountryPhoneInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
  className?: string
}

export default function CountryPhoneInput({
  value,
  onChange,
  disabled = false,
  required = false,
  className = '',
}: CountryPhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse value to find corresponding country and local number
  const getSelectedCountryAndLocalNumber = (phoneVal: string) => {
    // Sort by dialCode length descending to match longest dialCode first (e.g. +9718 vs +971)
    const sortedCountries = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length)
    
    const trimmedVal = phoneVal.trim()
    for (const country of sortedCountries) {
      if (trimmedVal.startsWith(country.dialCode)) {
        const local = trimmedVal.slice(country.dialCode.length).trim()
        return { country, local }
      }
    }
    // Default to Bahrain if no match
    const defaultCountry = COUNTRIES.find(c => c.code === 'BH') || COUNTRIES[0]
    return { country: defaultCountry, local: trimmedVal }
  }

  const { country: selectedCountry, local: localNumber } = getSelectedCountryAndLocalNumber(value)

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleCountrySelect = (country: Country) => {
    setIsOpen(false)
    setSearchQuery('')
    // Update parent with new country dial code and existing local number
    onChange(`${country.dialCode} ${localNumber}`)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value
    // Filter input value to keep only numbers and spaces
    const cleanVal = rawVal.replace(/[^0-9\s]/g, '')
    onChange(`${selectedCountry.dialCode} ${cleanVal}`)
  }

  // Filter countries by search query
  const filteredCountries = COUNTRIES.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dialCode.includes(searchQuery)
  )

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`flex items-stretch rounded-xl border border-gray-200 bg-white transition-all duration-150 relative overflow-hidden focus-within:border-[#D4A017] focus-within:ring-3 focus-within:ring-[#D4A017]/10 ${
          disabled ? 'opacity-60 pointer-events-none' : ''
        }`}
      >
        {/* Country Code Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 bg-gray-50 border-r border-gray-200 hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none cursor-pointer"
        >
          <span className="text-xl" role="img" aria-label={selectedCountry.name}>
            {selectedCountry.flag}
          </span>
          <span className="text-sm font-semibold text-gray-700">{selectedCountry.dialCode}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Local Number Input */}
        <input
          type="tel"
          required={required}
          disabled={disabled}
          placeholder={selectedCountry.placeholder}
          value={localNumber}
          onChange={handlePhoneChange}
          className="flex-1 bg-transparent px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
        />
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 z-50 mt-1 w-72 rounded-xl bg-white border border-gray-200 shadow-xl overflow-hidden"
          >
            {/* Search Box */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search country..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-gray-700 placeholder-gray-400 focus:outline-none"
                autoFocus
              />
            </div>

            {/* Country List */}
            <div className="max-h-56 overflow-y-auto py-1 divide-y divide-gray-50">
              {filteredCountries.length > 0 ? (
                filteredCountries.map(country => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#D4A017]/5 active:bg-[#D4A017]/10 transition-colors text-left focus:outline-none ${
                      selectedCountry.code === country.code ? 'bg-[#D4A017]/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl" role="img" aria-label={country.name}>
                        {country.flag}
                      </span>
                      <span className="text-xs font-semibold text-gray-700">{country.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-400">{country.dialCode}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-4 text-center text-xs text-gray-400">No country found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
