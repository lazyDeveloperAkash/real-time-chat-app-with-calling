const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");
const User = require("../models/userModel");
const Message = require("../models/message");
const Group = require("../models/groupModel");
const ErrorHandler = require("../utils/errorHandler");
const { sendToken } = require("../utils/sendToken");
const JWT = require('jsonwebtoken');
const { sendmail } = require("../utils/nodemailer")
const imagekit = require("../utils/imageKit").initImageKit();
const path = require("path");
const crypto = require("crypto");
const { accessTokenOptions } = require("../utils/tokenOptions");

const algorithm = 'aes-256-cbc'
const key = process.env.KEY;
const iv = crypto.randomBytes(16);


exports.homePage = (req, res, next) => {
    res.json({ msg: "hey" })
}

exports.currentUser = catchAsyncErrors(async (req, res, next) => {
    if(!req.id) return next(new ErrorHandler("Something went wrong!", 404));
    const user = await User.findById(req.id).populate({
        path: "friends",
        select: '+name +contact +_id +avatar'
    });
    if (!user) return next(new ErrorHandler("User not found!", 404));
    res.json(user);
})

exports.createGroup = catchAsyncErrors(async (req, res, next) => {
    const group = await new Group({ name: req.body?.name, creator: req.id, members: req.body?.userArr }).save();
    group.members.map(async (e) => {
        const user = await User.findById(e).exec();
        user.groups.push(group._id);
        user.save();
    })
    res.json(group);
})

exports.groupInfo = catchAsyncErrors(async (req, res, next) => {
    let group = await Group.findById(req.body.id).populate("chats").exec();
    let newArr = [];
    await Promise.all(group.chats.map(async (e) => {
        const { sender } = await Message.findById(e._id).populate('sender').exec();
        const newObj = {
            name: sender.name,
            senderImage: sender.avatar.url,
            id: sender._id,
            msg: decryption(e)
        }
        newArr.push(newObj);
    }))
    const newGroup = {
        _id: group.id,
        name: group.name,
        avatar: group.avatar,
        chats: newArr
    }
    res.json(newGroup);
})

exports.groupAvatar = catchAsyncErrors(async (req, res, next) => {
    const group = await Group.findById(req.params.id).exec();
    const file = req.files.avatar;
    const modifiedFielName = `chatApp-groupPicture${Date.now()}${path.extname(file.name)}`;
    if (group.avatar.fileId !== "") {
        await imagekit.deleteFile(group.avatar.fileId);
    }
    const { fileId, url } = await imagekit.upload({
        file: file.data,
        fileName: modifiedFielName
    })
    group.avatar = { fileId, url };
    await group.save();
    res.status(200).json({
        success: true,
        message: "Profile Image Updated !"
    })
});

exports.userSignup = catchAsyncErrors(async (req, res, next) => {
    if (!req.body) return next(new ErrorHandler("please provide user details"), 404);
    const { name, contact, email, password } = req.body;

    //null value check
    nullFieldCheck([name, contact, email, password], next);
    const user = await new User(req.body).save();
    sendToken(user, 201, res);
});

exports.userSignin = catchAsyncErrors(async (req, res, next) => {
    const { emailOrContact, password } = req.body;

    // null value check
    if (emailOrContact === "") return next("Please provide email or contact Number!");
    if (password === "") return next("Please provide password!")

    const user = await User.findOne({ $or: [{ email: emailOrContact }, { contact: emailOrContact }] }).select("+password").exec();
    if (!user) { return next(new ErrorHandler("User not Found with This Email or contact Number", 404)) };
    const isMatch = user.comparePassword(password);
    if (!isMatch) return next(new ErrorHandler("Wrong password", 500));
    sendToken(user, 200, res);
});

exports.userSignout = catchAsyncErrors(async (req, res, next) => {
    if (req.id) return next(new ErrorHandler("user not found!", 404));
    await User.findByIdAndUpdate(
        req.id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    res.clearCookie('accessToken')
        .clearCookie('refreshToken')
        .status(200).json({ message: "Successfully Singout!" });
});

exports.userAvatar = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.id).exec();
    const file = req.files.avatar;
    const modifiedFielName = `chatApp-profilePicture${Date.now()}${path.extname(file.name)}`;
    if (user.avatar.fileId !== "") {
        await imagekit.deleteFile(user.avatar.fileId);
    }
    const { fileId, url } = await imagekit.upload({
        file: file.data,
        fileName: modifiedFielName
    })
    user.avatar = { fileId, url };
    await user.save();
    res.status(200).json({
        success: true,
        message: "Profile Image Updated !"
    })
});

exports.sendMail = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;
    nullFieldCheck([email], next);
    const user = await User.findOne({ email: req.body.email }).exec();
    if (!user) {
        return next(new ErrorHandler("User not found with this email address", 404));
    }

    const otp = Math.floor(Math.random() * 9000 * 1000);
    sendmail(req, res, next, otp);
    user.resetPasswordToken = `${otp}`;
    await user.save();

    res.json({ message: "check your inbox please" })
});

exports.otpVarification = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;
    nullFieldCheck([email], next);
    const user = await User.findOne({ email: req.body.email }).exec();
    if (!user) {
        return next(new ErrorHandler("User not found with this email address", 404));
    }

    if (user.resetPasswordToken !== req.body.otp) {
        return next(new ErrorHandler("Invalid OTP", 404));
    }
    res.status(200).json({
        message: "OTP successfully varified"
    })
})

exports.forgotPasswordToChange = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;
    nullFieldCheck([email], next);

    const user = await User.findOne(email).exec();
    if (!user) {
        return next(new ErrorHandler("User not found with this email address", 404));
    }

    user.resetPasswordToken = "0";
    user.password = req.body.password;
    await user.save();

    res.status(200).json({
        message: "Password successfully changed"
    })
})

exports.userResetPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.id).select("+password").exec();
    const isMatch = user.comparePassword(req.body.oldPassword);
    if (!isMatch) { return next(new ErrorHandler("Wrong Password", 500)) }
    user.password = req.body.newPassword;
    await user.save();
    res.status(200).json({
        message: "Password successfuly reset"
    })
    sendToken(user, 201, res);
});

exports.userUpdate = catchAsyncErrors(async (req, res, next) => {
    await User.findByIdAndUpdate(req.id, req.body).exec();
    res.status(200).json({
        success: true,
        message: "User Updated Successfully !"
    })
});

exports.deleteAccount = catchAsyncErrors(async (req, res, next) => {
    await User.findByIdAndDelete(req.id).exec();
    res.status(200).json({
        success: true,
        message: "User Deleted Successfully !"
    })
});

// add some features

exports.invite = catchAsyncErrors(async (req, res, next) => {
    //error handling
    const { contact } = req.params;
    if(!contact) return next(new ErrorHandler("please provide contact details!", 404));
    const users = await User.find({ contact: { $regex: contact } }).select(['+name', '+contact', '+_id', '+avatar']).limit(10).exec();
    res.status(200).json({ users });
});

exports.newChat = catchAsyncErrors(async (req, res, next) => {
    if (req.params.newUserId) return next(new ErrorHandler("User id not available!"), 404);
    const user = await User.findById(req.params.newUserId).select(['+name', '+contact', '+_id', '+avatar']).exec();
    if (!user) return next(new ErrorHandler("User not found!"), 404);
    res.status(200).json({ user });
});

exports.getChat = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params; // Receiver ID
    const userId = req.id;  // Current user ID

    const messages = await Message.aggregate([
        // Match chats involving the current user and the receiver
        {
            $match: {
                $or: [
                    { sender: mongoose.Types.ObjectId(userId), receaver: mongoose.Types.ObjectId(id) },
                    { sender: mongoose.Types.ObjectId(id), receaver: mongoose.Types.ObjectId(userId) }
                ]
            }
        },

        // Sort chats by creation time (assuming a 'createdAt' field exists)
        // {
        //     $sort: { createdAt: 1 }
        // },

        // Decrypt messages using $addFields and $function
        // {
        //     $addFields: {
        //         decryptedMsg: {
        //             $function: {
        //                 body: 'function(chat) { return decryption(chat); }',
        //                 args: ['$$CURRENT'],
        //                 lang: 'js'
        //             }
        //         }
        //     }
        // },

        // // Project the required fields (optional)
        // {
        //     $project: {
        //         sender: 1,
        //         receaver: 1,
        //         msg: '$decryptedMsg',
        //         iv: 1,
        //         createdAt: 1
        //     }
        // }
    ]);

    // Return the aggregated result
    // res.json(receaver[0] || {});
    console.log(decryption(messages))
});

exports.chatUser = catchAsyncErrors(async (req, res, next) => {
    if (req.params.id) return next(new ErrorHandler("Please provide an valid id!", 404));
    const chatUser = User.findById(req.params.id).select(["+name", "+_id", "+contact", "+email"]);
    if (chatUser) return next(new ErrorHandler("User not found!", 404));
    res.status(200).json({ chatUser });
})


exports.msgUpload = catchAsyncErrors(async (req, res, next) => {
    var user;
    if (req.body.isGroup) user = await Group.findById(req.body.receaver).exec();
    else user = await User.findById(req.body.receaver).exec();
    const loggedinUser = await User.findById(req.id).exec();
    const data = encryption(req.body.msg);
    const message = await new Message({ sender: req.id, receaver: user._id, msg: data.msg, iv: data.iv }).save();
    loggedinUser.chats.push(message._id);
    user.chats.push(message._id);
    loggedinUser.save();
    user.save();
});

exports.generateAccessToken = catchAsyncErrors(async (req, res, next) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return next(new ErrorHandler("refresh token not found!", 404));

    const { id } = JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!id) return next(new ErrorHandler("invalid refresh token!", 401));

    //get refresh token from database
    const user = await User.findById(id);

    //compare incoming and database refresh token
    if (user?.refreshToken !== refreshToken) return next(new ErrorHandler("invalid refresh expiered!", 401));

    const accessToken = JWT.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE
    })
    res.cookie("accessToken", accessToken, accessTokenOptions)
        .status(200).json({ accessToken: accessToken, success: true });
});

exports.hello = catchAsyncErrors(async (req, res, next) => {
    res.json({ message: "hello" })
});

const encryption = (msg) => {
    try {
        const cypher = crypto.createCipheriv(algorithm, key, iv);
        let encryptData = cypher.update(msg, "utf-8", "hex");
        encryptData += cypher.final("hex");
        // for mongodb formate
        const base64Data = Buffer.from(iv, 'binary').toString('base64');
        return { msg: encryptData, iv: base64Data };
    } catch (error) {
        console.log(error)
    }
}

const decryption = (arr) => {
    console.log(arr)
    try {
        return arr.map((obj) => {
            const originalData = Buffer.from(obj.iv, 'base64');
            const decypher = crypto.createDecipheriv(algorithm, key, originalData);
            let decryptData = decypher.update(obj.msg, "hex", "utf-8");
            decryptData += decypher.final("utf-8");
            obj.msg = decryptData;
        })
    } catch (error) {
        console.log(error)
    }
}

// null value check
const nullFieldCheck = (arr, next) => {
    if (Array.isArray(arr)) return;
    const nullField = arr.some((field) => field?.trim() === "");
    if (nullField) return next(new ErrorHandler(`Please provide value of ${nullField} field !`));
    return;
}