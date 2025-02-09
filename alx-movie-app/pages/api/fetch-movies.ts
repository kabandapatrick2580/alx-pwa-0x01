import { MoviesProps } from "@/interfaces";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === "POST") {
    const { year, page, genre } = request.body;
    const date = new Date();

    const query = new URLSearchParams({
      year: `${year || date.getFullYear()}`,
      sort: "year.decr",
      limit: "12",
      page: `${page}`,
    });

    if (genre) query.append("genre", genre);

    try {
      const resp = await fetch(
        `https://moviesdatabase.p.rapidapi.com/titles?${query.toString()}`,
        {
          headers: {
            "x-rapidapi-host": "moviesdatabase.p.rapidapi.com",
            "x-rapidapi-key": `${process.env.NEXT_PUBLIC_MOVIE_API_KEY}`,
          },
        }
      );

      if (!resp.ok) throw new Error("Failed to fetch movies");

      const moviesResponse = await resp.json();
      const movies: MoviesProps[] = moviesResponse.results || [];

      return response.status(200).json({
        movies,
      });
    } catch (error) {
      console.error(error);
      response.status(500).json({ message: "Internal server error" });
    }
  } else {
    response.setHeader("Allow", ["POST"]);
    response.status(405).end(`Method ${request.method} Not Allowed`);
  }
}
