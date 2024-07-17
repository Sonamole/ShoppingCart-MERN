var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')



router.get('/', function(req, res, next) {
 productHelpers.getAllProducts().then((products)=>{ //productHelpers.getAllProducts() is a function that returns a Promise. It fetches all products from the database..then((products) => { ... }) is a promise handler that executes when getAllProducts() successfully resolves. It receives the fetched products as the products parameter.
  console.log(products);
  res.render('admin/view-products',{admin:true,products});
 })
});


router.get('/add-product',function(req,res){
  res.render('admin/add-product');
})


router.post('/add-product', async (req, res) => {
  try {
      const id = await productHelpers.addProduct(req.body);//req.body contains form data sent from the client
      console.log(id);
      let image = req.files.Image; // Get the uploaded image file
      await image.mv(`./public/product-images/${id}.jpg`);//Moves the uploaded image to a folder named product-images under public, renaming it to ${id}.jpg where id is the ID of the newly inserted product.
      res.redirect('/admin/add-product');
      
  } catch (error) {
      console.log(error); // Log any error that occurs
      res.status(500).send('Error adding product or uploading image');
  }
});


module.exports = router;
