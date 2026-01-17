import type { ModifierGroupDto } from '@/types'
import { formatUSD } from '@/shared/utils/currency'

interface ModifierGroupsSectionProps {
  modifierGroups: ModifierGroupDto[]
  selectedModifiers: Record<string, string[]>
  onToggle: (groupId: string, optionId: string, maxChoices?: number) => void
}

export function ModifierGroupsSection({
  modifierGroups,
  selectedModifiers,
  onToggle
}: ModifierGroupsSectionProps) {
  if (!modifierGroups || modifierGroups.length === 0) {
    return null
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {modifierGroups.map(group => {
        const selected = selectedModifiers[group.id] || []
        const isRadio = group.maxChoices === 1
        const hasError = group.required && selected.length === 0
        
        return (
          <div key={group.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg" style={{ color: hasError ? 'var(--red-600)' : 'var(--gray-900)' }}>
                {group.name}
              </h3>
              {group.required && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium">
                  Required
                </span>
              )}
            </div>
            
            {group.description && (
              <p className="text-sm" style={{ color: 'var(--gray-600)' }}>
                {group.description}
              </p>
            )}
            
            <div className="text-xs" style={{ color: hasError ? 'var(--red-500)' : 'var(--gray-500)' }}>
              {group.required && group.minChoices > 0 
                ? `Select at least ${group.minChoices}`
                : group.minChoices > 0 
                  ? `Select ${group.minChoices}-${group.maxChoices || 'unlimited'}`
                  : 'Optional'}
            </div>

            <div className="space-y-2">
              {group.options && group.options.length > 0 && group.options
                .filter(opt => opt.active)
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map(option => {
                  const isSelected = selected.includes(option.id)
                  
                  return (
                    <div key={option.id}>
                      <button
                        onClick={() => onToggle(group.id, option.id, group.maxChoices)}
                        className="w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all"
                        style={{
                          borderColor: isSelected ? 'var(--orange-500)' : 'var(--gray-200)',
                          backgroundColor: isSelected ? 'var(--orange-50)' : 'white'
                        }}
                      >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          style={{
                            borderColor: isSelected ? 'var(--orange-500)' : 'var(--gray-300)',
                            backgroundColor: isSelected && isRadio ? 'var(--orange-500)' : 'transparent'
                          }}
                        >
                          {isSelected && !isRadio && (
                            <svg className="w-3 h-3" style={{ color: 'var(--orange-500)' }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {isSelected && isRadio && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        
                        <span 
                          className="font-medium"
                          style={{ color: isSelected ? 'var(--orange-600)' : 'var(--gray-900)' }}
                        >
                          {option.name}
                        </span>
                      </div>

                      {option.priceDelta !== 0 && (
                        <span 
                          className="font-medium"
                          style={{ color: isSelected ? 'var(--orange-600)' : 'var(--gray-600)' }}
                        >
                          {option.priceDelta > 0 ? '+' : ''}
                          {formatUSD(option.priceDelta)}
                        </span>
                      )}
                      </button>
                    </div>
                  )
                })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
