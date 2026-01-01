"use client"

import { useEffect, useState } from "react"
import { CloudIcon, LoaderIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface WeatherProps {
  initialQuery: string
}

interface WeatherData {
  location: string
  temperature: string
  condition: string
  humidity: string
  windSpeed: string
}

const WeatherWidget = ({ initialQuery }: WeatherProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError(null)

        const locationMatch = /weather\s+(?:in\s+)?(.+)|(.+)\s+weather/i.exec(
          initialQuery,
        )
        const location = locationMatch?.[1] ?? locationMatch?.[2] ?? "current"

        const response = await fetch(
          `https://wttr.in/${encodeURIComponent(location)}?format=j1`,
        )

        if (!response.ok) {
          throw new Error("Failed to fetch weather data")
        }

        const weatherData = await response.json()

        if (weatherData.current_condition?.[0]) {
          const current = weatherData.current_condition[0]
          const area = weatherData.nearest_area?.[0]

          setWeather({
            location:
              area?.areaName?.[0]?.value ??
              area?.region?.[0]?.value ??
              location,
            temperature: `${current.temp_C}°C / ${current.temp_F}°F`,
            condition: current.weatherDesc?.[0]?.value ?? "Unknown",
            humidity: `${current.humidity}%`,
            windSpeed: `${current.windspeedKmph} km/h`,
          })
        } else {
          throw new Error("Invalid weather data")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch weather")
      } finally {
        setLoading(false)
      }
    }

    void fetchWeather()
  }, [initialQuery])

  return (
    <Card className="bg-accent/30 mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CloudIcon className="h-5 w-5" />
          <CardTitle className="text-base">Weather</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center gap-2">
            <LoaderIcon className="h-4 w-4 animate-spin" />
            <span className="text-muted-foreground text-sm">
              Loading weather data...
            </span>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-500">
            Unable to fetch weather data. Please try again.
          </div>
        )}

        {weather && !loading && !error && (
          <div className="space-y-3">
            <div>
              <p className="text-muted-foreground text-sm">Location</p>
              <p className="text-lg font-semibold">{weather.location}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Temperature</p>
                <p className="text-2xl font-semibold">{weather.temperature}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Condition</p>
                <p className="text-lg font-medium">{weather.condition}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Humidity</p>
                <p className="font-medium">{weather.humidity}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Wind Speed</p>
                <p className="font-medium">{weather.windSpeed}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default WeatherWidget
