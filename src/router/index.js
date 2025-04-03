const authRouter = require("../router/Auth")
const tourRouterAdmin = require("../router/Admin/TourRouter")
const imageRouterAdmin = require("../router/Admin/ImageRouer")
const scheduleRouterAdmin = require("../router/Admin/ScheduleRouter")
const userRouterAdmin = require("../router/Admin/UserRouter")
const tourcategoriesAdmin = require("../router/Admin/TourCategoryRouter")
const bookingRouterAdmin = require("../router/Admin/BookingRouter")
const vnpayController = require("./Admin/VnpayRouter")
const zalopayController = require("./Admin/ZalopayRouter")


const tourRouterCustomer = require("../router/Customer/TourRouter")
const bookingRouterCustomer = require("../router/Customer/BookingRouter")
const tourCategoryRouterCustomer = require("../router/Customer/TourCategoryRouter")
const authMiddleware = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/checkAdmin")
function router(app) {
    app.use('/auth', authRouter);
    
    //Customer
    app.use('/api/tour', tourRouterCustomer)
    app.use('/api/tourCategory', tourCategoryRouterCustomer)
    app.use('/api/booking',authMiddleware, bookingRouterCustomer)
    
    // Admin
    app.use('/api/user', userRouterAdmin);
    app.use('/api/admin/tourcategories',authMiddleware, authorizeAdmin, tourcategoriesAdmin);
    app.use('/api/admin/tour', authMiddleware, authorizeAdmin, tourRouterAdmin)
    app.use('/api/admin/image', authMiddleware, authorizeAdmin, imageRouterAdmin)
    app.use('/api/admin/schedule', authMiddleware, authorizeAdmin, scheduleRouterAdmin)
    app.use("/api/admin/booking", authMiddleware, authorizeAdmin, bookingRouterAdmin)
    app.use("/api/vnpay", vnpayController)
    app.use("/api/zalopay", zalopayController)
}

module.exports = router;
