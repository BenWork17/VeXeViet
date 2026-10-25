'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, MapPin } from 'lucide-react'
import { cn } from '@vexeviet/ui'
import { VIETNAM_PROVINCES, searchProvinces } from '@/lib/data/provinces'

interface ProvinceSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: string
}

const DROPDOWN_MAX_HEIGHT = 232

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
  const [inputValue, setInputValue] = React.useState(value || '')
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({})
  const inputRef = React.useRef<HTMLInputElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const selectedProvince = VIETNAM_PROVINCES.find(p => p.name === value)
  const selectedName = selectedProvince?.name ?? ''
  const filteredProvinces = React.useMemo(() => searchProvinces(searchQuery), [searchQuery])

  const updateDropdownPosition = React.useCallback(() => {
    const input = inputRef.current
    if (!input) return

    const rect = input.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom - 8
    const spaceAbove = rect.top - 8
    const openAbove = spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow
    const availableSpace = Math.max(openAbove ? spaceAbove : spaceBelow, 0)

    setDropdownStyle({
      position: 'fixed',
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      top: openAbove ? undefined : `${rect.bottom + 4}px`,
      bottom: openAbove ? `${window.innerHeight - rect.top + 4}px` : undefined,
      maxHeight: `${Math.min(DROPDOWN_MAX_HEIGHT, availableSpace)}px`,
      zIndex: 99999,
    })
  }, [])

  React.useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setInputValue(value || '')
      setSearchQuery('')
    }
  }, [value])

  React.useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (inputRef.current?.contains(target)) return
      if (dropdownRef.current?.contains(target)) return
      setOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    const handleReposition = () => updateDropdownPosition()

    document.addEventListener('mousedown', handlePointerDown, true)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handleReposition, true)
    window.addEventListener('resize', handleReposition)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown, true)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleReposition, true)
      window.removeEventListener('resize', handleReposition)
    }
  }, [open, updateDropdownPosition])

  const handleSelect = (provinceName: string) => {
    setInputValue(provinceName)
    setSearchQuery('')
    onValueChange(provinceName)
    setOpen(false)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setInputValue(query)
    setSearchQuery(query)
    setOpen(true)
    updateDropdownPosition()

    if (selectedName && query !== selectedName) {
      onValueChange('')
    }
  }

  const handleInputFocus = () => {
    updateDropdownPosition()
    setOpen(true)
  }

  const regions = [
    { label: 'Miền Bắc', provinces: filteredProvinces.filter(p => p.region === 'north') },
    { label: 'Miền Trung', provinces: filteredProvinces.filter(p => p.region === 'central') },
    { label: 'Miền Nam', provinces: filteredProvinces.filter(p => p.region === 'south') },
  ]

  return (
    <div className="relative space-y-1.5">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
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

      {open && filteredProvinces.length > 0 && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="overflow-y-auto overscroll-contain rounded-xl border border-gray-200 bg-white shadow-xl"
        >
          {regions.map((region) => region.provinces.length > 0 && (
            <div key={region.label}>
              <div className="px-3 py-2 text-xs font-bold text-gray-600 bg-gray-50 sticky top-0 z-10">
                {region.label}
              </div>
              {region.provinces.map((province) => (
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
          ))}
        </div>,
        document.body
      )}

      {error && <p className="text-[10px] font-medium text-red-500 ml-2">{error}</p>}
    </div>
  )
}
