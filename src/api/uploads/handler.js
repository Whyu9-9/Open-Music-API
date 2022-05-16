const ClientError = require('../../exceptions/ClientError')

class UploadsHandler {
  constructor (service, validator) {
    const { albumsService, storageService } = service
    this._service = storageService
    this._albumsService = albumsService
    this._validator = validator

    this.postUploadAlbumCoverHandler = this.postUploadAlbumCoverHandler.bind(this)
  }

  async postUploadAlbumCoverHandler (request, h) {
    try {
      const {
        cover
      } = request.payload

      const {
        id
      } = request.params

      this._validator.validateImageHeaders(cover.hapi.headers)

      const filename = await this._service.writeFile(cover, cover.hapi)
      const url = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`
      await this._albumsService.updateAlbumCover(id, url)

      const response = h.response({
        status: 'success',
        message: 'Album Cover Successfully Uploaded'
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
        message: 'Internal server error'
      })
      response.code(500)
      console.error(error)
      return response
    }
  }
}

module.exports = UploadsHandler
