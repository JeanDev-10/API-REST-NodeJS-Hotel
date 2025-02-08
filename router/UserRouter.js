import express from 'express';
import { login,updateUsersPassword,getOneUser, me, logout,createUsers, loginWithGoogle, loginWithGithub} from '../controller/UserController.js';
import  {verifyToken}  from '../middleware/auth.js';
import { ValidateCreateUser } from '../middleware/validations/validateCreateUser.js';
import { ValidateLoginUser } from '../middleware/validations/ValidateLoginUser.js';
import { ValidateChangePasswordUser } from '../middleware/validations/ValidateChangePasswordUser.js';
import { verifyIsAdmin } from '../middleware/role.js';
import { ValidateFirebaseToken } from '../middleware/validations/ValidateFirebaseToken.js';
const rotuer = express.Router();
rotuer.post('/register',ValidateCreateUser,createUsers);
rotuer.post('/login', ValidateLoginUser,login);
rotuer.get('/me', verifyToken,me);
rotuer.get('/logout',verifyToken, logout);
rotuer.get('/user/:id/reservations',verifyToken,verifyIsAdmin, getOneUser); 

rotuer.put('/user/password',verifyToken,ValidateChangePasswordUser, updateUsersPassword);

rotuer.post("/google-auth", ValidateFirebaseToken ,loginWithGoogle);
rotuer.post("/github-auth", ValidateFirebaseToken ,loginWithGithub);

export const RouterUsuer = rotuer;
