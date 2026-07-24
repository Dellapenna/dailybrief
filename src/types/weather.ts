export type WeatherPeriod = {
  name: string
  temperature: number
  temperatureUnit: string
  shortForecast: string
  windSpeed: string
  windDirection: string
  isDaytime: boolean
  probabilityOfPrecipitation?: { value: number | null } | null
  icon?: string
}

export type WeatherResponse = {
  location: string | null
  fetchedAt: string
  source: string
  today: WeatherPeriod | null
  tonight: WeatherPeriod | null
  upcoming: WeatherPeriod[]
}
