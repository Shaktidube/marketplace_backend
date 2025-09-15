const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const fs = require("fs");
const { Order, Product, User } = require("../../models");
const { default: mongoose } = require("mongoose");

const controllers = {};

controllers.getAdmin = async (req, res) => {
  try {
    const sHashedPassword = await bcrypt.hash("admin123", 10);
    const oAdmin = User({
      sEmail: "admin@gmail.com",
      sPassword: sHashedPassword,
      sRole: "admin",
    });
    oAdmin.save();
    return res.reply(messages.successfully("Get admin"));
  } catch (error) {
    return res.reply(messages.server_error(`${error}`));
  }
};

controllers.addProducts = async (req, res) => {
  try {
    const { sProductName, nPrice, nStock, nSold } = req.body;

    const photo_path = req.file ? req.file.path : null;

    if (!req.file) {
      throw new Error("Please upload a file");
    }

    const oProduct = await Product.findOne({sProductName})
    // console.log(oProduct);
    
    if(oProduct){
        return res.reply(messages.already_exists('Product'));
    }
    
    const oProductDeatils = new Product({
      sProductName,
      nPrice,
      nStock,
      nSold,
      sPhotos: photo_path,
    });

    oProductDeatils.save();
    // try {
    //   const oUser = await User.find({},'sEmail')
    //   // console.log(oUser);
    //   const emailData = {
    //     productName: sProductName,
    //     price: nPrice,
    //     productImage: photo_path, 
    //     description: "Check out our latest product!" 
    //   };
    //   const emailPromises = oUser.map(user => {
    //     // console.log(user.sEmail);
    //     const mailOptions = {
    //       from: configObj.MAIL_FROM,
    //       to: user.sEmail,
    //       subject: `New Product Added: ${sProductName}`,
    //     };
        
    //     services.send('newProductNotification.ejs', emailData, mailOptions)
          
    //   })
    //   Promise.all(emailPromises)
    //     .then(() => console.log('All notifications sent'))
    //     .catch(err => console.error('Some notifications failed', err));

    // } catch (error) {
    //   return res.reply(messages.error('mail sent : '))
    // }
    return res.reply(messages.successfully("product added "), oProductDeatils);

  } catch (error) {
    return res.reply(messages.server_error(`${error}`));
  } finally {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
  }
};

controllers.aggregationQuery = async (req, res) => {
  try {

    const {startDate , endDate} = req.body

    let startDateWithTime =new Date(startDate+'T00:00:00.000Z')
    let endDateWithTime =new Date(endDate+'T23:59:59.999Z')

  
    // console.log(typeof startDateWithTime);

    console.log(startDateWithTime,endDateWithTime);
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, sum: { $sum: "$nBill" } } },
    ]);

    const revenue = await Order.aggregate([
      {
        $match:{
          createdAt:{$gte:startDateWithTime,$lte:endDateWithTime}
        }
      },
      {
         $group: { _id: null, sum: { $sum: "$nBill" } } ,
      },
    ]);
    // console.log(revenue);
    return res.reply(messages.success(), { totalRevenue,revenue });
  } catch (error) {
    return res.reply(messages.server_error(`${error}`));
  }
};

controllers.updateProduct = async (req, res) => {
  try {

    const {ProductName , Price, Stock , Sold} = req.body

    const oProduct = await Product.findOneAndUpdate({sProductName:ProductName},{$set:{sProductName:ProductName,nPrice:Price,nStock:Stock,nSold:Sold}})

    if(!oProduct){
      return res.reply(messages.not_found('product'))
    }

    return res.reply(messages.updated('product'))

  } 
  catch (error) {
    return res.reply(messages.server_error(`${error}`));
  }
};

module.exports = controllers;
