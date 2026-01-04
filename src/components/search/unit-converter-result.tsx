"use client"

interface UnitConverterResultProps {
  value: string
  fromUnit: string
  toUnit: string
  result: string | null
}

const UnitConverterResult = ({
  value,
  fromUnit,
  toUnit,
  result,
}: UnitConverterResultProps) => {
  if (!result) return null

  return (
    <div>
      <p className="text-muted-foreground text-sm">Result</p>
      <p className="text-2xl font-semibold">
        {value} {fromUnit} = {result} {toUnit}
      </p>
    </div>
  )
}

export default UnitConverterResult
