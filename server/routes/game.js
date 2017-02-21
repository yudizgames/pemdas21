var queries = require("../modules/queries");
var path = require('path');
var md5 = require("md5");
var validator = require("validator");
var jwt = require('jsonwebtoken'); // use for jwt.sign
var passport = require("passport");
var randomstring = require("randomstring");
var JWTStrategy = require('../../config/passport-auth'); //passport-jwt Authorization Strategy

/**
 * Check Email Available or not
 * @param vEmail
 * @param cb
 */
function checkUser(vEmail,cb){
    queries.checkEmail({'vEmail':vEmail},cb);
}
passport.use(JWTStrategy);

module.exports = function (app,cli) {


    app.post('/ws/v1/login',function(req,res){
        cli.blue("logincall");
        var body = req.body;
        cli.blue(body);
        var $status = 404;
        var $message = "Something webnt wrong";

        queries.getUser(body,function(err,rows){
            if(err)throw err
            if(rows.length === 1){

                if(rows[0].eStatus == 'y'){
                    var hash = md5(rows[0].iUserId + Math.random() + Date.now());
                    var payload = { 'token':hash,'device':req.body.eDeviceType};
                    var token = jwt.sign(payload,"pemdas");
                    queries.setTocket({
                        'token': hash,
                        'iUserId': rows[0].iUserId,
                        'eDeviceType': req.body.eDeviceType
                    },function (err,response) {
                        if (err) throw err;
                        $status = 200;
                        $message = "Success";
                        res.json({
                            'status':$status,'message':$message,'token':token
                        })
                    });
                }else{
                    $message = 'User not active';
                    res.status(401).json({
                        'status': 401,
                        'message': $message
                    });
                }
            }else{
                $message = 'User not exists';
                res.status(401).json({
                    'status': 401,
                    'message': $message
                });
            }
        });

    });

    app.get('/ws/v1/profile',passport.authenticate('jwt',{session:false}),function(req,res){
        if (req.user.length > 0) {
            queries.getUserById({'id':req.user[0].iUserId}, function(err, record) {
                if (err) throw err;
                res.status(200).json({
                    'profile': record[0],
                    'message': 'Success'
                });
            });
        } else {
            res.status(404).json({
                'message': 'User does not exists'
            });
        }
    });

    app.get('/ws/v1/joinRoom',passport.authenticate('jwt',{session:false}),function(req,res){
        if(req.user.length > 0){
            res.status(200).json({
                'iUserId':req.user[0].iUserId
            });
        }else{
            res.status(404).json({
                'message':'User Does not exists'
            });
        }
    });

    app.get('/ws/v1/logout',passport.authenticate('jwt',{session:false}),function(req,res){
        if (req.user.length > 0){
            queries.logOut({
                "iDeviceId":req.user[0].iDeviceId
            },function (error,rows) {
                if(error) throw  error;
                res.json({
                    'status':200,
                    'message':'Logout Successfully'
                });
            });
        }else{
            res.status(404).json({
                'message': 'User does not exists'
            });
        }
    });



}