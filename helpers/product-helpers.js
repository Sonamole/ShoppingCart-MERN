var db=require('../config/connection')
var collection=require('../config/collections')
var objectId = require('mongoose').Types.ObjectId;


module.exports = {
    addProduct: (product) => { // takes product as an argument, the product data passed from admin.js post route(addProduct(req.body);) to be inserted into the database.
        return new Promise((resolve, reject) => {
            const database = db.get(); // Get the database instance
            database.collection('product').insertOne(product) // Insert the product into the 'product' collection
                .then((result) => { // Handle the result of the insert operation
                    const insertedId = result.insertedId; //when you perform an insert operation using insertOne() on a collection, the result object returned contains various properties, including insertedId
                    console.log("Id of this object",insertedId); // Log the inserted ID to the console
                    resolve(insertedId); // Resolve the promise with the inserted ID
                })
                .catch((error) => { // Handle any errors that occur during the insert operation
                    console.error('Error inserting product:', error);
                    reject(error); // Reject the promise with the error
                });
        });
    },


    getAllProducts:()=>{
        const database = db.get();
        return new Promise(async(resolve,reject)=>{ //Promises are used for asynchronous operations, providing resolve and reject functions to handle the success or failure of the operation.async keyword is used to declare an asynchronous function. When a function is declared as async, it automatically returns a Promise.
            let products= await database.collection(collection.PRODUCT_COLLECTION).find().toArray()//Inside the Promise, we use the await keyword to pause execution until the find().toArray() operation completes.fetches all documents (products) from the PRODUCT_COLLECTION collection and converts them into an array.
            resolve(products) //If the find().toArray() operation is successful, the promise is resolved with the fetched products array.
        })
    },

    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            const database = db.get();
            database.collection(collection.PRODUCT_COLLECTION).deleteOne({_id: new objectId(proId)}).then((response)=>{
                console.log(response);
                resolve(response)
            })

        })
    },

    getAllProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            const database = db.get();
            database.collection(collection.PRODUCT_COLLECTION).findOne({_id: new objectId(proId)}).then((response)=>{ //new ObjectId(proId): This converts the proId (which is a string) into an ObjectId type, which is necessary for querying by _id in MongoDB.
            resolve(response)
            })
        })

    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            const database = db.get();
            database.collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id: new objectId(proId)},{
                $set:{
                    Name:proDetails.Name,
                    Description:proDetails.Description,
                    Category:proDetails.Category,
                    Price:proDetails.Price,
                }
            }).then((response)=>{
                resolve()
            })
        })
    }
}

