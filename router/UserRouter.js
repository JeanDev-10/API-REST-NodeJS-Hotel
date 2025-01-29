import express from 'express';
import { login,updateUsersPassword, updateUsersEmail, getUsers,createUsers,updateUsers,deleteUsers,getOneUser, me, logout} from '../controller/UserController.js';
import  {verifyToken}  from '../middleware/auth.js';
import { ValidateCreateUser } from '../middleware/validations/validateCreateUser.js';
import { ValidateLoginUser } from '../middleware/validations/ValidateLoginUser.js';
const rotuer = express.Router();
rotuer.post('/register',ValidateCreateUser, createUsers);
rotuer.post('/login', ValidateLoginUser,login);
rotuer.get('/me', verifyToken,me);
rotuer.get('/logout',verifyToken, logout);
/* rotuer.get('/user',verifyToken, getUsers); */
rotuer.get('/user/:id',verifyToken, getOneUser);
/*rotuer.put('/user/:id',verifyToken, updateUsers);
rotuer.delete('/user/:id', verifyToken, deleteUsers); */
/* rotuer.put('/user/email/:id',verifyToken, updateUsersEmail); */
rotuer.put('/user/password/:id',verifyToken, updateUsersPassword);
export const RouterUsuer = rotuer;
