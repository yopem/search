"use client"

import dynamic from "next/dynamic"

const CalculatorWidget = dynamic(
  () => import("@/components/search/instant-answer-calculator"),
  { ssr: false },
)

const UnitConverterWidget = dynamic(
  () => import("@/components/search/instant-answer-unit-converter"),
  { ssr: false },
)

const WeatherWidget = dynamic(
  () => import("@/components/search/instant-answer-weather"),
  { ssr: false },
)

interface InstantAnswer {
  type: string
  data: string
}

interface SearchInstantAnswersProps {
  instantAnswer: InstantAnswer | null
  showCalculator?: boolean
  showUnitConverter?: boolean
  showWeather?: boolean
}

const SearchInstantAnswers = ({
  instantAnswer,
  showCalculator = true,
  showUnitConverter = true,
  showWeather = true,
}: SearchInstantAnswersProps) => {
  if (!instantAnswer) return null

  return (
    <>
      {instantAnswer.type === "calculator" && showCalculator && (
        <CalculatorWidget initialExpression={instantAnswer.data} />
      )}

      {instantAnswer.type === "unitConverter" && showUnitConverter && (
        <UnitConverterWidget initialQuery={instantAnswer.data} />
      )}

      {instantAnswer.type === "weather" && showWeather && (
        <WeatherWidget initialQuery={instantAnswer.data} />
      )}
    </>
  )
}

export default SearchInstantAnswers
