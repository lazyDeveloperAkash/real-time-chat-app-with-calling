const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middlewares/auth")
const { homePage, currentUser, userSignup, userSignin, userSignout, chatwithUser, userAvatar, sendMail, otpVarification, forgotPasswordToChange, userUpdate, userResetPassword, invite, newChat, msgUpload, groupInfo, createGroup, groupAvatar, deleteAccount, generateAccessToken } = require("../controllers/indexController");

router.get("/", homePage);
router.get("/user", isAuthenticated, currentUser);
router.get("/singout", userSignout)
router.post("/signup", userSignup);
router.post("/signin", userSignin);

//delete account
router.get("/delete", isAuthenticated, deleteAccount);

//group create
router.post("/createGroup", isAuthenticated, createGroup);

//profile picture of group
router.post("/groupAvatar", isAuthenticated, groupAvatar);

//get group info
router.post("/group-info", isAuthenticated, groupInfo);

// update profile
router.post("/update-profile", isAuthenticated, userUpdate);

// change password
router.post("/update-password", isAuthenticated, userResetPassword);

//send email
router.post("/send-email", sendMail);

//otp varification
router.post("/otp-varification", otpVarification);

//forget the password
router.post("/forget-password-change", forgotPasswordToChange);

//avatar
router.post("/upload-profile-picture", isAuthenticated, userAvatar);

//--------------------------------CRED-------------------------------------------

// invite 
router.post("/invite", isAuthenticated, invite);

//new chat
router.post("/new-chat", isAuthenticated, newChat);

// get details for onclick
router.post("/chat", isAuthenticated, chatwithUser);

// message upload
router.post("/msg-upload", isAuthenticated, msgUpload);

//get access token
router.post('/access-token', generateAccessToken);


module.exports = router;