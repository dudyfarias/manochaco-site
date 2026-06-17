import { albums } from "@/data/albums";
import { competitions } from "@/data/competitions";
import { matches } from "@/data/matches";
import { photoPlayers, photos } from "@/data/photos";
import { players } from "@/data/players";

export function getPlayerBySlug(slug: string) {
  return players.find((player) => player.slug === slug);
}

export function getMatchBySlug(slug: string) {
  return matches.find((match) => match.slug === slug);
}

export function getCompetitionById(id: string) {
  return competitions.find((competition) => competition.id === id);
}

export function getAlbumById(id: string) {
  return albums.find((album) => album.id === id);
}

export function getPhotosForPlayer(playerSlug: string) {
  const relatedPhotoIds = photoPlayers
    .filter((relation) => relation.playerSlug === playerSlug)
    .map((relation) => relation.photoId);

  return photos.filter((photo) => relatedPhotoIds.includes(photo.id));
}

export function getPlayersForPhoto(photoId: string) {
  const relatedPlayerSlugs = photoPlayers
    .filter((relation) => relation.photoId === photoId)
    .map((relation) => relation.playerSlug);

  return players.filter((player) => relatedPlayerSlugs.includes(player.slug));
}

export function getMatchesForPlayer(playerSlug: string) {
  return matches.filter((match) => match.relatedPlayerSlugs.includes(playerSlug));
}

export function getPlayedMatches() {
  return matches
    .filter((match) => match.status === "played")
    .sort((first, second) => second.date.localeCompare(first.date));
}

export function getScheduledMatches() {
  return matches
    .filter((match) => match.status === "scheduled")
    .sort((first, second) => first.date.localeCompare(second.date));
}
