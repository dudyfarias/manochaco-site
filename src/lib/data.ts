import {
  albums,
  competitions,
  faceSuggestions,
  matches,
  photoPlayers,
  photos,
  players,
} from "@/data";
import type { Photo, PhotoPlayerTag } from "@/types";

function isPhoto(photo: Photo | undefined): photo is Photo {
  return Boolean(photo);
}

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

export function getAlbumBySlug(slug: string) {
  return albums.find((album) => album.slug === slug);
}

export function getPhotoBySlug(slug: string) {
  return photos.find((photo) => photo.slug === slug);
}

export function getPhotosForAlbum(albumId: string) {
  const album = getAlbumById(albumId);

  if (!album) {
    return [];
  }

  return album.photoIds
    .map((photoId) => photos.find((photo) => photo.id === photoId))
    .filter(isPhoto);
}

export function getPhotosForMatch(matchId: string, fallbackPhotoIds: string[] = []) {
  const relatedPhotoIds = new Set(fallbackPhotoIds);

  photos.forEach((photo) => {
    if (photo.matchId === matchId) {
      relatedPhotoIds.add(photo.id);
    }
  });

  return [...relatedPhotoIds]
    .map((photoId) => photos.find((photo) => photo.id === photoId))
    .filter(isPhoto);
}

export function getAlbumForMatch(matchId: string) {
  return albums.find((album) => album.matchId === matchId);
}

export function isPublicPhotoTag(tag: PhotoPlayerTag) {
  return (
    tag.confirmedByAdmin &&
    (tag.tagType === "manual" || tag.tagType === "ai_confirmed")
  );
}

export function getConfirmedTagsForPhoto(photoId: string) {
  return photoPlayers.filter(
    (relation) => relation.photoId === photoId && isPublicPhotoTag(relation),
  );
}

export function getPhotosForPlayer(playerSlug: string) {
  const relatedPhotoIds = photoPlayers
    .filter(
      (relation) =>
        relation.playerSlug === playerSlug && isPublicPhotoTag(relation),
    )
    .map((relation) => relation.photoId);

  return photos.filter((photo) => relatedPhotoIds.includes(photo.id));
}

export function getPlayersForPhoto(photoId: string) {
  const relatedPlayerSlugs = getConfirmedTagsForPhoto(photoId).map(
    (relation) => relation.playerSlug,
  );

  return players.filter((player) => relatedPlayerSlugs.includes(player.slug));
}

export function getPendingFaceSuggestions() {
  return faceSuggestions.filter((suggestion) => suggestion.status === "pending");
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
