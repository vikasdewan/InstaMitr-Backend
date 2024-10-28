import express from 'express';
import { editProfile, followOrUnFollow, getProfile, getSuggestedUsers, login, logout, register } from '../controllers/user.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import upload from '../middlewares/multer.js';

const router = express.router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/:id/profile').get(isAuthenticated , getProfile); 
router.route('/profile/edit').post(isAuthenticated, upload.single('profileImage') ,editProfile);
router.route('/suggested').get(isAuthenticated,getSuggestedUsers);
router.route('/followorunfollow/:id').post(isAuthenticated,followOrUnFollow);


export default router;