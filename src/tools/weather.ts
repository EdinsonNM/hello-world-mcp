import { z } from "zod";

type GeocodingResult = {
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
};

type GeocodingResponse = {
    results?: GeocodingResult[];
};

type CurrentWeather = {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    time: string;
};

type ForecastResponse = {
    current_weather?: CurrentWeather;
};

const weatherCodeMap: Record<number, string> = {
    0: "Cielo despejado",
    1: "Mayormente despejado",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Niebla",
    48: "Niebla con escarcha",
    51: "Llovizna ligera",
    53: "Llovizna moderada",
    55: "Llovizna densa",
    56: "Llovizna helada ligera",
    57: "Llovizna helada densa",
    61: "Lluvia ligera",
    63: "Lluvia moderada",
    65: "Lluvia fuerte",
    66: "Lluvia helada ligera",
    67: "Lluvia helada fuerte",
    71: "Nevada ligera",
    73: "Nevada moderada",
    75: "Nevada fuerte",
    77: "Granizo de nieve",
    80: "Chubascos ligeros",
    81: "Chubascos moderados",
    82: "Chubascos fuertes",
    85: "Chubascos de nieve ligeros",
    86: "Chubascos de nieve fuertes",
    95: "Tormenta eléctrica",
    96: "Tormenta con granizo ligero",
    99: "Tormenta con granizo fuerte",
};

export const weatherTool = {
    title: "consultar_clima",
    description: "Consulta el clima actual de una ciudad",
    inputSchema: {
        ciudad: z.string().min(1),
    },
    handler: async ({ ciudad }: { ciudad: string }) => {
        const geocodingUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
        geocodingUrl.searchParams.set("name", ciudad);
        geocodingUrl.searchParams.set("count", "1");
        geocodingUrl.searchParams.set("language", "es");
        geocodingUrl.searchParams.set("format", "json");

        const geocodingResponse = await fetch(geocodingUrl);
        if (!geocodingResponse.ok) {
            return {
                content: [
                    {
                        type: "text",
                        text: "No se pudo consultar la ciudad en el servicio de geolocalización.",
                    },
                ],
            };
        }

        const geocodingData = (await geocodingResponse.json()) as GeocodingResponse;
        const location = geocodingData.results?.[0];

        if (!location) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No se encontró información para la ciudad: ${ciudad}`,
                    },
                ],
            };
        }

        const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
        forecastUrl.searchParams.set("latitude", location.latitude.toString());
        forecastUrl.searchParams.set("longitude", location.longitude.toString());
        forecastUrl.searchParams.set("current_weather", "true");
        forecastUrl.searchParams.set("timezone", "auto");

        const forecastResponse = await fetch(forecastUrl);
        if (!forecastResponse.ok) {
            return {
                content: [
                    {
                        type: "text",
                        text: "No se pudo consultar el clima en el servicio meteorológico.",
                    },
                ],
            };
        }

        const forecastData = (await forecastResponse.json()) as ForecastResponse;
        const weather = forecastData.current_weather;

        if (!weather) {
            return {
                content: [
                    {
                        type: "text",
                        text: "No hay datos meteorológicos disponibles para la ciudad consultada.",
                    },
                ],
            };
        }

        const description = weatherCodeMap[weather.weathercode] ?? "Condición no disponible";

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(
                        {
                            ciudad: location.name,
                            pais: location.country ?? "N/A",
                            temperatura_c: weather.temperature,
                            condicion: description,
                            velocidad_viento_kmh: weather.windspeed,
                            direccion_viento: weather.winddirection,
                            fecha_hora: weather.time,
                        },
                        null,
                        2
                    ),
                },
            ],
        };
    },
};