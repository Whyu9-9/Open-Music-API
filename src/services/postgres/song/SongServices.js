/* eslint-disable camelcase */
const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../../exceptions/InvariantError')
const NotFoundError = require('../../../exceptions/NotFoundError')
const { mapSongResponse } = require('../../../utils')

class SongsService {
  constructor () {
    this._pool = new Pool()
  }

  async addSong ({
    title, year, genre, performer, duration, album_id
  }) {
    const id = 'song-' + nanoid(16)
    const insertedAt = new Date().toISOString()
    const updatedAt = insertedAt

    if (album_id) {
      const checkIfAlbumExist = {
        text: 'SELECT * FROM albums WHERE id = $1',
        values: [album_id]
      }

      const check = await this._pool.query(checkIfAlbumExist)

      if (!check.rows.length) {
        throw new InvariantError('Album not found')
      }

      const query = {
        text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',

        values: [id, title, year, genre, performer, duration, album_id, insertedAt, updatedAt]
      }
      console.log(query.values)
      const result = await this._pool.query(query)

      if (!result.rows[0].id) {
        throw new InvariantError('Song Failed to Add')
      }

      return result.rows[0].id
    }

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',

      values: [id, title, year, genre, performer, duration, album_id, insertedAt, updatedAt]
    }
    console.log(query.values)
    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Song Failed to Add')
    }

    return result.rows[0].id
  }

  async getSongs (title, performer) {
    if (title || performer) {
      if (title && performer) {
        const query = {
          text: 'SELECT id, title, performer FROM songs WHERE title = $1 and performer = $2',
          values: [title, performer]
        }

        const result = await this._pool.query(query)

        return result.rows
      } else if (title) {
        const query = {
          text: 'SELECT id, title, performer FROM songs WHERE title = $1',
          values: [title]
        }

        const result = await this._pool.query(query)

        return result.rows
      } else if (performer) {
        const query = {
          text: 'SELECT id, title, performer FROM songs WHERE performer = $1',
          values: [performer]
        }

        const result = await this._pool.query(query)

        return result.rows
      }
    } else {
      const query = {
        text: 'SELECT id, title, performer FROM songs',
        values: []
      }

      const result = await this._pool.query(query)

      return result.rows
    }
  }

  async getSongById (id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Song not found')
    }

    return result.rows.map(mapSongResponse)[0]
  }

  async getSongsByAlbum (id) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    return result.rows
  }

  async getSongsByPlaylist (id) {
    const query = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM songs LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id WHERE playlist_songs.playlist_id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    return result.rows
  }

  async editSongById (id, {
    title, year, genre, performer, duration, album_id
  }) {
    const updatedAt = new Date().toISOString()
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 ,updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, genre, performer, duration, album_id, updatedAt, id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Failed Updating Song. Id not found')
    }
  }

  async deleteSongById (id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Failed deleting song. Id not found')
    }
  }
}

module.exports = SongsService
