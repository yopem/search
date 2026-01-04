"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

interface SettingsInstantAnswersProps {
  showCalculator?: boolean
  showUnitConverter?: boolean
  showWeather?: boolean
  onToggleCalculator: (checked: boolean) => void
  onToggleUnitConverter: (checked: boolean) => void
  onToggleWeather: (checked: boolean) => void
  disabled?: boolean
}

const SettingsInstantAnswers = ({
  showCalculator,
  showUnitConverter,
  showWeather,
  onToggleCalculator,
  onToggleUnitConverter,
  onToggleWeather,
  disabled,
}: SettingsInstantAnswersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instant Answers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field className="flex flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <FieldLabel>Show calculator</FieldLabel>
            <FieldDescription>
              Display calculator for mathematical expressions
            </FieldDescription>
          </div>
          <Switch
            checked={showCalculator ?? true}
            onCheckedChange={onToggleCalculator}
            disabled={disabled}
          />
        </Field>

        <Field className="flex flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <FieldLabel>Show unit converter</FieldLabel>
            <FieldDescription>
              Display unit converter for measurements and conversions
            </FieldDescription>
          </div>
          <Switch
            checked={showUnitConverter ?? true}
            onCheckedChange={onToggleUnitConverter}
            disabled={disabled}
          />
        </Field>

        <Field className="flex flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <FieldLabel>Show weather</FieldLabel>
            <FieldDescription>
              Display weather information for location queries
            </FieldDescription>
          </div>
          <Switch
            checked={showWeather ?? true}
            onCheckedChange={onToggleWeather}
            disabled={disabled}
          />
        </Field>
      </CardContent>
    </Card>
  )
}

export default SettingsInstantAnswers
