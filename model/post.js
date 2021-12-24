import {mongoose} from '../config.js';

let postSchema = new mongoose.Schema({
    title : {
        type: String,
        required : true,
        unique : true
    },
    desc : {
        type : String,
        required : true,
    },
    category : {
        type : mongoose.Types.ObjectId,
        ref : "category"
    }, 
    user : {
        type : mongoose.Types.ObjectId,
        ref : "user"
    }

});

const Post = mongoose.model('Post', postSchema);
export {Post};