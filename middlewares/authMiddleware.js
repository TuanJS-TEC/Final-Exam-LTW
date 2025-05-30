//middlewares/authMiddleware.js

function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        //ng dung da duoc xac thuc
        //cho phep request tiep tuc den route handle tiep theo
        console.log(`Authenticated access to ${req.originalUrl} by User:${req.session.user.login_name}`);
        return next();
    }else{
        console.log(`Unauthorized access attempt to ${req.originalUrl}. No active session or user in session.`);
        //Tra ve loi 401
        res.status(401).json({message:'Unauthorized. Please log in to access this resource'});
    }
}

module.exports = isAuthenticated;