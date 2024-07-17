var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

  let products=[
    {
      name:"IPhone",
      category:"Mobile",
      description:"This is a good phone",
      image:"https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-card-40-iphone15prohero-202309_FMT_WHH?wid=508&hei=472&fmt=p-jpg&qlt=95&.v=1693086369818"
    },
    {
      name:"One Plus7t ",
      category:"Mobile",
      description:"This is a good phone",
      image:"https://images.fonearena.com/blog/wp-content/uploads/2019/09/OnePlus-7T-1.jpg"
    },
    {
      name:"Oppo 10x",
      category:"Mobile",
      description:"This is a good phone",
      image:"https://www.oppo.com/content/dam/oppo-campaign-site/in/events/oppo-product/image-link/march-2023/OPPO_F25_Pro_5G_Lava_Red_frontback.jpg"
    },
    {
      name:"MI note 9 pro",
      category:"Mobile",
      description:"This is a good phone",
      image:"https://m.media-amazon.com/images/I/71ij5dqxbeL._AC_UF1000,1000_QL80_.jpg"
    },

  ]

  res.render('admin/view-products',{admin:true,products});
});
router.get('/add-product',function(req,res){
  res.render('admin/add-product');
})

router.post('/add-product',(req,res)=>{
    console.log(req.body);
    console.log(req.files.Image);
})

module.exports = router;
