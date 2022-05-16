const Joi = require('joi')

const AlbumsPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required(),
  cover: Joi.string()
})

module.exports = { AlbumsPayloadSchema }
