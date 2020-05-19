const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
var admin = require("firebase-admin");
var methodOverride = require('method-override')

var serviceAccount = require("/Users/kalaiselvan/Desktop/20.1/credentials/serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://node-app-47467.firebaseio.com"
});
const db = admin.firestore()

mongoose.connect("mongodb+srv://admin:admin@cluster0-7u4hv.mongodb.net/test?retryWrites=true&w=majority", {useUnifiedTopology:true, useNewUrlParser: true }).then(() => console.log("connected to db")).catch(err => console.log(err))

const dataSchema = new mongoose.Schema({
    name: String,
    roll_no: Number,
    team: String
})

const postData = new mongoose.Schema({
    img_url: String,
    header: String,
    body: String,
    category: String,
    date: Date
})

var User = mongoose.model("User", dataSchema)
var Post = mongoose.model("Post", postData)

const app = express()
app.use(express.static("views"))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride("_method"))

var data = ""

app.get('/', (req, res) => {
    // db.collection("Posts").get().then(snap => {
    //     res.send(snap)
    // })
    Post.find({},(err,Data)=>{
        res.render('index.ejs',{posts:Data})
    })
})

app.get('/api', (req, res) => {
    Post.find({}, (err, post) => {
        if (err) {
            console.log(err)
        }
        else {
            res.json(post);
        }
    })
})
app.get('/form', (req, res) => {
    res.render("form.ejs")
})
app.get('/:id', (req, res) => {
    var id = req.params.id
    console.log(id)
    res.render('test.ejs', { data: id })
})

app.post('/form', (req, res) => {
    var fireData = {
        img_url: req.body.img_url,
        header: req.body.header,
        body: req.body.body,
        category: req.body.category,
        date: req.body.date
    }
    db.collection('Posts').add(fireData)
    var newData = new Post({
        img_url: req.body.img_url,
        header: req.body.header,
        body: req.body.body,
        category: req.body.category,
        date: req.body.date
    }).save().then(savedData => {
        console.log("data saved", savedData)
        res.redirect('/')
    }).catch(err => {
        console.log("can't save post")
    })
})
app.get('/update/:id',(req,res)=>{
    var id = req.params.id
    Post.findById(id).then(post => {
        res.render('updateform.ejs',{post:post})
    })
})

app.post('/update/:id',(req,res)=>{
    var id = req.params.id
    var updatedData = {
        img_url: req.body.img_url,
        header: req.body.header,
        body: req.body.body,
        category: req.body.category,
        date: req.body.date
    }
    Post.findByIdAndUpdate(id,updatedData).then(res.redirect('/')).catch(err => console.log(err))
    
})

app.get('/delete/:id', (req,res)=>{
    var id = req.params.id
    Post.findByIdAndDelete(id).then(console.log("deleted")).catch(err => console.log(err))
    res.redirect('/')
})
app.get("/*", (req, res) => {
    res.send("Try valid routes")
})

app.listen(8000, () => console.log("server fired up @8000"))