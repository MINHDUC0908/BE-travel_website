const User = require("../../model/User");


class VerifyController
{
    async verify(req, res)
    {
        try {
            const { verificationToken } = req.params;
            console.log(verificationToken)
            const user = await User.findOne({ where: { verificationToken: verificationToken } });
            console.log(user)
            await user.update({
                isVerified: true,
                verificationToken: null
            })

            return res.json({
                success: true,
                data: user
            })
        } catch (error) {
            console.error("Lỗi xác thực:", error);
            return res.status(500).json({ message: "Lỗi server!" });
        }
    }
}

module.exports = new VerifyController()