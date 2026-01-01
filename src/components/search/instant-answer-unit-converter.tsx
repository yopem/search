"use client"

import { useState } from "react"
import { RulerIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface UnitConverterProps {
  initialQuery: string
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
}

const UnitConverterWidget = ({ initialQuery }: UnitConverterProps) => {
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

  const parsed = parseQuery(initialQuery)
  const [value, setValue] = useState(parsed?.value.toString() ?? "1")
  const [fromUnit, setFromUnit] = useState(parsed?.fromUnit ?? "miles")
  const [toUnit, setToUnit] = useState(parsed?.toUnit ?? "km")

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

  const result = convert(parseFloat(value) || 0, fromUnit, toUnit)

  return (
    <Card className="bg-accent/30 mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <RulerIcon className="h-5 w-5" />
          <CardTitle className="text-base">Unit Converter</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label
                htmlFor="conv-value"
                className="text-muted-foreground text-sm"
              >
                Value
              </label>
              <Input
                id="conv-value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label
                htmlFor="conv-from"
                className="text-muted-foreground text-sm"
              >
                From
              </label>
              <Input
                id="conv-from"
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label
                htmlFor="conv-to"
                className="text-muted-foreground text-sm"
              >
                To
              </label>
              <Input
                id="conv-to"
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          {result && (
            <div>
              <p className="text-muted-foreground text-sm">Result</p>
              <p className="text-2xl font-semibold">
                {value} {fromUnit} = {result} {toUnit}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default UnitConverterWidget
