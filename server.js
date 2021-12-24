import express from 'express';
import bcrypt from 'bcrypt';
import session from 'express-session';
// import MongoDbSession from 'connect-mongodb-session';
import { default as connectMongoDBSession} from 'connect-mongodb-session';
const MongoDBStore = connectMongoDBSession(session); 
import bodyparser from 'body-parser';
import {User} from './model/user.js';
import {Post} from './model/post.js';
import {Category} from './model/category.js';
import {mongoURI} from './config.js';
 
let app = new express();
app.use(bodyparser.json()); 
app.listen(3000);
 
const store = new MongoDBStore({
    uri: mongoURI,
    Collection: "mySessions"
})

app.use ( 
    session({
        secret: "key that will sign cookie",
        resave: false,
        saveUninitialized: false,
        store: store
    })
); 

const isAuth = (req, res, next) => {
    if(req.session.isAuth) { 
        console.log("you are logged in");
    } else {
        res.send("not success");
        //console.log("not Autheticate");
        console.log("not logged in");
    }
        next();
}

app.get('/user', (req, res) => {
    User.find({}).then(user => {
        res.json(user);
    });
});
 
app.get('/user/:id', (req, res) => {
    let userId = req.params.id; 
    User.findById(userId, (err, user) => { 
        res.json(user);
    }) 
})

app.post('/user', async (req, res) => { 
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        let user = new User({
            username : req.body.username,
            email : req.body.email,
            password : hashedPassword
        });
        user.save().then((doc) => {
            res.json(doc);
        }).catch((err) => {
            console.log(err);
        });
    } catch {
        res.status("not found");
    }
});

app.get('/post', async (req, res) => {
    const post = await Post.find({});
    res.json(post);
})

app.get('/post/:id', async (req, res) => {
    const postId = req.params.id;
    const post = await Post.findById(postId).populate('category').populate('user');
    // await Post.findById(postId).populate('user').populate('category').exec(function(err, post){
    //     res.json(post);
    //     res.send("success");
	// });
    res.json(post);
})

app.post('/post', async (req, res) => {
    let save = req.session.userId;
    let store = await User.findOne({save});

    if(store.id === save) {
        let post = new Post({
            title: req.body.title,
            desc : req.body.desc,
            category : req.body.category,
            user : req.body.user
        });
        post.save();
        res.send("success");
    } else {
        console.log("First of all you have to Log In.")
    }
})

app.put('/post/:id', (req, res) => {
    try {
        const postId = req.params.id; 
        const postUpdate = req.body;
        //console.log(req.body);
        Post.findByIdAndUpdate(postId, postUpdate, {new : true}, (err, post) => {
            // if(err) {
            //     console.log(err);
            //     return res.send('error')
            // }
            // console.log(user);
            res.send(post);
        });
    }
    catch(err) {
        console.log("not found");
    }
})

app.delete('/post/:id', (req, res) => {
    const deleteId = req.params.id;
    Post.findOneAndRemove(deleteId, post => {
        res.json(post);
    });
})

app.get('/category', async (req, res) => {
    const category = await Category.find({});
    res.json(category);
})

app.get('/category/:id', async (req, res) => {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);
    res.json(category);
})

app.post('/category', (req, res) => {
    let category = new Category({
        name : req.body.name
    });
    category.save();
    res.send("success");
})

app.put('/category/:id', (req, res) => {
    try {
        const categoryId = req.params.id; 
        const categoryUpdate = req.body;
        //console.log(req.body);
        Category.findByIdAndUpdate(categoryId, categoryUpdate, {new : true}, (err, category) => {
            // if(err) {
            //     console.log(err);
            //     return res.send('error')
            // }
            // console.log(user);
            res.send(category);
        });
    }
    catch(err) {
        console.log("not found");
    }
})

app.delete('/category/:id', (req, res) => {
    const deleteId = req.params.id;
    Category.findOneAndRemove(deleteId, category => {
        res.json(category);
    });
})

app.post('/login', async (req, res) => {
 
    const {email, password} = req.body;
    const user = await User.findOne({ email });

    let passwordHash = await bcrypt.hash(user.password, 10);
    const isMatch = await bcrypt.compare(password, passwordHash);

    let save = req.session.userId;
    let store = await User.findOne({save});
     
    if(!user) {
        console.log("not matched"); 
    } else if(!isMatch) {
        console.log("not matched");
    } else if(store.id == save) {
        console.log("You are Already LoggedIn.");
    }
     else {  
        req.session.isAuth = true;
        //console.log(req.session);  // just for understanding is session created or not.
        //console.log(req.session.id);  // ane the id too.
        let store = await User.find({email});
        let session = req.session;
        for(let i = 0; i < store.length; i++) {
            //req.session.store(store[i].id);
            session.userId = store[i].id; 
 
        }
        res.send("session");
        console.log("matched");
    } 

    // console.log(isMatch);
})

// app.get('/postcheck', async (req, res) => {
//     let save = req.session.userId;
//     let store = await User.findOne({save});

// })

app.put('/user/:id', (req, res) => { 
    try {
        const userId = req.params.id; 
        const userUpdate = req.body;
        console.log(req.body);
        User.findByIdAndUpdate(userId, userUpdate, {new : true}, (err, user) => {
            // if(err) {
            //     console.log(err);
            //     return res.send('error')
            // }
            // console.log(user);
            res.send(user);
        });
    }
    catch(err) {
        console.log("not found");
    }
})

app.delete('/user/:id', (req, res) => { 
    const deleteId = req.params.id;
    User.findOneAndRemove(deleteId, user => {
        res.json(user);
    });
})

app.get('/dashboard', isAuth, (req, res) => {
    res.send("success");
    console.log("Authenticated");
})
 
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            throw err;
        } else {
            console.log("Successfully Logout");
        }
    })
})