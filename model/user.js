//import {client} from "../config.js";
import {mongoose} from "../config.js"

let userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    }
})

const User = mongoose.model('user', userSchema);
export {User};