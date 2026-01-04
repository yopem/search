"use client"

import { Input } from "@/components/ui/input"

interface UnitConverterInputProps {
  value: string
  fromUnit: string
  toUnit: string
  onValueChange: (value: string) => void
  onFromUnitChange: (unit: string) => void
  onToUnitChange: (unit: string) => void
}

const UnitConverterInput = ({
  value,
  fromUnit,
  toUnit,
  onValueChange,
  onFromUnitChange,
  onToUnitChange,
}: UnitConverterInputProps) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div>
        <label htmlFor="conv-value" className="text-muted-foreground text-sm">
          Value
        </label>
        <Input
          id="conv-value"
          type="number"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <label htmlFor="conv-from" className="text-muted-foreground text-sm">
          From
        </label>
        <Input
          id="conv-from"
          value={fromUnit}
          onChange={(e) => onFromUnitChange(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <label htmlFor="conv-to" className="text-muted-foreground text-sm">
          To
        </label>
        <Input
          id="conv-to"
          value={toUnit}
          onChange={(e) => onToUnitChange(e.target.value)}
          className="mt-1"
        />
      </div>
    </div>
  )
}

export default UnitConverterInput
