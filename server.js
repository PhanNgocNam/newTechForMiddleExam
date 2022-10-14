require('dotenv').config({ path: __dirname + '/.env' })
const express = require("express");
const AWS = require('aws-sdk')
const path = require('path')

const multer = require("multer");

const app = express();
const port = 3001;

app.use(express.static("./templates"));
app.set("views", "./templates");
app.set("view engine", "ejs");

AWS.config.update({
  region: 'ap-southeast-1',
  accessKeyId: 'AKIAWLCLEXTXCP3OW2ZX',
  secretAccessKey : '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'
})

const docClient = new AWS.DynamoDB.DocumentClient()
const tableName = 'SanPham'

const convertFormToJson = multer()

app.get("/", (req, res) => {
  const params = {
    TableName: tableName
  }

  docClient.scan(params, (err, data) => {
    if(err) {
      res.send(404)
    } else {
      // console.log(JSON.stringify(data));
      return res.render("index", { data: data.Items });
    }
  })
});

app.post("/", convertFormToJson.single('image'), (req, res) => {
  const { id, name, quantity } = req.body
  const params = {
    TableName : tableName,
    Item: {
      id,
      name,
      quantity
    }
  }

  docClient.put(params, (err, data) => {
    if(err) {
      return res.send('Server Error')
    } else {
      // console.log('data = ', JSON.stringify(data))
      return res.redirect('/')
    }
  })
});

app.post('/delete', convertFormToJson.fields([]), (req, res) => {
  console.log(req.body)
  const { id } = req.body
  const params = {
    TableName: tableName,
    Key: {
      id
    }
  }

  docClient.delete(params, (err, data) => {
    if(err) {
      return 404
    } else {
      return res.redirect('/')
    }
  })
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
