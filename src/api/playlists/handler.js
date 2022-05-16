/* eslint-disable camelcase */
const ClientError = require('../../exceptions/ClientError')

class PlaylistsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this)
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this)
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this)
  }

  async postPlaylistHandler (request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload)
      const {
        name
      } = request.payload

      const {
        id: credentialId
      } = request.auth.credentials

      const playlistId = await this._service.addPlaylists({
        name, credentialId
      })

      const response = h.response({
        status: 'success',
        message: 'Playlist Successfully Added',
        data: {
          playlistId
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
      console.log(error)
      return response
    }
  }

  async getPlaylistsHandler (request, h) {
    try {
      const {
        id: credentialId
      } = request.auth.credentials

      const playlists = await this._service.getPlaylists(credentialId)

      return {
        status: 'success',
        data: {
          playlists
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
      console.log(error)
      return response
    }
  }

  async deletePlaylistByIdHandler (request, h) {
    try {
      const {
        id
      } = request.params

      const {
        id: credentialId
      } = request.auth.credentials

      await this._service.checkPlaylistOwner(id, credentialId)
      await this._service.deletePlaylistById(id)

      return {
        status: 'success',
        message: 'Playlist Successfully Deleted'
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
        status: 'fail',
        message: 'Internal Server Error'
      })
      response.code(500)
      console.log(error)
      return response
    }
  }
}

module.exports = PlaylistsHandler
