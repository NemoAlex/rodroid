const config = require('./config')

const express = require('express')
const app = express()
app.use(require('body-parser').json())

const path = require('path')
const Nightmare = require('nightmare')
const nightmare = Nightmare({
  show: false,
  waitTimeout: 3000,
  webPreferences: {
    preload: path.resolve(__dirname + '/preload.js')
  }
})

nightmare.goto('https://wx.qq.com/')
  .wait('.login_box .qrcode>img')
  .evaluate(() => document.querySelector('.login_box .qrcode>img').src)
  .then(url => {
    console.log('Scan QR code to login:', url)
  })
  .catch(error => {
    console.error('Failed:', error)
  })

const checkLogin = () => nightmare.exists('.chat_item')
const checkIfIsActiveUser = async (name) => {
  if (await nightmare.exists('.chat_item.slide-left.active .nickname')) {
    const nickname = await nightmare.evaluate(() => document.querySelector('.chat_item.slide-left.active .nickname').innerText)
    if (nickname === name) return true
  }
  return false
}

app.post('/send', async function (req, res) {
  try {
    if (!await checkLogin()) throw new Error('Not loggedIn')
    const { to, message } = req.body

    if (!await checkIfIsActiveUser(to)) {
      await nightmare.click('.frm_search').insert('.frm_search', '').insert('.frm_search', to)
      await nightmare.wait('.contact_item.on').click('.contact_item.on')
    }
    await nightmare.insert('#editArea', message).click('.btn.btn_send')
    res.json({ done: 'sent'})
  } catch (err) {
    res.status(403).json({
      message: err.message
    })
  }
})

app.listen(config.port)
console.log('rodroid is listening at ' + config.port)