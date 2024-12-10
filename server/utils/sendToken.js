const { refreshTokenOptions, accessTokenOptions } = require("./tokenOptions");

exports.sendToken = async(user , statusCode, res) => {
    const { accessToken, refreshToken } = user.getJWTTokens();

    // save new refresh token to database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie("refreshToken", refreshToken, refreshTokenOptions)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .status(statusCode).json({ user: user, success: true });
}