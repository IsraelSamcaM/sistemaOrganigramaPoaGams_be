const express = require('express')
const app = express()
const http = require('http');
const cors = require('cors')
require('dotenv').config()
const routes = require('./routes/router')
const dbConection = require('./database/config')
const server = http.createServer(app);
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
dbConection()
app.use(routes)
server.listen(process.env.PORT, () => {
    console.log('Server listen in port', process.env.PORT)
})