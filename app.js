// require packages
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
var admin = require("firebase-admin")
var methodOverride = require('method-override')
var passport = require('passport')
var localStrategy = require('passport-local')
var passportLocalMongoose = require('passport-local-mongoose')
var Admin = require('./models/admin.js')
// set up
const app = express()
app.use(express.static("views"))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
// firebase config
var serviceAccount = require("/Users/kalaiselvan/Desktop/20.1/credentials/serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://node-app-47467.firebaseio.com"
});
const db = admin.firestore()
// mongodb config
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
// passport config
app.use(require("express-session")({
    secret : "Winter is coming",
    resave : false,
    saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(Admin.authenticate()));
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());
// routes
app.get('/',(req,res)=>{
    req.flash("welcome","Stark")
    res.render("landing.ejs")
})

app.get('/home', isLoggedIn,(req, res) => {
    // db.collection("Posts").get().then(snap => {
    //     res.send(snap)
    // })
    var currentUser = req.user
    Post.find({},(err,Data)=>{
        res.render('index.ejs',{posts:Data,user:currentUser})
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

app.get('/form',isLoggedIn,(req, res) => {
    res.render("form.ejs")
})

app.get("/logout",function(req,res){
    req.logout();
    // alert("Logged out successfully");
    res.redirect("/");
})
app.get('/update/:id',isLoggedIn,(req,res)=>{
    var id = req.params.id
    Post.findById(id).then(post => {
        res.render('updateform.ejs',{post:post})
    })
})

app.get('/delete/:id', isLoggedIn,(req,res)=>{
    var id = req.params.id
    Post.findByIdAndDelete(id).then(console.log("deleted")).catch(err => console.log(err))
    res.redirect('/home')
})

// post
app.post('/login',passport.authenticate("local",{
    successRedirect:"/home",
    failureRedirect:"/"
}))


app.post('/register',(req,res)=>{
    var newUser = new Admin({username:req.body.username})
    Admin.register(newUser,req.body.password,(err,user)=>{
        if(err){
            res.redirect('/')
        }
        passport.authenticate("local")(req,res,()=>{
            res.redirect('/home')
        })
    })
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
        res.redirect('/home')
    }).catch(err => {
        console.log("can't save post")
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
    Post.findByIdAndUpdate(id,updatedData).then(res.redirect('/home')).catch(err => console.log(err))
    
})

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/");
}

app.listen(8000, () => console.log("server fired up @8000"))