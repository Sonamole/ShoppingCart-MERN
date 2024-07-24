var db = require('../config/connection'); // Import the database configuration
var collection = require('../config/collections'); // Import the collections configuration
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const { response } = require('express');
var objectId = require('mongoose').Types.ObjectId;


module.exports = {
    doSignup: (userData) => {
        const database = db.get(); // Get the database instance
        return new Promise(async (resolve, reject) => {
            try {
                // Hash the user's password before saving it to the database
                userData.Password = await bcrypt.hash(userData.Password, 10);
                // Insert the user data into the USER_COLLECTION
                let data = await database.collection(collection.USER_COLLECTION).insertOne(userData);
                resolve(data); // Resolve the promise with the insertion data
            } catch (error) {

                reject(error); // Reject the promise if an error occurs
            }
        });
    },


    doLogin: (userData) => {
        const database = db.get();
        return new Promise(async (resolve, reject) => {
            try {
                let loginStatus=false
                let response={}
                let user = await database.collection(collection.USER_COLLECTION).findOne({ Email: userData.Email });
                if (user) {
                    let status = await bcrypt.compare(userData.Password, user.Password);// // Compare the provided password with the stored hashed password
                    if (status) {
                        // console.log('Login success');
                        response.user=user
                        response.status=true
                        resolve(response)

                    } else {
                        // console.log('Login failed');
                        resolve({status:false})
                    }
                } else {
                    // console.log('Login failed');
                    resolve({status:false})

                }
            } catch (error) {
                // console.error('Error during login:', error);
                reject({ success: false, message: 'Internal server error' }); // Reject the promise if an error occurs
            }
        });
    },


    addToCart: (proId, userId) => {

        let proObj = { // Create a new object with product ID and quantity.
            item: new objectId(proId), // Convert the product ID to an object ID.
            quantity: 1 // Initialize the quantity to 1.
        }
        return new Promise(async (resolve, reject) => {
            try {
                const database = db.get();
                let userCart = await database.collection(collection.CART_COLLECTION).findOne({ user: new objectId(userId) });
                if (userCart) { // Check if the product already exists in the cart.
                    let proExist = userCart.products.findIndex(product => product.item == proId);//userCart is an object representing the user's cart, and products is an array within this cart object. This array contains all the products currently in the cart.
                    // .findIndex() is an array method in JavaScript that searches for an element in the array based on a condition and returns the index of the first element that satisfies that condition. If no elements match, it returns -1.
                    // product => product.item == proId ,checks whether the item property of the product matches proId.
                    if (proExist !== -1) {
                        // If the product exists, update its quantity by 1.
                        database.collection(collection.CART_COLLECTION)
                            .updateOne(
                                {
                                    user: new objectId(userId),////user: new objectId(userId) finds the document belonging to the specified user.
                                    'products.item': new objectId(proId)// 'products.item': new objectId(proId) finds the product within the products array that matches the proId.
                                },
                                {
                                    $inc: { 'products.$.quantity': 1 } // $inc is a MongoDB operator that increments a field's value. 'products.$.quantity': 1 means increment the quantity field of the matched product by 1. The $ in products.$ is a positional operator that refers to the first array element that matches the query.
                                }
                            )
                            .then(() => {
                                resolve(); // Resolve the promise when the update is successful.
                            })
                    } else {
                        // If the product doesn't exist, add it to the cart.
                        database.collection(collection.CART_COLLECTION)
                            .updateOne(
                                { user: new objectId(userId) },//This query finds the document in the collection where the user field matches the userId converted to an ObjectId. This ensures we are updating the cart of the specific user.
                                { $push: { products: proObj } } //$push is a MongoDB operator that adds an item to an array field. products: proObj specifies that the new item to be added is proObj, which represents the new product to be added to the cart.
                            )
                            .then(response => {
                                resolve(response); // Resolve the promise with the response.
                            });
                    }
                } else {
                    // If the cart doesn't exist, create a new cart with the product.
                    let cartObj = {
                        user: new objectId(userId), // Set the user ID.
                        products: [proObj] //products: A field in cartObj that stores an array of products.[proObj]: Initializes the products array with the single product object proObj. proObj represents the new product to be added to the cart.
                    };
                    database.collection(collection.CART_COLLECTION).insertOne(cartObj)
                        .then(response => {
                            resolve(response); // Resolve the promise with the response.
                        });
                }
            } catch (err) {
                // Handle any errors that occur during the process.
                // console.error('Error in addToCart:', err);
                reject(err); // Reject the promise if an error occurs.
            }
        });
    },


    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            const database = db.get();

            let cartItems = await database.collection(collection.CART_COLLECTION).aggregate([//.aggregate([: This method performs an aggregation operation on the collection. Aggregation operations process data records and return computed results. The argument to aggregate is an array of stages, where each stage transforms the data in some way.
                {
                    $match: { user: new objectId(userId) }//: This is a match stage in the aggregation pipeline. It filters documents in the CART_COLLECTION where the user field matches the userId. new objectId(userId) converts the userId to a MongoDB ObjectId type.
                },

                {
                    $unwind:'$products' //This stage deconstructs the products array field from the input documents to output a document for each element in the products array.
                },
                {
                    $project:{ //This stage reshapes each document by including only the item and quantity fields from the products array.
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{ // This is a join operation. It joins documents from PRODUCT_COLLECTION where the item field in the cartItems matches the _id field in the PRODUCT_COLLECTION. The joined data is stored in a new array field named product.
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{//This stage reshapes the documents again. It retains item and quantity fields and retrieves the first element of the product array using $arrayElemAt. This effectively flattens the product array so it contains just one document (the product details) rather than an array.
                        item:1,quantity:1,product:
                        {
                            $arrayElemAt:['$product',0]

                        },
                    }
                }

            ]).toArray();
            // console.log(cartItems);
            resolve(cartItems);
        });
    },


    getCartCount:(userId)=>{
        return new Promise (async(resolve)=>{
            const database = db.get();
            let cart=await database.collection(collection.CART_COLLECTION).findOne({user: new objectId(userId)})
            let count = 0;
            if(cart)
            {
                count=cart.products.length
            }
            resolve(count)
        })
    },

    changeProductQuantity:(details)=>{ //details is expected to contain information needed to update the product quantity, such as the cart ID, product ID, and the count to increment or decrement.
        details.count=parseInt(details.count)// converts the count value in details to an integer, ensuring that it’s a number (since it may have been passed as a string).
        details.quantity=parseInt(details.quantity)
        return new Promise ((resolve,reject)=>{
            const database = db.get();
           if(details.count==-1 && details.quantity==1){
            database.collection(collection.CART_COLLECTION)
            .updateOne({_id: new objectId(details.cart)},
            {
                $pull:{products:{item: new objectId(details.product)}}
            }
            ).then((response)=>{
                resolve({removeProduct:true})
            })
           }else{
            database.collection(collection.CART_COLLECTION)
            .updateOne({_id: new objectId(details.cart),'products.item':new objectId(details.product)},
            {
                $inc:{'products.$.quantity':details.count}
            }

        ).then((response)=>{
            resolve({status:true})

        })
           }
        })
    },


    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            const database = db.get();

            let total = await database.collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: new objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: {
                            $arrayElemAt: ['$product', 0]
                        }
                    }
                },
                {
                    $addFields: {
                        'product.PriceNumeric': { $toDouble: '$product.Price' } // Convert price to numeric
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.PriceNumeric'] } }
                    }
                }
            ]).toArray();

            if (total.length > 0) {
                console.log('Total amount is', total[0].total);
                resolve(total[0].total); // Resolve the total amount
            } else {
                resolve(0); // Resolve 0 if no items in cart
            }
        });
    },

    placeOrder:(order, products, total) => {
        return new Promise(async (resolve, reject) => {
            try {
                let status = order['payment-method'] === 'COD' ? 'placed' : 'pending';
                let userId = order.userId; // Ensure userId is properly assigned

                let orderObj = {
                    deliveryDetails: {
                        mobile: order.mobile,
                        address: order.address,
                        pincode: order.pincode,
                    },
                    userId: new objectId(userId),
                    paymentMethod: order['payment-method'],
                    products: products,
                    totalAmount: total,
                    status: status,
                    date:new Date()
                };

                const database = db.get();
                await database.collection(collection.ORDER_COLLECTION).insertOne(orderObj);
                await database.collection(collection.CART_COLLECTION).deleteOne({ user: new objectId(userId) });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },

    getCartProductList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            const database = db.get();
            let cart = await database.collection(collection.CART_COLLECTION).findOne({ user: new objectId(userId) });
            resolve(cart.products)
        })
    },

    getUserOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            const database = db.get();
            let orders = await database.collection(collection.ORDER_COLLECTION)
            .find({ userId: new objectId(userId)}).toArray();
            resolve(orders)
        })
    },

    getOrderProducts:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            const database = db.get();
            let ordersItems = await database.collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id:new objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: {
                            $arrayElemAt: ['$product', 0]
                        }
                    }
                },

            ]).toArray();
            resolve(ordersItems)
        })
    },
};

