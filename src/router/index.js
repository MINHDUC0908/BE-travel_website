const authRouter = require("../router/Auth")

const messageRouter = require("../router/MessageRouter")


const tourRouterAdmin = require("../router/Admin/TourRouter")
const imageRouterAdmin = require("../router/Admin/ImageRouer")
const scheduleRouterAdmin = require("../router/Admin/ScheduleRouter")
const userRouterAdmin = require("../router/Admin/UserRouter")
const tourcategoriesAdmin = require("../router/Admin/TourCategoryRouter")
const bookingRouterAdmin = require("../router/Admin/BookingRouter")
const vnpayController = require("./Admin/VnpayRouter")
const zalopayController = require("./Admin/ZalopayRouter")
const contactRouterAdmin = require("./Admin/ContactRouter")


const tourRouterCustomer = require("../router/Customer/TourRouter")
const bookingRouterCustomer = require("../router/Customer/BookingRouter")
const tourCategoryRouterCustomer = require("../router/Customer/TourCategoryRouter")
const ratingRouterCustomer = require("../router/Customer/RatingRouter")
const contactRouterCustomer = require("../router/Customer/ContactRouter")
const chatBoxRouter = require("../router/Customer/ChatBotRouter")
const profileRouter = require("../router/Customer/ProflieRouter")
const favoriteRouter = require("../router/Customer/FavoriteRouter")

const authMiddleware = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/checkAdmin")
function router(app) {
    app.use('/auth', authRouter);
    
    //Customer
    app.use('/api/tour', tourRouterCustomer)
    app.use('/api/tourCategory', tourCategoryRouterCustomer)
    app.use('/api/booking',authMiddleware, bookingRouterCustomer)
    app.use('/api/rating', ratingRouterCustomer)
    app.use('/api/contact', contactRouterCustomer)
    app.use('/api/chatbox', chatBoxRouter)
    app.use('/api/profile', authMiddleware, profileRouter)
    app.use('/api/favorite', authMiddleware, favoriteRouter)


    
    // Admin
    app.use('/api/user', userRouterAdmin);
    app.use('/api/admin/tourcategories',authMiddleware, authorizeAdmin, tourcategoriesAdmin);
    app.use('/api/admin/tour', authMiddleware, authorizeAdmin, tourRouterAdmin)
    app.use('/api/admin/image', authMiddleware, authorizeAdmin, imageRouterAdmin)
    app.use('/api/admin/schedule', authMiddleware, authorizeAdmin, scheduleRouterAdmin)
    app.use("/api/admin/booking", authMiddleware, authorizeAdmin, bookingRouterAdmin)
    app.use("/api/vnpay", vnpayController)
    app.use("/api/zalopay", zalopayController)
    app.use("/api/admin/contact", authMiddleware, authorizeAdmin, contactRouterAdmin)


    app.use('/api/message', authMiddleware, messageRouter);
}

module.exports = router;
