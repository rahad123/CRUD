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

const guest = (req, res, next) => {
    if(!req.session.isAuth) {
        res.send("You have to log in first.");
    }
}
const isAuth = (req, res, next) => {
    if(req.session.isAuth) { 
        console.log("you are logged in");
        next();
    }
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

// app.post('/user', async (req, res) => { 
//     try {
//         const hashedPassword = await bcrypt.hash(req.body.password, 10);

//         let user = new User({
//             username : req.body.username,
//             email : req.body.email,
//             password : hashedPassword
//         });
//         user.save().then((doc) => {
//             res.json(doc);
//         }).catch((err) => {
//             console.log(err);
//         });
//     } catch {
//         res.status("not found");
//     }
// });

app.get('/post', async (req, res) => {
    const post = await Post.find({});
    res.json(post);
})

app.get('/post/:id', async (req, res) => {
    const postId = req.params.id;
    const post = await Post.findById(postId).populate('category').populate('user');
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

        Post.findByIdAndUpdate(postId, postUpdate, {new : true}, (err, post) => {
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

        Category.findByIdAndUpdate(categoryId, categoryUpdate, {new : true}, (err, category) => {
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

app.post('/signup', async (req, res) => {
    const {username, email, password} = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 20);

        let user = new User({
            username : username,
            email : email,
            password : hashedPassword
        });
        user.save().then((doc) => {
            res.json(doc);
        }).catch((err) => {
            console.log(err);
        });

        console.log("You are successfully Registered.");
    
    } catch {
        res.status("not found");
    }
    console.log("save");
})

app.post('/login', async (req, res) => {
 
    if(req.session.isAuth) {
        console.log("you are already logged in.");
        return;
    }

    const {email, password} = req.body;
    const user = await User.findOne({ email });

    let passwordHash = await bcrypt.hash(user.password, 10);
    const isMatch = await bcrypt.compare(password, passwordHash);

    if(!user) {
        console.log("not matched"); 
    } else if(!isMatch) {
        console.log("not matched");
    } else {  
        req.session.isAuth = true;
        let session = req.session;
        session.userId = user.id; 
        console.log("You are Welcome.");
    } 
})

// app.get('/registration', async (req, res) => {
//     app.use(guest);
// })

app.put('/user/:id', (req, res) => { 
    try {
        const userId = req.params.id; 
        const userUpdate = req.body;
        console.log(req.body);

        User.findByIdAndUpdate(userId, userUpdate, {new : true}, (err, user) => {
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

app.get('/dashboard',guest, isAuth, (req, res) => {
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