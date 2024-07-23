var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')



router.get('/', function(req, res, next) {
 productHelpers.getAllProducts().then((products)=>{ //productHelpers.getAllProducts() is a function that returns a Promise. It fetches all products from the database..then((products) => { ... }) is a promise handler that executes when getAllProducts() successfully resolves. It receives the fetched products as the products parameter.
  // console.log(products);
  res.render('admin/view-products',{admin:true,products});
 })
});


router.get('/add-product',function(req,res){
  res.render('admin/add-product');
})


router.post('/add-product', async (req, res) => {
  try {
      const id = await productHelpers.addProduct(req.body);//req.body contains form data sent from the client
      // console.log(id);
      let image = req.files.Image; // Get the uploaded image file
      await image.mv(`./public/product-images/${id}.jpg`);//Moves the uploaded image to a folder named product-images under public, renaming it to ${id}.jpg where id is the ID of the newly inserted product.
      res.redirect('/admin/add-product');

  } catch (error) {
      console.log(error); // Log any error that occurs
      res.status(500).send('Error adding product or uploading image');
  }
});


router.get('/delete-product/:id',(req,res)=>{
    let proId=req.params.id
    // console.log(proId);
    productHelpers.deleteProduct(proId).then((response)=>{
      res.redirect('/admin')
    })
})



router.get('/edit-product/:id',async(req,res)=>{
  let product= await productHelpers.getAllProductDetails(req.params.id)
  console.log(product);
  res.render('admin/edit-product',{product})
})

router.post('/edit-product/:id', (req, res) => {
  let id = req.params.id;
  productHelpers.updateProduct(id, req.body).then(() => {
    if (req.files && req.files.Image) {
      let image = req.files.Image;
      // Moves the uploaded image to a folder named product-images under public, renaming it to ${id}.jpg where id is the ID of the newly inserted product.
      image.mv(`./public/product-images/${id}.jpg`, (error) => {
        res.redirect('/admin');
      });
    }
  })
});



module.exports = router;
