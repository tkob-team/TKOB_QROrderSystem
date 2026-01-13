interface SpecialInstructionsSectionProps {
  value: string
  onChange: (value: string) => void
}

export function SpecialInstructionsSection({ value, onChange }: SpecialInstructionsSectionProps) {
  return (
    <div className="p-4 border-b" style={{ borderColor: 'var(--gray-200)' }}>
      <h3 className="mb-3" style={{ color: 'var(--gray-900)' }}>
        Special instructions
      </h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="No onions, extra cheese, etc."
        className="w-full p-3 rounded-xl border resize-none focus:outline-none focus:ring-2"
        style={{
          borderColor: 'var(--gray-300)',
          backgroundColor: 'white',
          color: 'var(--gray-900)',
        }}
        rows={3}
      />
    </div>
  )
}
