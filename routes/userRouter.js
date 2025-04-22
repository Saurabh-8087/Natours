/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
const express = require('express');
const multer = require('multer');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');




const router = express.Router();

// router.param('id', (req, res, next, val) => {
//   console.log(`Tour id is : ${val}`);
//   next();
// });



router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
//reset your password
router.patch('/resetPassword/:token', authController.resetPassword);

//procet all route after this middleware
router.use(authController.protect);

//update your password
router.patch('/updateMyPassword', 
  
  authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);

router.patch('/updateMe', userController.uploadUserPhoto,userController.resizeUserPhoto,  userController.updateMe );

router.delete('/deleteMe', userController.deleteMe );


//procet all route after this middleware and restrict to adime only.
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

  

module.exports = router;
