const authRouter = require("../router/Auth")
const tourRouterAdmin = require("../router/Admin/TourRouter")
const imageRouterAdmin = require("../router/Admin/ImageRouer")
const scheduleRouterAdmin = require("../router/Admin/ScheduleRouter")
const userRouterAdmin = require("../router/Admin/UserRouter")
const tourcategoriesAdmin = require("../router/Admin/TourCategoryRouter")


const tourRouterCustomer = require("../router/Customer/TourRouter")
const tourCategoryRouterCustomer = require("../router/Customer/TourCategoryRouter")
const authMiddleware = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/checkAdmin")
function router(app) {
    app.use('/auth', authRouter);
    
    //Customer
    app.use('/api/tour', tourRouterCustomer)
    app.use('/api/tourCategory', tourCategoryRouterCustomer)
    
    // Admin
    app.use('/api/user', userRouterAdmin);
    app.use('/api/admin/tourcategories', tourcategoriesAdmin);
    app.use('/api/admin/tour', authMiddleware, tourRouterAdmin)
    app.use('/api/admin/image', authMiddleware, imageRouterAdmin)
    app.use('/api/admin/schedule', authMiddleware, scheduleRouterAdmin)
}

module.exports = router;
