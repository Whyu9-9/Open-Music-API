/* eslint-disable camelcase */
const mapSongResponse = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumid,
  created_at,
  updated_at
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: albumid,
  insertedAt: created_at,
  updatedAt: updated_at
})

const mapAlbumResponse = ({
  id,
  name,
  year,
  cover,
  created_at,
  updated_at
}) => ({
  id,
  name,
  year,
  coverUrl: cover,
  insertedAt: created_at,
  updatedAt: updated_at
})

module.exports = { mapSongResponse, mapAlbumResponse }
