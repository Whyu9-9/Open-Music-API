const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const bcrypt = require('bcrypt')
const InvariantError = require('../../../exceptions/InvariantError')
const NotFoundError = require('../../../exceptions/NotFoundError')
const AuthenticationError = require('../../../exceptions/AuthenticationError')

class UsersService {
  constructor () {
    this._pool = new Pool()
  }

  async addUser ({
    username, password, fullname
  }) {
    await this.checkIfUsernameExist(username)

    const id = 'user-' + nanoid(16)
    const hashedPassword = await bcrypt.hash(password, 10)
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('User failed to add')
    }
    return result.rows[0].id
  }

  async getUserById (userId) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [userId]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('User not found')
    }

    return result.rows[0]
  }

  async checkIfUsernameExist (username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username]
    }

    const result = await this._pool.query(query)

    if (result.rows.length > 0) {
      throw new InvariantError('Failed to add user. The username is already taken')
    }
  }

  async verifyUserCredential (username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new AuthenticationError('This credential did not match our record')
    }

    const { id, password: hashedPassword } = result.rows[0]
    const match = await bcrypt.compare(password, hashedPassword)

    if (!match) {
      throw new AuthenticationError('Invalid credential')
    }
    return id
  }
}

module.exports = UsersService
