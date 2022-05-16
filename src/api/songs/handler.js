/* eslint-disable camelcase */
const ClientError = require('../../exceptions/ClientError')

class SongsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    this.postSongHandler = this.postSongHandler.bind(this)
    this.getSongsHandler = this.getSongsHandler.bind(this)
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this)
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this)
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this)
  }

  async postSongHandler (request, h) {
    try {
      this._validator.validateSongPayload(request.payload)
      const {
        title, year, performer, genre, duration, album_id
      } = request.payload

      const songId = await this._service.addSong({
        title, year, performer, genre, duration, album_id
      })

      const response = h.response({
        status: 'success',
        message: 'Song Successfully Added',
        data: {
          songId
        }
      })
      response.code(201)
      return response
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
      }

      const response = h.response({
        status: 'error',
        message: 'Internal Server Error'
      })
      response.code(500)
      console.error(error)
      return response
    }
  }

  async getSongsHandler (request, h) {
    try {
      const { title, performer } = request.query
      const songs = await this._service.getSongs(title, performer)
      return {
        status: 'success',
        data: {
          songs
        }
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
      }

      const response = h.response({
        status: 'error',
        message: 'Internal Server Error'
      })
      response.code(500)
      console.error(error)
      return response
    }
  }

  async getSongByIdHandler (request, h) {
    try {
      const { id } = request.params
      const song = await this._service.getSongById(id)
      return {
        status: 'success',
        data: {
          song
        }
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
      }

      const response = h.response({
        status: 'error',
        message: 'Internal Server Error'
      })
      response.code(500)
      console.error(error)
      return response
    }
  }

  async putSongByIdHandler (request, h) {
    try {
      this._validator.validateSongPayload(request.payload)
      const { id } = request.params

      await this._service.editSongById(id, request.payload)

      return {
        status: 'success',
        message: 'Song Successfully Updated'
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
      }

      const response = h.response({
        status: 'error',
        message: 'Internal Server Error'
      })
      response.code(500)
      console.error(error)
      return response
    }
  }

  async deleteSongByIdHandler (request, h) {
    try {
      const { id } = request.params
      await this._service.deleteSongById(id)
      return {
        status: 'success',
        message: 'Song Successfully Deleted'
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
      }

      const response = h.response({
        status: 'error',
        message: 'Internal Server Error'
      })
      response.code(500)
      console.error(error)
      return response
    }
  }
}

module.exports = SongsHandler
