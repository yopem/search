"use client"

import { useState } from "react"
import { CalculatorIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface CalculatorProps {
  initialExpression: string
}

const CalculatorWidget = ({ initialExpression }: CalculatorProps) => {
  const [expression, setExpression] = useState(initialExpression)
  const [result, setResult] = useState<string | null>(null)

  const calculate = (expr: string): string | null => {
    try {
      let processed = expr.replace(/\s/g, "")

      processed = processed.replace(/sqrt\(([^)]+)\)/g, (_, num) => {
        const val = parseFloat(num)
        return String(Math.sqrt(val))
      })

      processed = processed.replace(
        /pow\(([^,]+),([^)]+)\)/g,
        (_, base, exp) => {
          return String(Math.pow(parseFloat(base), parseFloat(exp)))
        },
      )

      processed = processed.replace(/sin\(([^)]+)\)/g, (_, num) => {
        return String(Math.sin(parseFloat(num)))
      })

      processed = processed.replace(/cos\(([^)]+)\)/g, (_, num) => {
        return String(Math.cos(parseFloat(num)))
      })

      processed = processed.replace(/tan\(([^)]+)\)/g, (_, num) => {
        return String(Math.tan(parseFloat(num)))
      })

      processed = processed.replace(/log\(([^)]+)\)/g, (_, num) => {
        return String(Math.log(parseFloat(num)))
      })

      processed = processed.replace(/(\d+)\^(\d+)/g, (_, base, exp) => {
        return String(Math.pow(parseFloat(base), parseFloat(exp)))
      })

      const safeEval = (expression: string): number | null => {
        const tokens = expression.match(/[+\-*/().\d]+/g)
        if (!tokens || tokens.join("") !== expression) {
          return null
        }

        try {
          // eslint-disable-next-line @typescript-eslint/no-implied-eval
          return new Function("return " + expression)() as number
        } catch {
          return null
        }
      }

      const result = safeEval(processed)

      if (typeof result === "number" && !isNaN(result)) {
        return result.toString()
      }

      return null
    } catch {
      return null
    }
  }

  const handleExpressionChange = (value: string) => {
    setExpression(value)
    const calcResult = calculate(value)
    setResult(calcResult)
  }

  const calculatedResult = result ?? calculate(expression)

  return (
    <Card className="bg-accent/30 mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CalculatorIcon className="h-5 w-5" />
          <CardTitle className="text-base">Calculator</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="calc-expression"
              className="text-muted-foreground text-sm"
            >
              Expression
            </label>
            <Input
              id="calc-expression"
              value={expression}
              onChange={(e) => handleExpressionChange(e.target.value)}
              placeholder="Enter expression (e.g., 2+2, sqrt(16), 5*8)"
              className="mt-1"
            />
          </div>
          {calculatedResult && (
            <div>
              <p className="text-muted-foreground text-sm">Result</p>
              <p className="text-3xl font-semibold">{calculatedResult}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CalculatorWidget
