const ClientError = require('../../exceptions/ClientError')

class PlaylistSongsHandler {
  constructor (service, validator) {
    const {
      playlistSongsService,
      playlistsService,
      songsService
    } = service

    this._service = playlistSongsService
    this._playlistsService = playlistsService
    this._songsService = songsService
    this._validator = validator

    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this)
    this.getSongsOnPlaylistHandler = this.getSongsOnPlaylistHandler.bind(this)
    this.deleteSongInPlaylistHandler = this.deleteSongInPlaylistHandler.bind(this)
  }

  async postSongToPlaylistHandler (request, h) {
    try {
      this._validator.validatePlaylistSongsPayload(request.payload)
      const {
        songId
      } = request.payload

      const {
        id: playlistId
      } = request.params

      const {
        id: credentialId
      } = request.auth.credentials

      await this._playlistsService.checkPlaylistOwner(playlistId, credentialId)
      await this._songsService.getSongById(songId)

      const SongId = await this._service.addSongIntoPlaylist(playlistId, songId)

      const response = h.response({
        status: 'success',
        message: 'Success Adding Song to Playlist',
        data: {
          SongId
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

  async getSongsOnPlaylistHandler (request, h) {
    try {
      const {
        id: credentialId
      } = request.auth.credentials

      const {
        id: playlistId
      } = request.params

      await this._playlistsService.checkPlaylistOwner(playlistId, credentialId)

      const playlist = await this._playlistsService.getPlaylistsById(playlistId)
      const songs = await this._songsService.getSongsByPlaylist(playlistId)

      playlist.songs = songs
      return {
        status: 'success',
        data: {
          playlist
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

  async deleteSongInPlaylistHandler (request, h) {
    try {
      this._validator.validatePlaylistSongsPayload(request.payload)
      const {
        songId
      } = request.payload

      const {
        id: playlistId
      } = request.params

      const {
        id: credentialId
      } = request.auth.credentials

      await this._playlistsService.checkPlaylistOwner(playlistId, credentialId)
      await this._service.deleteSongInPlaylist(playlistId, songId)

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

module.exports = PlaylistSongsHandler
