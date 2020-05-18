const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(express.static("views"))
app.use(bodyParser.urlencoded({extended:true}))

var data = ""

app.get('/', (req, res)=>{
    res.render("index.ejs",{yourName:data})
})
app.get('/form', (req, res)=>{
    res.render("form.ejs")
})
app.get('/:id', (req, res)=>{
    var id = req.params.id
    console.log(id)
    res.render('test.ejs',{data:id})
})
app.get("/:id/*", (req, res)=>{
    res.send("Try valid routes")
})
app.post('/form', (req, res)=>{
    data = req.body.your_name
    res.redirect('/')
})

app.listen(8080, ()=> console.log("Server fired up"))