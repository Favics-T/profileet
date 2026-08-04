    import jwt from 'jsonwebtoken'

function requireAuth(req,res,next){
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer'))
    {
        return res.status(401).json({error:'no token provided'})
    }

    const token = authHeader.split(' ')[1];

    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.studioId;
        next();
    }
    catch(err){
        return res.status(401).json({error:"Invalid or expired token"})
    }
}

module.exports = requireAuth;