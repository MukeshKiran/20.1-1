const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

mongoose.connect("mongodb+srv://admin:admin@cluster0-7u4hv.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser:true}).then(()=> console.log("connected to db")).catch(err => console.log(err))

const dataSchema = new mongoose.Schema({
    name:String,
    roll_no:Number,
    team:String
})

const postData = new mongoose.Schema({
    img_url:String,
    header:String,
    body:String
})

var User = mongoose.model("User",dataSchema)
var Post = mongoose.model("Post",postData)

const app = express()
app.use(express.static("views"))
app.use(bodyParser.urlencoded({extended:true}))

var data = ""

app.get('/',(req,res)=>{
    Post.find({},(err,post)=>{
        res.render("index.ejs",{posts:post})
    })
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
    var newData = new Post({
        img_url:req.body.imgUrl,
        header:req.body.header,
        body:req.body.body
    }).save().then(savedData =>{
        console.log("data saved", savedData)
        res.redirect('/')
    }).catch(err => {
        console.log("can't save post")
    })
})

app.listen(8000,()=>console.log("server fired up @8000"))