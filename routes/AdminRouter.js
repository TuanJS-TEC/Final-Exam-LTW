//routes/AdminRouter.js
const express = require('express');
const router = express.Router();
const User = require('../db/userModel');

//Post /admin/login
router.post('/login', async(req, res)=>{
    const { login_name } = req.body;

    //Kiem tra login_nam co duoc cung cap chua
    if(!login_name){
        console.log('Login failed: login_name not provided.');
        return res.status(400).json({message:'Login name is required'});
    }

    //tim nguoi dung trong csdl bang login_name
    try{
        const user = await User.findOne({login_name:login_name}).select('_id first_name last_name login_name location description occupation');

        //xu ly ket qua
        if(!user){
            console.log(`Login attempt failed: User with login_name "${login_name}" not found`);
            return res.status(400).json({message:'Invalid login name'});
        }

        //Luu thong tin nguoi dung vao session
        req.session.user = {
            _id: user._id,
            login_name: user.login_name,
            first_name: user.first_name,
            last_name: user.last_name,

        }

        //Ghi lai session de dam bao dc luu truoc khi gui response
        req.session.save((err)=>{
            if(err){
                console.error('session save error:',err);
                return res.status(500).json({message:'session failed due to server error while saving session. '});
            }
            console.log(`User ${user.login_name} is logged in. Session created.`);
            res.status(200).json({
                _id: user._id,
                login_name: user.login_name,
                first_name: user.first_name,
                last_name: user.last_name,
            });
        });

    } catch(err){
        console.error('Error during login process: ', error);
        res.status(500).json({message:'server error during login process.'});
    }
});

//Post /admin/logout
router.post('/logout',(req,res) => {
    //Kiem tra xem nguoi dung da dang nhap chua (co session khong)
    if(req.session && req.session.user){
        const loggedInUser = req.session.user.login_name;//lay login_name
        //Neu co, xoa session
        req.session.destroy((err)=>{
            if(err){
                //Neu co loi khi xoa session
                console.error('error destroy session', err);
                return res.status(500).json({message:'Logout failed due to server error.'});
            }

            //Xoa session thanh cong
            //Xoa cookie session phia client = cach clearcookie
            res.clearCookie('connect.sid');
            console.log(`User ${loggedInUser} logged out successfully. Session destroyed.`);
            return res.status(200).json({message:'Logout successfully'});
        });
    } else{
        //Neu ng dung chua dang nhap
        console.log('Logout attempt failed: No active session found.');
        return res.status(400).json({message:'You are not currently logged in.'});
    }
});

module.exports = router;