const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../../exceptions/InvariantError')
const NotFoundError = require('../../../exceptions/NotFoundError')
const AuthorizationError = require('../../../exceptions/AuthorizationError')

class PlaylistsService {
  constructor () {
    this._pool = new Pool()
  }

  async addPlaylists ({
    name, credentialId: owner
  }) {
    const id = 'playlist-' + nanoid()
    const insertedAt = new Date().toISOString()
    const updatedAt = insertedAt
    const query = {
      text: 'INSERT INTO playlists VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, owner, insertedAt, updatedAt]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist Failed to Add')
    }
    return result.rows[0].id
  }

  async getPlaylists (owner) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN users ON users.id = playlists.owner WHERE playlists.owner = $1',
      values: [owner]
    }

    const result = await this._pool.query(query)
    return result.rows
  }

  async getPlaylistsById (id) {
    const querry = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN users ON users.id = playlists.owner WHERE playlists.id = $1',
      values: [id]
    }

    const result = await this._pool.query(querry)

    if (!result.rows.length) {
      throw new NotFoundError('Playlist not found')
    }
    return result.rows[0]
  }

  async checkPlaylistOwner (id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Playlist not found')
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('Not an Authorized User. Access Denied')
    }
  }

  async deletePlaylistById (id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Failed deleting playlist. Id not found')
    }
  }
}

module.exports = PlaylistsService
