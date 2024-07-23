var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')
const userHelper=require('../helpers/user-helper')

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }
  else{
    res.redirect('/login')
  }
}



router.get('/',async function(req, res, next) {
  let user=req.session.user
  console.log("User session checking",user);
  let cartCount=null
  if(req.session.user){
    cartCount= await userHelper.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products)=>{
    // console.log(products);
    res.render('user/view-products',{products,user,cartCount});
   })
});



router.get('/signup',(req,res)=>{
  res.render('user/signup')
})


router.post('/signup',(req,res)=>{
  userHelper.doSignup(req.body).then((response)=>{
    req.session.loggedIn=true //req.session is an object provided by the express-session middleware. It represents the session for the current user. When you use express-session, it automatically attaches a session object to the req (request) object.loggedIn is not provided by the express-session module; it is a custom property that you define to store specific information. In this case, setting req.session.loggedIn = true indicates that the user is currently logged in.
    req.session.user=response//user is also a custom property, and it is used to store user-specific data. In this case, response likely contains information about the logged-in user (e.g., user ID, username, email, etc.).
    res.redirect('/')
  })
})




router.get('/login', (req, res) => {
  if (req.session.loggedIn) { //Checks if the loggedIn property on req.session is true.
    res.redirect('/');
  } else {
    const loginErr = req.session.loginErr;  // Store the error message in a variable
    req.session.loginErr = false;  // Reset the login error after storing it
    res.render('user/login', { loginErr: loginErr });  // Pass the variable to the template
  }
});



router.post('/login',(req,res)=>{
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){// Checks if the login was successful based on the status property in the response object.
      req.session.loggedIn=true //Sets the loggedIn property on req.session to true, indicating that the user is authenticated.
      req.session.user=response.user//Stores the user property from the response object in req.session.user. This typically contains user information such as user ID, username, email, etc.
      res.redirect('/')
    }
    else{
      req.session.loginErr="Invalid Username or Password"
      res.redirect('/login')
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy()//Destroys the session associated with the current user.
  res.redirect('/')
})

router.get('/cart',verifyLogin,async(req,res)=>{
  let products=await userHelper.getCartProducts(req.session.user._id)
  console.log("Cart Products:",products);
  res.render('user/cart',{products,user:req.session.user})
})


router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  console.log("api call");
  userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
    console.log('Product added successflly');
    // res.redirect('/')
    res.json({status:true})
  })
})


router.post('/change-product-quantity',(req,res,next)=>{
  console.log('lalala');
  userHelper.changeProductQuantity(req.body).then(()=>{
    console.log('cinnubg');
  })
})




module.exports = router;
