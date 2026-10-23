import { createCachedClientLoader } from "../clientCache";
import { servicesContext } from "../context";
import Page from "../../pages/Artist";
import { pageMeta } from "../pageMeta";
export const meta = pageMeta("Artist");
import { artistSlug } from "../../utils/artistSlug";
export async function loader({ context, params }) {
  const artists = await context.get(servicesContext).getArtists();
  const artist = artists.find(a => artistSlug(a.name) === params.artistSlug);
  if (!artist) throw new Response("Artist not found", { status: 404 });
  const shows = await context.get(servicesContext).getShows();
  return { artists: [artist], allShows: shows.filter(s => s.artists.some(a => a.name === artist.name)),
    now: Date.now(), pageTitle: artist.name, image: artist.photo_src };
}
export default function Route({ loaderData }) { return <Page {...loaderData} />; }

export const clientLoader = createCachedClientLoader();
