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




router.get('/', function(req, res, next) {
  let user=req.session.user
  console.log("User session checking",user);
  productHelpers.getAllProducts().then((products)=>{
    // console.log(products);
    res.render('user/view-products',{products,user});
   })
});



router.get('/signup',(req,res)=>{
  res.render('user/signup')
})

router.post('/signup',(req,res)=>{
  userHelper.doSignup(req.body).then((response)=>{
    req.session.loggedIn=true
    req.session.user=response
    res.redirect('/')
  })
})




router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/');
  } else {
    const loginErr = req.session.loginErr;  // Store the error message in a variable
    req.session.loginErr = false;  // Reset the login error after storing it
    res.render('user/login', { loginErr: loginErr });  // Pass the variable to the template
  }
});



router.post('/login',(req,res)=>{
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/')
    }
    else{
      req.session.loginErr="Invalid Username or Password"
      res.redirect('/login')
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

router.get('/cart',verifyLogin,(req,res)=>{
  res.render('user/cart')
})

router.get('/add-to-cart/:id',(req,res)=>{
  userHelper.addToCart(req.params.id,req.session.user._id)
})





module.exports = router;
