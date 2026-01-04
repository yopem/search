"use client"

import CalculatorWidget from "@/components/search/instant-answer-calculator"
import UnitConverterWidget from "@/components/search/instant-answer-unit-converter"
import WeatherWidget from "@/components/search/instant-answer-weather"

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
