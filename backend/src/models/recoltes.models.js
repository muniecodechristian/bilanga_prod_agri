import mongoose from "mongoose";

const recoltesSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
       images: {
        type: [ String   ],
        default: "",
        required: true
    },
    title: {
        type:    String,
        required: true,
        maxLength: 280,
    },
 
    phone: 
        {
            type: String,
            required: true,
        },

        description: 
        {
            type: String,
           default: "",
        },
        price: 
        {
            type: String,
            required: true,
        },
        category: 
        {
            type: String,
            required: true,
        },
    
    quantity: 
        {
            type: String,
            default: "",
        },
    city: 
        {
            type: String,
            required: true,
        },
    country: 
        {
            type: String,
            required: true,
        },
    

         



         },
    { timestamps: true }
);


const Recolte = mongoose.model("Recolte", recoltesSchema);

export default Recolte;

    