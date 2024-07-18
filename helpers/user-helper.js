var db = require('../config/connection'); // Import the database configuration
var collection = require('../config/collections'); // Import the collections configuration
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

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
                        console.log('Login success');
                        response.user=user
                        response.status=true
                        resolve(response)

                    } else {
                        console.log('Login failed');
                        resolve({status:false})
                    }
                } else {
                    console.log('Login failed');
                    resolve({status:false})

                }
            } catch (error) {
                console.error('Error during login:', error);
                reject({ success: false, message: 'Internal server error' }); // Reject the promise if an error occurs
            }
        });
    }
};
