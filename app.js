const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const path = require('path')
app.use(express.json())
const datapath = path.join(__dirname, 'userData.db')
let db = null
const initialization = async () => {
  try {
    db = await open({
      filename: datapath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('success')
    })
  } catch (e) {
    console.log(`${e.message}`)
    process.exit(1)
  }
}
initialization()
app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const hashedPassword = await bcrypt.hash(password, 10)
  const c = `SELECT *
           FROM user
           WHERE username="${username}";`
  const d = await db.get(c)
  if (d === undefined) {
    const e = `INSERT INTO user (username,name,password,gender,location)
              VALUES ("${username}","${name}","${hashedPassword}","${gender}","${location}");`

    if (password.length > 5) {
      const g = await db.run(e)
      response.status(200)
      response.send('User created successfully')
    } else {
      response.status(400)
      response.send('Password is too short')
    }
  } else {
    response.status(400)
    response.send('User already exists')
  }
})
app.post('/login', async (request, response) => {
  const {username, password} = request.body

  const j = `SELECT *
           FROM user
           WHERE username="${username}";`
  const k = await db.get(j)

  if (k === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else if (k !== undefined) {
    const compared = await bcrypt.compare(request.body.password, k.password)
    if (compared) {
      response.status(200)
      response.send('Login success!')
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})
app.put('/change-password', async (request, response) => {
  const {username, oldpassword, newpassword} = request.body

  const c = `SELECT *
           FROM user
           WHERE username="${username}";`
  const d = await db.get(c)
  if (d !== undefined) {
    const f = await bcrypt.compare(oldpassword, d.password)
    if (f === false) {
      response.status(400)
      response.send('Invalid current password')
    } else {
      if (newpassword.length < 5) {
        response.status(400)
        response.send('Password is too short')
      } else {
        const v = await bcrypt.hash(newpassword, 10)
        const c = `UPDATE user
                 SET password="${v}"
                 WHERE username="${username}"; `
        response.status(200)
        response.send('Password updated')
      }
    }
  } else {
    response.send('not registered')
  }
})
module.exports = app
