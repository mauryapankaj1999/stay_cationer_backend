import express from 'express';
import { authorizeJwt } from 'middlewares/auth.middleware';
import {
  addnotification,
  deletenotificationById,
  getAllnotification,
  getnotificationById,
  deleteAllNotification,
  updatenotificationById,
} from "../controllers/notification.controller";
const router = express.Router();
router.post('/', authorizeJwt, addnotification);
router.get('/', authorizeJwt, getAllnotification);
router.delete('/', authorizeJwt, deleteAllNotification);
router.get('/getById/:id', authorizeJwt, getnotificationById);
router.patch('/updateById/:id', authorizeJwt, updatenotificationById);
router.delete('/deleteById/:id', authorizeJwt, deletenotificationById);
export default router;
