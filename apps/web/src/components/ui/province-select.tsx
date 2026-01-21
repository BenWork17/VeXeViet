'use client'

import * as React from 'react'
import { Check, ChevronDown, MapPin, Search } from 'lucide-react'
import { cn } from '@vexeviet/ui'
import { VIETNAM_PROVINCES, searchProvinces, type Province } from '@/lib/data/provinces'

interface ProvinceSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: string
}

export function ProvinceSelect({
  value,
  onValueChange,
  placeholder = 'Chọn tỉnh/thành',
  disabled = false,
  className,
  error
}: ProvinceSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  const selectedProvince = VIETNAM_PROVINCES.find(p => p.name === value)
  const filteredProvinces = React.useMemo(() => searchProvinces(searchQuery), [searchQuery])

  const handleSelect = (provinceName: string) => {
    onValueChange(provinceName)
    setSearchQuery('')
    setOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    setOpen(true)
  }

  const handleInputFocus = () => {
    setOpen(true)
  }

  const handleInputBlur = () => {
    setTimeout(() => setOpen(false), 200)
  }

  // Group by region
  const northProvinces = filteredProvinces.filter(p => p.region === 'north')
  const centralProvinces = filteredProvinces.filter(p => p.region === 'central')
  const southProvinces = filteredProvinces.filter(p => p.region === 'south')

  return (
    <div className="relative space-y-1.5">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery || selectedProvince?.name || ''}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full h-12 pl-9 pr-10 rounded-xl border-2 border-gray-200 bg-white text-sm',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
            'disabled:bg-gray-50 disabled:cursor-not-allowed',
            'placeholder:text-gray-400',
            error && 'border-red-500',
            className
          )}
        />
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <ChevronDown className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform",
          open && "rotate-180"
        )} />
      </div>

      {open && filteredProvinces.length > 0 && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[240px] overflow-y-auto">
          {northProvinces.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-bold text-gray-600 bg-gray-50 sticky top-0 z-10">
                Miền Bắc
              </div>
              {northProvinces.map((province) => (
                <button
                  key={province.id}
                  type="button"
                  onClick={() => handleSelect(province.name)}
                  className={cn(
                    'w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors',
                    value === province.name && 'bg-primary/5 text-primary font-medium'
                  )}
                >
                  <Check
                    className={cn(
                      'h-4 w-4 shrink-0',
                      value === province.name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {province.displayName || province.name}
                </button>
              ))}
            </div>
          )}

          {centralProvinces.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-bold text-gray-600 bg-gray-50 sticky top-0 z-10">
                Miền Trung
              </div>
              {centralProvinces.map((province) => (
                <button
                  key={province.id}
                  type="button"
                  onClick={() => handleSelect(province.name)}
                  className={cn(
                    'w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors',
                    value === province.name && 'bg-primary/5 text-primary font-medium'
                  )}
                >
                  <Check
                    className={cn(
                      'h-4 w-4 shrink-0',
                      value === province.name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {province.displayName || province.name}
                </button>
              ))}
            </div>
          )}

          {southProvinces.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-bold text-gray-600 bg-gray-50 sticky top-0 z-10">
                Miền Nam
              </div>
              {southProvinces.map((province) => (
                <button
                  key={province.id}
                  type="button"
                  onClick={() => handleSelect(province.name)}
                  className={cn(
                    'w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors',
                    value === province.name && 'bg-primary/5 text-primary font-medium'
                  )}
                >
                  <Check
                    className={cn(
                      'h-4 w-4 shrink-0',
                      value === province.name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {province.displayName || province.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-[10px] font-medium text-red-500 ml-2">{error}</p>}
    </div>
  )
}
