//import {mongoose} from '../config.js';
import {mongoose} from "../config.js"

let categorySchema = new mongoose.Schema ({
    name : {
        type : String,
        required : true
    }
})

const Category = mongoose.model('category', categorySchema);
export {Category};
