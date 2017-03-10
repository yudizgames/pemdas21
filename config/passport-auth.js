var queries = require("../server/modules/queries");
/**
 * Passport Jwt Strategry Define
 */
var passportJWT = require("passport-jwt");
var ExtractJwt = passportJWT.ExtractJwt; //ExteactJwt Tocken
var JwtStrategry = passportJWT.Strategy; //Define JwtStrategry
var jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = 'pemdas';
stretegry = new JwtStrategry(jwtOptions,function(jwt_payload,next){
    console.log('auth call');
    console.log(JSON.stringify(jwt_payload));
    queries.authenticate({
        'token':jwt_payload.token,
        'device':jwt_payload.device,
        'vUserType':jwt_payload.vUserType
    },function(err,user){
        if(err){
            next(err,false);
        }else if(user){
            console.log("***************************************************************");
            console.log(JSON.stringify(user));
            console.log("***************************************************************");
            next(null,user);
        }else{
            next(null,false);
        }
    })
});

module.exports = stretegry;



