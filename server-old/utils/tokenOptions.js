const refreshTokenOptions = {
    expires: new Date(
        Date.now() + +process.env.REFRESH_TOKEN_EXPIRE.charAt(0) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only for HTTPS in production
    // sameSite: 'none',
}

const accessTokenOptions = {
    expires: new Date(
        Date.now() + +process.env.ACCESS_TOKEN_EXPIRE.substring(0, 2) * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only for HTTPS in production
    // sameSite: 'none',
}

module.exports = { refreshTokenOptions, accessTokenOptions }