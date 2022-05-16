const ClientError = require('../../exceptions/ClientError')

class AlbumsHandler {
  constructor (service, validator) {
    const { albumsService, songsService } = service

    this._service = albumsService
    this._songsService = songsService
    this._validator = validator

    this.postAlbumHandler = this.postAlbumHandler.bind(this)
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this)
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this)
    this.getAlbumLikesByIdHandler = this.getAlbumLikesByIdHandler.bind(this)
    this.postAlbumLikeByIdHandler = this.postAlbumLikeByIdHandler.bind(this)
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this)
  }

  async postAlbumHandler (request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload)
      const {
        name, year
      } = request.payload

      const albumId = await this._service.addAlbum({
        name, year
      })

      const response = h.response({
        status: 'success',
        message: 'Album Successfully Added',
        data: {
          albumId
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

  async getAlbumByIdHandler (request, h) {
    try {
      const { id } = request.params
      const album = await this._service.getAlbumById(id)
      const songs = await this._songsService.getSongsByAlbum(id)
      album.songs = songs

      return {
        status: 'success',
        data: {
          album
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

  async putAlbumByIdHandler (request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload)
      const { id } = request.params

      await this._service.editAlbumById(id, request.payload)

      return {
        status: 'success',
        message: 'Album Successfully Updated'
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

  async deleteAlbumByIdHandler (request, h) {
    try {
      const { id } = request.params
      await this._service.deleteAlbumById(id)
      return {
        status: 'success',
        message: 'Album Successfully Deleted'
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

  async getAlbumLikesByIdHandler (request, h) {
    try {
      const { id } = request.params
      const data = await this._service.getAlbumLikesById(id)
      const likes = data.count
      if (data.source) {
        const response = h.response({
          status: 'success',
          data: {
            likes
          }
        })
        response.header('X-Data-Source', data.source)
        response.code(200)
        return response
      } else {
        const response = h.response({
          status: 'success',
          data: {
            likes
          }
        })
        response.code(200)
        return response
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

  async postAlbumLikeByIdHandler (request, h) {
    try {
      const { id } = request.params
      const {
        id: credentialId
      } = request.auth.credentials

      await this._service.checkAlbumIfExist(id)
      const check = await this._service.checkIfUserAlreadyLikeAlbum(id, credentialId)

      if (check != null) {
        await this._service.deleteAlbumLikeById(id, credentialId)
        const response = h.response({
          status: 'success',
          message: 'Album Unliked'
        })
        response.code(201)
        return response
      } else {
        await this._service.addAlbumLikeById(id, credentialId)
        const response = h.response({
          status: 'success',
          message: 'Album Liked'
        })
        response.code(201)
        return response
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

module.exports = AlbumsHandler
