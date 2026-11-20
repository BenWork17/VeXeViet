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
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({})
  const inputRef = React.useRef<HTMLInputElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const listboxId = React.useId()

  const selectedProvince = VIETNAM_PROVINCES.find(p => p.name === value)
  const selectedName = selectedProvince?.name ?? ''
  const filteredProvinces = React.useMemo(() => searchProvinces(searchQuery), [searchQuery])
  const regions = React.useMemo(
    () => [
      { label: 'Miền Bắc', provinces: filteredProvinces.filter(p => p.region === 'north') },
      { label: 'Miền Trung', provinces: filteredProvinces.filter(p => p.region === 'central') },
      { label: 'Miền Nam', provinces: filteredProvinces.filter(p => p.region === 'south') },
    ],
    [filteredProvinces],
  )
  const orderedProvinces = React.useMemo(
    () => regions.flatMap(region => region.provinces),
    [regions],
  )
  const activeProvince = activeIndex >= 0 ? orderedProvinces[activeIndex] : undefined

  const updateDropdownPosition = React.useCallback(() => {
    const input = inputRef.current
    if (!input) return

    const rect = input.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom - 8
    const spaceAbove = rect.top - 8
    const openAbove = spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow
    const availableSpace = Math.max(openAbove ? spaceAbove : spaceBelow, 0)

    const nextStyle: React.CSSProperties = {
      position: 'fixed',
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      top: openAbove ? undefined : `${rect.bottom + 4}px`,
      bottom: openAbove ? `${window.innerHeight - rect.top + 4}px` : undefined,
      maxHeight: `${Math.min(DROPDOWN_MAX_HEIGHT, availableSpace)}px`,
      zIndex: 99999,
    }

    setDropdownStyle((prev) => {
      if (
        prev.left === nextStyle.left &&
        prev.width === nextStyle.width &&
        prev.top === nextStyle.top &&
        prev.bottom === nextStyle.bottom &&
        prev.maxHeight === nextStyle.maxHeight
      ) {
        return prev
      }
      return nextStyle
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

    let rafId: number | null = null

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (inputRef.current?.contains(target)) return
      if (dropdownRef.current?.contains(target)) return
      setOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    const scheduleReposition = (event?: Event) => {
      if (event?.target instanceof Node && dropdownRef.current?.contains(event.target)) {
        return
      }
      if (rafId !== null) return
      rafId = window.requestAnimationFrame(() => {
        rafId = null
        updateDropdownPosition()
      })
    }

    const scrollOptions: AddEventListenerOptions = { capture: true, passive: true }

    document.addEventListener('mousedown', handlePointerDown, true)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', scheduleReposition, scrollOptions)
    window.addEventListener('resize', scheduleReposition, { passive: true })

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
      document.removeEventListener('mousedown', handlePointerDown, true)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', scheduleReposition, scrollOptions)
      window.removeEventListener('resize', scheduleReposition)
    }
  }, [open, updateDropdownPosition])

  React.useEffect(() => {
    if (!open) {
      setActiveIndex(-1)
      return
    }
    const selectedIdx = orderedProvinces.findIndex(p => p.name === value)
    setActiveIndex(selectedIdx >= 0 ? selectedIdx : orderedProvinces.length > 0 ? 0 : -1)
  }, [open, searchQuery, orderedProvinces, value])

  React.useEffect(() => {
    if (!open || !activeProvince) return
    const optionEl = document.getElementById(`${listboxId}-opt-${activeProvince.id}`)
    optionEl?.scrollIntoView({ block: 'nearest' })
  }, [open, activeProvince, listboxId])

  const handleSelect = (provinceName: string) => {
    setInputValue(provinceName)
    setSearchQuery('')
    onValueChange(provinceName)
    setOpen(false)
    setActiveIndex(-1)
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

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) {
        updateDropdownPosition()
        setOpen(true)
        return
      }
      if (orderedProvinces.length === 0) return
      setActiveIndex((prev) => (prev + 1) % orderedProvinces.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        updateDropdownPosition()
        setOpen(true)
        return
      }
      if (orderedProvinces.length === 0) return
      setActiveIndex((prev) => (prev <= 0 ? orderedProvinces.length - 1 : prev - 1))
      return
    }

    if (event.key === 'Enter' && open) {
      const target = activeProvince ?? (orderedProvinces.length === 1 ? orderedProvinces[0] : undefined)
      if (target) {
        event.preventDefault()
        handleSelect(target.name)
      }
      return
    }

    if (event.key === 'Escape' && open) {
      event.preventDefault()
      setOpen(false)
    }
  }

  return (
    <div className="relative space-y-1.5">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          role="combobox"
          aria-expanded={open && orderedProvinces.length > 0}
          aria-autocomplete="list"
          aria-controls={open && orderedProvinces.length > 0 ? listboxId : undefined}
          aria-activedescendant={
            open && activeProvince ? `${listboxId}-opt-${activeProvince.id}` : undefined
          }
          className={cn(
            'province-input',
            error && 'border-error',
            className
          )}
        />
        <MapPin className="province-icon" aria-hidden="true" />
        <ChevronDown className={cn('province-chevron', open && 'is-open')} aria-hidden="true" />
      </div>

      {open && orderedProvinces.length > 0 && typeof document !== 'undefined' && createPortal(
        <div
          id={listboxId}
          ref={dropdownRef}
          role="listbox"
          aria-label="Danh sách tỉnh thành"
          style={dropdownStyle}
          className="province-popover overflow-y-auto overscroll-contain"
        >
          {regions.map((region) => region.provinces.length > 0 && (
            <div key={region.label} role="group" aria-label={region.label}>
              <div className="province-region" aria-hidden="true">
                {region.label}
              </div>
              {region.provinces.map((province) => {
                const flatIndex = orderedProvinces.indexOf(province)
                const isSelected = value === province.name
                const isActive = flatIndex === activeIndex

                return (
                  <button
                    key={province.id}
                    id={`${listboxId}-opt-${province.id}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(flatIndex)}
                    onClick={() => handleSelect(province.name)}
                    className={cn(
                      'province-option',
                      isSelected && 'is-selected',
                      isActive && 'is-active'
                    )}
                  >
                    <Check
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                      aria-hidden="true"
                    />
                    {province.displayName || province.name}
                  </button>
                )
              })}
            </div>
          ))}
        </div>,
        document.body
      )}

      {error && <p className="text-xs font-normal text-error-ink ml-2 mt-1">{error}</p>}
    </div>
  )
}
