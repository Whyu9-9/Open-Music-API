const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../../exceptions/InvariantError')
const NotFoundError = require('../../../exceptions/NotFoundError')
const { mapAlbumResponse } = require('../../../utils')

class AlbumsService {
  constructor (cacheService) {
    this._pool = new Pool()
    this._cacheService = cacheService
  }

  async addAlbum ({
    // eslint-disable-next-line camelcase
    name, year
  }) {
    const id = 'album-' + nanoid(16)
    const insertedAt = new Date().toISOString()
    const updatedAt = insertedAt

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      // eslint-disable-next-line camelcase
      values: [id, name, year, 'NULL', insertedAt, updatedAt]
    }
    console.log(query.values)
    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Album Failed to Add')
    }

    return result.rows[0].id
  }

  async getAlbumById (id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album not found')
    }

    return result.rows.map(mapAlbumResponse)[0]
  }

  async getAlbumCover (id) {
    const query = {
      text: 'SELECT cover FROM albums WHERE id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album not found')
    }

    return result.rows[0]
  }

  async editAlbumById (id, {
    // eslint-disable-next-line camelcase
    name, year
  }) {
    const updatedAt = new Date().toISOString()
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      // eslint-disable-next-line camelcase
      values: [name, year, updatedAt, id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Failed Updating Album. Id not found')
    }
  }

  async updateAlbumCover (id, filename) {
    const updatedAt = new Date().toISOString()
    const query = {
      text: 'UPDATE albums SET cover = $1, updated_at = $2 WHERE id = $3 RETURNING id',
      values: [filename, updatedAt, id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Failed updating album cover. Id not found')
    }
  }

  async checkIfUserAlreadyLikeAlbum (albumId, userId) {
    const query = {
      text: 'SELECT user_id FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      return null
    }

    return result
  }

  async checkAlbumIfExist (id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album not found')
    }
  }

  async getAlbumLikesById (albumId) {
    try {
      const result = await this._cacheService.get(`like:${albumId}`)
      return {
        count: JSON.parse(result),
        source: 'cache'
      }
    } catch {
      const query = {
        text: 'SELECT COUNT(id) FROM user_album_likes WHERE album_id = $1',
        values: [albumId]
      }
      const result = await this._pool.query(query)
      const count = result.rows[0].count

      if (!result.rows.length) {
        throw new NotFoundError('Failed getting album likes. Id not found')
      }

      await this._cacheService.set(`like:${albumId}`, JSON.stringify(result.rows[0].count))

      return { count: count }
    }
  }

  async addAlbumLikeById (albumId, userId) {
    const id = 'like-' + nanoid(16)
    const insertedAt = new Date().toISOString()
    const updatedAt = insertedAt
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, albumId, userId, insertedAt, updatedAt]
    }

    const result = await this._pool.query(query)
    await this._cacheService.delete(`like:${albumId}`)

    if (!result.rows[0]) {
      throw new InvariantError('Failed adding album like')
    }
  }

  async deleteAlbumLikeById (albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId]
    }

    const result = await this._pool.query(query)
    await this._cacheService.delete(`like:${albumId}`)

    if (!result.rows[0]) {
      throw new InvariantError('Failed deleting album like')
    }
  }

  async deleteAlbumById (id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Failed deleting album. Id not found')
    }
  }
}

module.exports = AlbumsService
