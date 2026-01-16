export async function getCropRecommendation(input: {
  soil: string;
  season: string;
  region: string;
}) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/google/flan-t5-base",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `Suggest suitable crops for farming in ${input.region} during ${input.season} season with ${input.soil} soil.`,
      }),
    }
  );

  const data = await response.json();
  return data?.[0]?.generated_text || "No recommendation available";
}
