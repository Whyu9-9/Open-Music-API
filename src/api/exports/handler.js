const ClientError = require('../../exceptions/ClientError')

class ExportsHandler {
  constructor (service, validator) {
    const {
      playlistsService,
      ProducerService
    } = service

    this._service = ProducerService
    this._validator = validator
    this._playlistsService = playlistsService

    this.postExportSongsHandler = this.postExportSongsHandler.bind(this)
  }

  async postExportSongsHandler (request, h) {
    try {
      this._validator.validateExportSongsPayload(request.payload)

      const {
        playlistId
      } = request.params

      const {
        id: credentialId
      } = request.auth.credentials

      await this._playlistsService.checkPlaylistOwner(playlistId, credentialId)

      const message = {
        playlistId,
        targetEmail: request.payload.targetEmail
      }

      await this._service.sendMessage('export:songs', JSON.stringify(message))

      const response = h.response({
        status: 'success',
        message: 'Your request is in the queue. You will receive an email when your request is processed.'
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
}

module.exports = ExportsHandler
