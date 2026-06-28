export async function POST(req) {
  try {
    const { lat, lon } = await req.json();

    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current=temperature_2m,weather_code&temperature_unit=fahrenheit"
    );
    const data = await res.json();

    const code = data.current?.weather_code;
    let condition = "Clear";
    if (code >= 1 && code <= 3) condition = "Cloudy";
    else if (code >= 45 && code <= 48) condition = "Foggy";
    else if (code >= 51 && code <= 67) condition = "Rainy";
    else if (code >= 71 && code <= 77) condition = "Snowy";
    else if (code >= 80 && code <= 82) condition = "Showers";
    else if (code >= 95) condition = "Stormy";

    return Response.json({
      temp: Math.round(data.current?.temperature_2m),
      condition,
    });
  } catch (e) {
    return Response.json({ error: "Could not fetch weather" }, { status: 500 });
  }
}
