require('dotenv').config()

const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')
const Inert = require('@hapi/inert')
const path = require('path')

const CacheService = require('../src/services/redis/CacheServices')

const songs = require('./api/songs')
const SongsValidator = require('./validator/songs')
const SongsServices = require('../src/services/postgres/song/SongServices')

const albums = require('./api/albums')
const AlbumsValidator = require('./validator/albums')
const AlbumsServices = require('../src/services/postgres/album/AlbumServices')

const uploads = require('./api/uploads')
const StorageService = require('../src/services/storage/StorageServices')
const UploadsValidator = require('./validator/uploads')

const users = require('./api/users')
const UsersService = require('../src/services/postgres/user/UserService')
const UsersValidator = require('./validator/users')

const _exports = require('./api/exports')
const ProducerService = require('../src/services/rabbitmq/ProducerServices')
const ExportsValidator = require('./validator/exports')

const playlists = require('./api/playlists')
const PlaylistsService = require('../src/services/postgres/playlist/PlaylistServices')
const PlaylistsValidator = require('./validator/playlists')

const playlistSongs = require('./api/playlist_songs')
const PlaylistSongsService = require('../src/services/postgres/playlist/PlaylistSongServices')
const PlaylistSongsValidator = require('./validator/playlist_songs')

const authentications = require('./api/authentications')
const AuthenticationsService = require('../src/services/postgres/authentication/AuthenticationService')
const TokenManager = require('./tokenize/TokenManager')
const AuthenticationsValidator = require('./validator/authentications')

const init = async () => {
  const cacheService = new CacheService()
  const songsService = new SongsServices()
  const albumsService = new AlbumsServices(cacheService)
  const usersService = new UsersService()
  const playlistsService = new PlaylistsService()
  const playlistSongsService = new PlaylistSongsService()
  const authenticationsService = new AuthenticationsService()
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'))

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  await server.register([
    {
      plugin: Jwt
    },
    {
      plugin: Inert
    }
  ])

  server.auth.strategy('openmusicapi_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id
      }
    })
  })

  await server.register([
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator
      }
    },
    {
      plugin: albums,
      options: {
        service: {
          albumsService,
          songsService
        },
        validator: AlbumsValidator
      }
    },
    {
      plugin: uploads,
      options: {
        service: {
          storageService,
          albumsService
        },
        validator: UploadsValidator
      }
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator
      }
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator
      }
    },
    {
      plugin: _exports,
      options: {
        service: {
          ProducerService,
          playlistsService
        },
        validator: ExportsValidator
      }
    },
    {
      plugin: playlistSongs,
      options: {
        service: {
          playlistSongsService,
          playlistsService,
          songsService
        },
        validator: PlaylistSongsValidator
      }
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator
      }
    }
  ])

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

init()
