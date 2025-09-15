const authorizeRoles = (...allowedROles) =>{
    return (req, res, next) => {
        if(!allowedROles.includes(req.user.sRole)){
            return res.status(403).json({message: "Access denied"})
        }
        next()
}}

module.exports = authorizeRoles;