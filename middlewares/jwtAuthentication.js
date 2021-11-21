const jwt=require('jsonwebtoken');
const jwt_key=process.env.JWT_KEY;

function jwtCheckToken(req,res,next){
    let header=req.header('Authorization');
    if(!header) header=req.headers['Authorization'];
    if(!header){
        res.status(401).send({
            success:false,
            error:'Invalid Token!'
        });
        return;
    }
    const [type,token] = header.split(' ');
    if(type === 'Bearer' && typeof token!=='undefined'){
        try{
            let data=jwt.verify(token,jwt_key);
            // data to be manipulated *************
            // req.body.name=data['name'];
            req.body._id=data['_id'];
            //********************************** */ 
            next();
        }catch(e){
            console.log("EXPIRED TOKEN");
            res.status(401).send({
                success:false,
                error:'Invalid or expired Token!'
            });
        }
    }else{
        console.log("INVALID TOKEN");
        res.status(401).send({
            success:false,
            error:'Invalid Token!'
        });
    }
}

module.exports=jwtCheckToken;