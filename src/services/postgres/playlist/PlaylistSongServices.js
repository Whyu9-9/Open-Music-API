const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../../exceptions/InvariantError')
const NotFoundError = require('../../../exceptions/NotFoundError')

class PlaylistSongsService {
  constructor () {
    this._pool = new Pool()
  }

  async addSongIntoPlaylist (playlistId, songId) {
    const id = 'playlist-song-' + nanoid()
    const insertedAt = new Date().toISOString()
    const updatedAt = insertedAt
    const query = {
      text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, playlistId, songId, insertedAt, updatedAt]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Failed Adding Song to Playlist')
    }
    return result.rows[0].id
  }

  async deleteSongInPlaylist (playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Failed to Delete Song in Playlist. Id not found')
    }
  }
}

module.exports = PlaylistSongsService
