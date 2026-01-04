"use client"

import { RulerIcon } from "lucide-react"

import UnitConverterInput from "@/components/search/unit-converter-input"
import UnitConverterResult from "@/components/search/unit-converter-result"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUnitConversion } from "@/hooks/use-unit-conversion"

interface UnitConverterProps {
  initialQuery: string
}

const UnitConverterWidget = ({ initialQuery }: UnitConverterProps) => {
  const { value, fromUnit, toUnit, setValue, setFromUnit, setToUnit, result } =
    useUnitConversion(initialQuery)

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
          <UnitConverterInput
            value={value}
            fromUnit={fromUnit}
            toUnit={toUnit}
            onValueChange={setValue}
            onFromUnitChange={setFromUnit}
            onToUnitChange={setToUnit}
          />
          <UnitConverterResult
            value={value}
            fromUnit={fromUnit}
            toUnit={toUnit}
            result={result}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default UnitConverterWidget
