import { useMemo, useState } from "react"

interface UnitConversionResult {
  value: string
  fromUnit: string
  toUnit: string
  setValue: (value: string) => void
  setFromUnit: (unit: string) => void
  setToUnit: (unit: string) => void
  result: string | null
}

const CONVERSION_RATES: Record<string, Record<string, number>> = {
  distance: {
    miles: 1,
    mi: 1,
    km: 1.60934,
    kilometers: 1.60934,
    m: 1609.34,
    meters: 1609.34,
    ft: 5280,
    feet: 5280,
    inches: 63360,
    in: 63360,
  },
  temperature: {},
  weight: {
    lb: 1,
    pounds: 1,
    kg: 0.453592,
    kilograms: 0.453592,
    g: 453.592,
    grams: 453.592,
    oz: 16,
    ounces: 16,
  },
  volume: {
    gal: 1,
    gallons: 1,
    l: 3.78541,
    liters: 3.78541,
    ml: 3785.41,
    milliliters: 3785.41,
    cups: 16,
  },
  time: {
    seconds: 1,
    sec: 1,
    s: 1,
    minutes: 60,
    min: 60,
    m: 60,
    hours: 3600,
    hr: 3600,
    h: 3600,
    days: 86400,
    d: 86400,
  },
}

const convertTemperature = (
  val: number,
  from: string,
  to: string,
): string | null => {
  let celsius = val

  if (from === "f") celsius = ((val - 32) * 5) / 9
  else if (from === "k") celsius = val - 273.15

  let result = celsius
  if (to === "f") result = (celsius * 9) / 5 + 32
  else if (to === "k") result = celsius + 273.15

  return result.toFixed(2).replace(/\.?0+$/, "")
}

const convert = (val: number, from: string, to: string): string | null => {
  if (
    from === "f" ||
    from === "c" ||
    from === "k" ||
    to === "f" ||
    to === "c" ||
    to === "k"
  ) {
    return convertTemperature(val, from, to)
  }

  for (const category of Object.values(CONVERSION_RATES)) {
    if (category[from] && category[to]) {
      const result = (val * category[to]) / category[from]
      return result.toFixed(4).replace(/\.?0+$/, "")
    }
  }

  return null
}

const parseQuery = (query: string) => {
  const regex = /(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s+(?:to|in)\s+([a-zA-Z]+)/i
  const match = regex.exec(query)

  if (match) {
    const [, value, fromUnit, toUnit] = match
    return {
      value: parseFloat(value),
      fromUnit: fromUnit.toLowerCase(),
      toUnit: toUnit.toLowerCase(),
    }
  }

  return null
}

export const useUnitConversion = (
  initialQuery: string,
): UnitConversionResult => {
  const parsed = useMemo(() => parseQuery(initialQuery), [initialQuery])

  const [value, setValue] = useState(parsed?.value.toString() ?? "1")
  const [fromUnit, setFromUnit] = useState(parsed?.fromUnit ?? "miles")
  const [toUnit, setToUnit] = useState(parsed?.toUnit ?? "km")

  const result = useMemo(() => {
    const numValue = parseFloat(value) || 0
    return convert(numValue, fromUnit, toUnit)
  }, [value, fromUnit, toUnit])

  return {
    value,
    fromUnit,
    toUnit,
    setValue,
    setFromUnit,
    setToUnit,
    result,
  }
}
