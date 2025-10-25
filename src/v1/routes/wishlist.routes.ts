import exp from 'constants';
import express from 'express';
import { authorizeJwt } from 'middlewares/auth.middleware';
import { addToWishlist,  getUserWishlist, } from 'v1/controllers/wishlist.controller';

const router = express.Router();

router.post('/', authorizeJwt,addToWishlist);
// router.delete('/:propertyId', authorizeJwt, removeFromWishlist);
router.get('/getAllWishlist', authorizeJwt,  getUserWishlist);
// router.get('/wishlist/check/:userId/:propertyId', isPropertyInWishlisted);

export default router;