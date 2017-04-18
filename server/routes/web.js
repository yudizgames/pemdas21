var formidable = require("formidable");
var queries = require("../modules/queries");
var queries_v1 = require("../modules/queries_v1");
var md5 = require("md5");
var path = require('path');
var validator = require("validator");
var jwt = require('jsonwebtoken'); // use for jwt.sign
var passport = require("passport");
var randomstring = require("randomstring");
var JWTStrategy = require('../../config/passport-auth'); //passport-jwt Authorization Strategy
var async = require("async");
var dateFormat = require("dateformat");

passport.use(JWTStrategy);
module.exports = function (app,cli,mail) {
    cli.green("Connection database");
    cli.blue("Web API Call");
    app.get('/', function (req, res) {
        console.log("Login Page request");
        console.log("lgoin page call"+req);
        res.render('index');
    });

    app.post('/login',function(req,res){
        var body = req.body;
        var $status = 404;
        var $message = "Please Check your email/password";
        queries.getUserAdmin(body,function(err,rows){
            console.log(JSON.stringify(rows));
            if(err)throw err;
            if(rows.length === 1){
                if(rows[0].eStatus == 'y'){

                    var hash = md5(rows[0].iUserId + Math.random() + Date.now());
                    var payload = { 'token':hash,'device':'DeskTop','vUserType':rows[0].vUserType};
                    var token = jwt.sign(payload,"pemdas");
                    queries.setTocket({
                        'token': hash,
                        'iUserId': rows[0].iUserId,
                        'eDeviceType': 'Desktop'
                    },function (err,response) {
                        if (err) throw err;
                        cli.blue("After Insert");
                        $status = 200;
                        $message = "Success";
                        res.json({
                            'status':$status,'message':$message,'token':token,'vUserType':rows[0].vUserType,'vUserName':rows[0].vFullName,'iUserId':rows[0].iUserId
                        })
                    })

                }else{
                    res.json({
                        'status': $status,
                        'message': "Currently you are not active, please contact admin "
                    });
                }
            }else{
                res.json({
                    'status': $status,
                    'message': $message
                });
            }
        });
    });

    app.post('/signup',function(req,res){

        req.checkBody("vEmail","Email must be required").notEmpty().isEmail();
        req.checkBody("vFullName","Full Name must be required").notEmpty();
        req.checkBody("vParentType","Parent Type or Teacher must be required").notEmpty();
        var validatorError = req.validationErrors();
        req.getValidationResult().then(function(result) {
            if (!result.isEmpty()) {
                res.json({
                    "status": 404,
                    "message": "Please fill all required value",
                    "Data":result.mapped()
                });
            }else{

                var vPassword = randomstring.generate(6);

                queries.checkEmail(req.body,function(err,resultOne){

                    if(resultOne.length){
                        res.json({
                            "status":404,
                            "message":'Email Address Available'
                        });
                    }else{

                        queries.addUser({"vUserType":"client","vFullName":req.body.vFullName,"vUserName":req.body.vEmail,"vEmail":req.body.vEmail,"vPassword":vPassword},function(err,rows){
                            if(err) throw err;
                            if(rows.affectedRows > 0){
                                queries.addParent({"iUserId":rows.insertId,"vParentType":req.body.vParentType},function(errors,row){
                                    if(row.affectedRows > 0){

                                        //Send Mail
                                        var mailOptions = {
                                            from: '"SYSTEMIC21" <info@systeemic21.com>', // sender address
                                            to: req.body.vEmail, // list of receivers
                                            subject: 'Hello '+ req.body.vFullName, // Subject line
                                            text: 'One time password  : ' + vPassword // plaintext body
                                        };
                                        mail.sendMail(mailOptions,function(err,info){
                                            if(err){
                                                cli.red("Mail not send");
                                                console.log(err);
                                            }else{
                                                cli.yellow("Mail send");
                                            }
                                        });
                                        //Send mail end


                                        res.json({
                                            "status":200,
                                            "message":"Please check your email to activate your account."
                                        });

                                    }
                                    else{
                                        res.json({
                                            "status":400,
                                            "message":"Something went wrong"
                                        });
                                    }

                                });
                            }else{
                                res.json({
                                    "status":400,
                                    "message":"Something went wrong"
                                });
                            }
                        });
                    }

                });
            }
        });
    });

    app.post('/logout',passport.authenticate('jwt',{session:false}),function (req,res) {
        if(req.user.length > 0 ){
            queries.logOut({
                "iDeviceId":req.user[0].iDeviceId
            },function (error,rows) {
                cli.blue("Call for success");
                res.json({
                    'status':200,
                    'message':'Logout Successfully'
                });
            });
        }else{
            res.json({
                "status":200,
                'message':"Unauthorized"
            })
        }
    })

    app.post('/cpass',passport.authenticate('jwt',{session:false}),function(req,res){

        if(req.user.length > 0 ){
            var postData = {
                "iUserId":req.user[0].iUserId,
                "vNewPassword":req.body.vNewPassword,
                "vOldPassword":req.body.vOldPassword
            }

            if(req.body.vNewPassword == req.body.vOldPassword){
                res.json({
                    'status':400,
                    'message': 'Old password and new password should not be same.'
                })
            }else{
                queries.checkPassword(postData,function(error,user){
                    if(user.length > 0){ cli.green("Password Check");
                        queries.changePassword(postData,function(error,rows){
                            cli.green("Password Change");
                            if (error) throw error;
                            res.json({
                                'status':200,
                                'message':'Password Changed Successfully.'
                            });
                        })
                    }else{
                        res.json({
                            'status':400,
                            'message': 'Old password does not match.'
                        })
                    }
                })

            }
        }else{
            res.json({
                'status':404,
                'message':'Unauthorized'
            });
        }

    });

    app.post('/fpass',function(req,res){
        if(validator.isEmail(req.body.vEmail) && !validator.isEmpty(req.body.vEmail)){
            queries.checkEmail(req.body,function(err,resultOne){
                cli.green("Check This one");
                if(resultOne.length){
                    var pass = randomstring.generate(6);
                    var queryData = {
                        'vNewPassword':pass,
                        "vEmail":req.body.vEmail
                    }
                    queries.forgotPass(queryData,function(err,resultTwo){
                        if(err) throw  err;
                        var mailOptions = {
                            from: '"SYSTEMIC21" <info@systeemic21.com>', // sender address
                            to: req.body.vEmail, // list of receivers
                            subject: 'Hello '+ resultOne[0].vFullName, // Subject line
                            text: 'Your temporary password : ' + pass // plaintext body
                        };
                        mail.sendMail(mailOptions,function(err,info){
                            if(err){
                                cli.red("Mail not send");
                                console.log(err);
                            }
                        });
                        res.status(200).json({
                            'status':200,
                            'message':"OTP sent on your emai."
                        })
                    })
                }else{
                    res.json({
                        "status":404,
                        "message":'User not active'
                    });
                }

            });
        }else{
            res.json({
                "status":404,
                "message":"User is not registered."
            })
        }
    });

    app.post('/settings',passport.authenticate('jwt',{session:false}),function(req,res){
        cli.blue("Setting call");
        if(req.user.length > 0){
            queries.getSettings(req,function(error,rows){
                res.json({
                    'status':200,
                    'message':'Success',
                    'result':rows
                })
            });
        }else{
            res.json({
                "status":404,
                "message":'User not active'
            })
        }
    });

    app.post('/settingspost',passport.authenticate('jwt',{session:false}),function(req,res){
        cli.blue("Setting call");
        if(req.user.length > 0){
            cli.blue("PAth");


            var form = new formidable.IncomingForm();
            // specify that we want to allow the user to upload multiple files in a single request
            //form.multiples = true;
            // store all uploads in the /uploads directory
            form.uploadDir = path.join(__dirname, '/uploads');


            // every time a file has been uploaded successfully,
            // rename it to it's orignal name
            form.on('file', function(field, file) {
                var filename = md5(new Date().getTime() + file.name + req.user[0].iUserId) + path.extname(file.name);
                fs.rename(file.path, path.join(form.uploadDir, filename));
                services.saveSettings([filename, field], function(err, row) {});

            });
            form.on('field', function(field, value) {
                queries.saveSettings([value, field], function(err, row) {
                    if (err) throw err;
                });
            });

            // log any errors that occur
            form.on('error', function(err) {
                //console.log('An error has occured: \n' + err);
                res.status(404).json({
                    'message': err
                });
            });

            // once all the files have been uploaded, send a response to the client
            form.on('end', function() {
                res.status(200).json({
                    'message': 'Settings has been updated successfully'
                });
            });

            // parse the incoming request containing the form data
            form.parse(req);

        }else{
            res.json({
                "status":404,
                "message":'User not active'
            })
        }
    });

    //User Module
    /**
     *  Data Table With Server Side Rendering Start
     */
    app.post('/user_list',passport.authenticate('jwt',{session:false}),function(req,res){


        cli.yellow(JSON.stringify(req.user));

        queries.getUserById({"id":req.user[0].iUserId},function(error,users){
            cli.blue(JSON.stringify(users));
            var obj = {
                'vUserName': req.body.search.value, //Search Apply for default search text box
                'vEmail': req.body.search.value,//Search Apply for default search text box
                'iUserId':req.user[0].iUserId,
                'vUserType':users[0].vUserType
            };

            if(users[0].vUserType == 'client' )
            {
                cli.yellow("*************************************************************");
                queries.ls_user_count(obj, function(err, record) {
                    var iTotalRecords = parseInt(record[0].iTotalRecords);
                    var iDisplayLength = parseInt(req.body.length);
                    iDisplayLength = iDisplayLength < 0 ? iTotalRecords : iDisplayLength;
                    var iDisplayStart = parseInt(req.body.start);
                    var end = iDisplayStart + iDisplayLength;
                    end = end > iTotalRecords ? iTotalRecords : end;
                    var obj = {
                        'limit': end,
                        'offset': iDisplayStart,
                        'vFullName': req.body.search.value,
                        'vEmail': req.body.search.value,
                        'sort':getSorting(req.body),
                        'iParentId':req.user[0].iUserId,
                    };
                    queries.ls_user_select(obj, function(err, users) {
                        if (err) return err;
                        var i = 0;
                        var records = {};
                        records['draw'] = req.body.draw;
                        records['recordsTotal'] = iTotalRecords;
                        records['recordsFiltered'] = iTotalRecords;
                        records['data'] = [];
                        for (var key in users) {
                            // var status = '<input bs-switch ng-model="'+users[i].eStatus+'" value="'+users[i].eStatus+'" class="switch-small" type="checkbox" ng-true-value="&apos;y&apos;" ng-false-value="&apos;n&apos;" ng-change="onUserStatusChange(&apos;'+users[i].eStatus+'&apos;,'+users[i].iUserId+')">';
                            var operation = '<button style="color: #ffffff; margin-right: 10px;" ng-click="userOperation('+users[i].iUserId+',&quot;view&quot;)" title="View"  class="btn btn-raised btn-xs bg-light-blue waves-effect">View</button>';
                            operation+= '<button style="color: #ffffff; margin-right: 10px;" ng-click="userOperation('+users[i].iUserId+',&quot;edit&quot;)" title="Edit"  class="btn btn-raised btn-xs bg-orange waves-effect">Edit</button>';
                            operation+= '<button style="color: #ffffff; margin-right: 10px;" ng-click="userOperation('+users[i].iUserId+',&quot;delete&quot;)" title="Delete"  class="btn btn-raised btn-xs bg-red waves-effect">Delete</button>';
                            records['data'][i] = {"iUserId":users[i].iUserId,"vFullName":users[i].vFullName,"vEmail":users[i].vEmail,"eStatus":users[i].eStatus,"vOperation":operation,"vUserType":users[i].vUserType};
                            i++;

                        }
                        res.json(records);
                    });
                });



            }else{

                cli.red("*************************************************************");

                queries.ls_user_count(obj, function(err, record) {
                    var iTotalRecords = parseInt(record[0].iTotalRecords);
                    var iDisplayLength = parseInt(req.body.length);
                    iDisplayLength = iDisplayLength < 0 ? iTotalRecords : iDisplayLength;
                    var iDisplayStart = parseInt(req.body.start);
                    var end = iDisplayStart + iDisplayLength;
                    end = end > iTotalRecords ? iTotalRecords : end;
                    var obj = {
                        'limit': end,
                        'offset': iDisplayStart,
                        'vFullName': req.body.search.value,
                        'vEmail': req.body.search.value,
                        'sort':getSorting(req.body),
                        'vUserType':users[0].vUserType
                    };
                    queries.ls_user_select(obj, function(err, users) {
                        if (err) return err;
                        var i = 0;
                        var records = {};
                        records['draw'] = req.body.draw;
                        records['recordsTotal'] = iTotalRecords;
                        records['recordsFiltered'] = iTotalRecords;
                        records['data'] = [];
                        for (var key in users) {
                            // var status = '<input bs-switch ng-model="'+users[i].eStatus+'" value="'+users[i].eStatus+'" class="switch-small" type="checkbox" ng-true-value="&apos;y&apos;" ng-false-value="&apos;n&apos;" ng-change="onUserStatusChange(&apos;'+users[i].eStatus+'&apos;,'+users[i].iUserId+')">';
                            var operation = '<button style="color: #ffffff; margin-right: 10px;" ng-click="userOperation('+users[i].iUserId+',&quot;view&quot;)" title="View"  class="btn btn-raised btn-xs bg-light-blue waves-effect">View</button>';
                            operation+= '<button style="color: #ffffff; margin-right: 10px;" ng-click="userOperation('+users[i].iUserId+',&quot;edit&quot;)" title="Edit"  class="btn btn-raised btn-xs bg-orange waves-effect">Edit</button>';
                            operation+= '<button style="color: #ffffff; margin-right: 10px;" ng-click="userOperation('+users[i].iUserId+',&quot;delete&quot;)" title="Delete"  class="btn btn-raised btn-xs bg-red waves-effect">Delete</button>';
                            records['data'][i] = {"iUserId":users[i].iUserId,"vFullName":users[i].vFullName,"vEmail":users[i].vEmail,"eStatus":users[i].eStatus,"vOperation":operation,"vUserType":users[i].vUserType};
                            i++;
                        }
                        res.json(records);
                    });
                });



            }


        });


    });
    /**
     *  Data Table With Server Side Rendering End
     */


    /**
     *  When Client Add New User
     */

    app.post('/useradd',passport.authenticate('jwt',{session:false}),function (req,res) {
        if(req.user.length > 0){
            cli.blue("Check Email");
            cli.blue(validator.isEmail(req.body.vEmail));
            if(!validator.isEmpty(req.body.vFullName) && validator.isEmail(req.body.vEmail)){
                checkUser(req.body.vEmail,function(error,isActive){
                    if(error) throw error;
                    if(isActive.length > 0){
                        res.json({
                            "status":404,
                            "message":"User already available"
                        });
                    }else{
                        var vPassword = randomstring.generate(6);

                        /**
                         * Check Which User Add value super_admin or client
                         */
                        queries.getParentId({'iUserId':req.user[0].iUserId},function(e,parent){
                            if(e) throw e;
                            /**
                             * Add User
                             */
                            queries.addUser({"vUserType":'user',"vFullName":req.body.vFullName,"vUserName":req.body.vEmail,"vEmail":req.body.vEmail,"vPassword":vPassword},function(err,rows){
                                if(err) throw err;
                                if(rows.affectedRows > 0){

                                    queries.addChild({"iUserId":rows.insertId,"iParentId":parent[0].iParentId},function(errors,child){

                                        queries.addExamUser({"iParentId":parent[0].iParentId,"iUserId":rows.insertId},function(errorAddExamUser,examUser){

                                            if(errorAddExamUser) throw  errorAddExamUser;

                                            if(child.affectedRows > 0) {
                                                //Send Mail
                                                var mailOptions = {
                                                    from: '"SYSTEMIC21" <info@systeemic21.com>', // sender address
                                                    to: req.body.vEmail, // list of receivers
                                                    subject: 'Hello '+ req.body.vFullName, // Subject line
                                                    text: 'One time password  : ' + vPassword // plaintext body
                                                };
                                                mail.sendMail(mailOptions,function(err,info){
                                                    if(err){
                                                        cli.red("Mail not send");
                                                        console.log(err);
                                                    }else{
                                                        cli.yellow("Mail send");
                                                    }
                                                });
                                                //Send mail end


                                                res.json({
                                                    "status":200,
                                                    "message":"User Inserted Successfully."
                                                });

                                            }else{

                                                res.json({
                                                    "status":400,
                                                    "message":"Something went wrong"
                                                });

                                            }


                                        })

                                    });

                                }else{
                                    res.json({
                                        "status":400,
                                        "message":"Something went wrong"
                                    });
                                }
                            });


                        });





                    }
                });
            }else{
                res.json({
                    "status":404,
                    "message":"Please fill all required value"
                });
            }
        }else{
            res.json({
                "status":404,
                "message":'User not active'
            })
        }

    });

    app.post('/useroperation',passport.authenticate('jwt',{session:false}),function(req,res){

        if(!validator.isEmpty(req.body.id) && !validator.isEmpty(req.body.vOperation)){
            cli.blue("inside");
            console.log("Inside");
            if(req.user.length > 0 ){

                if(req.body.vOperation == 'view'){
                    queries.getUserById({"id":req.user[0].iUserId},function(error,users){
                        cli.blue("view call");
                        if(users[0].vUserType == 'client' ){
                            queries.getUserFroByIdForClient({'id':req.body.id},function(error,rows){
                                if(rows.length > 0){
                                    res.json({
                                        'status':200,
                                        'message':'success',
                                        'result':rows
                                    });
                                }else{
                                    res.json({
                                        'status':404,
                                        'message':'User Not Found',
                                    })
                                }
                            });

                        }else{
                            queries.getUserFroById({'id':req.body.id},function(error,rows){
                                if(rows.length > 0){
                                    res.json({
                                        'status':200,
                                        'message':'success',
                                        'result':rows
                                    });
                                }else{
                                    res.json({
                                        'status':404,
                                        'message':'User Not Found',
                                    })
                                }
                            });
                        }
                    });

                }else if(req.body.vOperation == 'edit'){



                    if(req.user[0].vUserType == 'client' ){
                        if(!validator.isEmpty(req.body.vFullName)){
                            cli.green("Edit call");
                            cli.red(req.body.id);
                            queries.updateUserById({'id':req.body.id,'vFullName':req.body.vFullName},function(err,rows){
                                if(err) throw err;
                                res.status(200).json({
                                    'message':'User updated successfully.'
                                });
                            });
                        }else{
                            res.json({
                                "status":404,
                                "message":"Please fill all required value"
                            });
                        }
                    }else{
                        if(!validator.isEmpty(req.body.vFullName)){
                            cli.green("Edit call");
                            cli.red(req.body.id);
                            queries.updateUserById({'id':req.body.id,'vFullName':req.body.vFullName},function(err,rows){
                                if(err) throw err;
                                res.status(200).json({
                                    'message':'User updated successfully.'
                                });
                            });
                            queries.updateTbl_parent({'id':req.body.id,'vParentType':req.body.vParentType},function(errParent,rowsParent){
                                if(errParent) throw errParent;
                            });
                        }else{
                            res.json({
                                "status":404,
                                "message":"Please fill all required value"
                            });
                        }
                    }






                }else if(req.body.vOperation == 'delete'){
                    queries.deleteUserById({'id':req.body.id},function(error,rows){
                        if(error) throw error;
                        res.json({
                            'status':200,
                            'message':'User deleted successfully.'
                        });
                    });
                }else if(req.body.vOperation == 'status'){
                    if(!validator.isEmpty(req.body.eStatus+'')){
                        queries.changeUserStatusById({'id':req.body.id,'eStatus':req.body.eStatus},function(error,rows){
                            if(error) throw error;
                            res.json({
                                'status':200,
                                'message':'User status changed successfully.'
                            });
                        });
                    }else{
                        res.json({
                            "status":404,
                            "message":"Please fill all required value."
                        })
                    }
                } else{
                    res.json({
                        "status":404,
                        "message":"Please fill all required value"
                    })
                }
            }else{
                res.json({
                    "status":404,
                    "message":"Something webnt wrong"
                })
            }

        }else{

            res.json({
                "status":404,
                "message":"Please fill all required value"
            })

        }

    });

    // User Module End
    //Question Module Start
    /**
     * Getting List of Questions
     */
    app.post('/question',passport.authenticate('jwt',{session:false}),function(req,res){
        cli.blue("Its Work users");
        if(req.user.length > 0){
            queries.listQuestion(req,function(error,rows){
                res.json({
                    'status':200,
                    'message':'Success',
                    'result':rows
                })
            });
        }else{
            res.json({
                "status":404,
                "message":"Something went wrong"
            })
        }
    });

    app.post('/list_q',function (req,res) {
        cli.blue("List for search section");
        cli.red(JSON.stringify(req.body.CustomSearch.vsq));


        var eType = [];
        var eTypeQuestion = [];
        req.body.CustomSearch.mcq == "true" ? eType.push('MCQ') : '';
        req.body.CustomSearch.vsq == "true" ? eType.push('VSQ') : '';
        req.body.CustomSearch.panethesis == "true" ? eTypeQuestion.push('Parenthesis') : '';
        req.body.CustomSearch.exponent == "true" ? eTypeQuestion.push('Exponent') : '';
        req.body.CustomSearch.mutiplication == "true" ? eTypeQuestion.push('Multiplication') : '';
        req.body.CustomSearch.division == "true" ? eTypeQuestion.push('Division') : '';
        req.body.CustomSearch.addition == "true" ? eTypeQuestion.push('Addition') : '';
        req.body.CustomSearch.subtraction == "true" ? eTypeQuestion.push('Subtraction') : '';

        var obj = {
            'vModeName':'',
            'eTypeQuestion':eTypeQuestion,
            'eType':eType
        };

        cli.yellow(JSON.stringify(obj));
        queries.ls_question_count(obj,function(err,record){
            if(err) throw err;
            var iTotalRecords = parseInt(record[0].iTotalRecords);
            var iDisplayLength = parseInt(req.body.length);
            iDisplayLength = iDisplayLength < 0 ? iTotalRecords : iDisplayLength;
            var iDisplayStart = parseInt(req.body.start);
            var end = iDisplayStart + iDisplayLength;
            end = end > iTotalRecords ? iTotalRecords : end;
            var obj = {
                'limit': end,
                'offset': iDisplayStart,
                'vModeName':'',
                'eTypeQuestion':eTypeQuestion,
                'eType':eType,
                'sort':req.body.draw == 1 ? "iQuestionId DESC" : getSorting(req.body)
            }
            queries.ls_question_select(obj,function(err,question){
                if(err) throw err;
                var i = 0;
                var records = {};
                records['draw'] = req.body.draw;
                records['recordsTotal'] = iTotalRecords;
                records['recordsFiltered'] = iTotalRecords;
                records['data'] = [];
                for(i=0;i<question.length;i++){
                    var operation = '<button style="color: #ffffff; margin-right: 10px;" ng-click="qOperation('+question[i].iQuestionId+',&quot;view&quot;)" title="View"  class="btn btn-raised btn-xs bg-light-blue waves-effect">View</button>';
                    operation+= '<button style="color: #ffffff; margin-right: 10px;" ng-click="qOperation('+question[i].iQuestionId+',&quot;edit&quot;)" title="Edit"  class="btn btn-raised btn-xs bg-orange waves-effect">Edit</button>';
                    operation+= '<button style="color: #ffffff; margin-right: 10px;" ng-click="qOperation('+question[i].iQuestionId+',&quot;delete&quot;)" title="Delete"  class="btn btn-raised btn-xs bg-red waves-effect">Delete</button>';
                    records['data'][i] = {"iQuestionId":question[i].iQuestionId,
                        "vModeName":question[i].vModeName,
                        "eType":question[i].eType,
                        "vQuestion":question[i].vQuestion,
                        "vAnswer":question[i].vAnswer,
                        "eStatus":question[i].eStatus,
                        "eTypeQuestion":question[i].eTypeQuestion,
                        "operation":operation
                    };
                }
                res.json(records);
            })
        });
    });

    /**
     *  Question Operation View,Status,Delete
     */
    app.post('/questionoperation',passport.authenticate('jwt',{session:false}),function(req,res){
        cli.blue("Its Work users");
        if(req.user.length > 0){
            if(!validator.isEmpty(req.body.vOperation) && !validator.isEmpty(req.body.iQuestionId)){
                if(req.body.vOperation == 'status'){
                    queries.statusQuestion({"iQuestionId":req.body.iQuestionId,"eStatus":req.body.eStatus},function(err,rows){
                        if(err) throw err;
                        if(rows.affectedRows > 0){
                            res.json({
                                'status':200,
                                'message':'Question status changed successfully.'
                            });
                        }else{
                            res.json({
                                "status":404,
                                "message":"Something went wrong"
                            })
                        }
                    });
                }else if(req.body.vOperation == 'view'){
                    queries.viewQuestion({"iQuestionId":req.body.iQuestionId},function(err,rows){
                        if(err) throw  err;
                        if(rows.length > 0){
                            res.json({
                                'status':200,
                                'message':'success',
                                'result':rows
                            })
                        }else{
                            res.json({
                                "status":404,
                                "message":"Something went wrong"
                            });
                        }
                    });
                }else if(req.body.vOperation == 'delete'){
                    queries.deleteQuestion({"iQuestionId":req.body.iQuestionId},function(err,rows){
                        if(err) throw err;
                        if(rows.affectedRows > 0){
                            res.json({
                                'status':200,
                                'message':'Question deleted successfully.'
                            });
                        }else{
                            res.json({
                                "status":404,
                                "message":"Something went wrong"
                            });
                        }
                    });
                }else{
                    res.json({
                        "status":404,
                        "message":"Please fill all required value"
                    });
                }

            }else{
                res.json({
                    "status":404,
                    "message":"Please fill all required value"
                })
            }
        }else{
            res.json({
                "status":404,
                "message":"Something went wrong"
            })
        }
    });
    /**
     *  Question Operation View,Status,Delete Emd
     */

    /**
     * BEGIN Question Edit Operation
     */

    app.post('/questionedit',passport.authenticate('jwt',{session:false}),function(req,res){
        if(req.user.length > 0){
            if(!validator.isEmpty(req.body.question.eType)){
                if(req.body.question.eType == "MCQ"){
                    if(!validator.isEmpty(req.body.question.iAnswerId+"") &&
                        !validator.isEmpty(req.body.question.vModeName) &&
                        !validator.isEmpty(req.body.question.eTypeQuestion) &&
                        !validator.isEmpty(req.body.question.iQuestionId) &&
                        !validator.isEmpty(req.body.question.vQuestion) &&
                        req.body.options.length == 4 &&
                        !validator.isEmpty(req.body.options[0].iAnswerId+"") &&
                        !validator.isEmpty(req.body.options[0].vAnswer) &&
                        !validator.isEmpty(req.body.options[1].iAnswerId+"") &&
                        !validator.isEmpty(req.body.options[1].vAnswer) &&
                        !validator.isEmpty(req.body.options[2].iAnswerId+"") &&
                        !validator.isEmpty(req.body.options[2].vAnswer) &&
                        !validator.isEmpty(req.body.options[3].iAnswerId+"") &&
                        !validator.isEmpty(req.body.options[3].vAnswer)){

                        queries.updateQuestion({
                            "iAnswerId":req.body.question.iAnswerId,
                            "vModeName":req.body.question.vModeName,
                            "iQuestionId":req.body.question.iQuestionId,
                            "vQuestion":req.body.question.vQuestion,
                            "eTypeQuestion":req.body.question.eTypeQuestion,
                            "eType":"MCQ"
                        },function (err,rows) {
                            if(err) throw err;
                            if(rows.affectedRows > 0){

                                for(i =0;i<req.body.options.length;i++){
                                    queries.updateAnswer({
                                        "iAnswerId":req.body.options[i].iAnswerId,
                                        "vAnswer":req.body.options[i].vAnswer
                                    },function (error, row) {
                                        if(error) throw error;
                                    })
                                }
                                res.json({
                                    "status":200,
                                    "message":"Question updated Successfully."
                                })
                            }else{
                                res.json({
                                    "status": 404,
                                    "message": "Something went wrong"
                                });
                            }
                        });

                    }else{
                        res.json({
                            "status": 404,
                            "message": "Please fill all required value"
                        });
                    }
                }else{
                    cli.blue("VSQ call");
                    if(!validator.isEmpty(req.body.question.iAnswerId+"") &&
                        !validator.isEmpty(req.body.question.vModeName) &&
                        !validator.isEmpty(req.body.question.eTypeQuestion) &&
                        !validator.isEmpty(req.body.question.iQuestionId) &&
                        !validator.isEmpty(req.body.question.vQuestion) &&
                        req.body.options.length == 1 &&
                        !validator.isEmpty(req.body.options[0].iAnswerId+"") &&
                        !validator.isEmpty(req.body.options[0].vAnswer)){
                        cli.blue("VSQ Done");

                        queries.updateQuestion({
                            "iAnswerId":req.body.question.iAnswerId,
                            "vModeName":req.body.question.vModeName,
                            "iQuestionId":req.body.question.iQuestionId,
                            "vQuestion":req.body.question.vQuestion,
                            "eTypeQuestion":req.body.question.eTypeQuestion,
                            "eType":"VSQ"
                        },function(err,row){
                            if(err) throw err;
                            cli.blue("update question");
                            if(row.affectedRows > 0){
                                queries.updateAnswer({
                                    "iAnswerId":req.body.options[0].iAnswerId,
                                    "vAnswer":req.body.options[0].vAnswer
                                },function (error, row) {
                                    if(error) throw error;
                                    cli.blue("update answer");
                                    if(row.affectedRows > 0){
                                        res.json({
                                            "status":200,
                                            "message":"Question updated Successfully."
                                        })
                                    }else{
                                        res.json({
                                            "status": 404,
                                            "message": "Something went wrong"
                                        });
                                    }
                                })
                            }else{
                                res.json({
                                    "status": 404,
                                    "message": "Something went wrong"
                                });
                            }

                        });

                    }else{
                        cli.blue("VSQ required");
                        res.json({
                            "status": 404,
                            "message": "Please fill all required value"
                        });
                    }
                }
            }else{
                res.json({
                    "status":404,
                    "message":"Please fill all required value"
                });
            }
        }else{
            res.json({
                "status":404,
                "message":"User not exsits"
            })
        }
    });

    /**
     * END Question Edit Operation
     */


    /**
     * BEGIN Question Add Operataion
     */
    app.post('/questionadd',passport.authenticate('jwt',{session:false}),function(req,res){
        if(req.user.length > 0){
            if(!validator.isEmpty(req.body.question.eType)){
                if(req.body.question.eType == "MCQ"){
                    if(
                        !validator.isEmpty(req.body.question.vModeName) &&
                        !validator.isEmpty(req.body.question.vQuestion) &&
                        !validator.isEmpty(req.body.question.eTypeQuestion) &&
                        req.body.options.length == 4 &&
                        !validator.isEmpty(req.body.options[0].vAnswer) &&
                        !validator.isEmpty(req.body.options[0].isAnswer.toString()) &&
                        !validator.isEmpty(req.body.options[1].vAnswer) &&
                        !validator.isEmpty(req.body.options[1].isAnswer.toString()) &&
                        !validator.isEmpty(req.body.options[2].vAnswer) &&
                        !validator.isEmpty(req.body.options[2].isAnswer.toString()) &&
                        !validator.isEmpty(req.body.options[3].vAnswer) &&
                        !validator.isEmpty(req.body.options[3].isAnswer.toString())){
                        var tempiQuestionId = "";
                        queries.insertQuestion({
                            "vModeName":req.body.question.vModeName,
                            "vQuestion":req.body.question.vQuestion,
                            "eType":req.body.question.eType,
                            "eTypeQuestion":req.body.question.eTypeQuestion,
                        },function(err,row){
                            if(err) throw err;
                            if(row.insertId > 0){
                                tempiQuestionId = row.insertId;
                                for(var i = 0;i<req.body.options.length;i++){
                                    if(req.body.options[i].isAnswer == true){
                                        queries.insertAnswer({
                                            "iQuestionId":row.insertId,
                                            "vAnswer":req.body.options[i].vAnswer
                                        },function(err,info){
                                            if(err) throw err;
                                            if(info.insertId > 0){
                                                queries.updateAfterInsertQuestion({
                                                    "iAnswerId":info.insertId,
                                                    "iQuestionId":tempiQuestionId
                                                },function (errors,details) {
                                                    if(errors) throw errors;
                                                });
                                            }else{
                                                res.json({
                                                    "status": 404,
                                                    "message": "Something went wrong"
                                                });
                                            }
                                        });
                                    }else{
                                        queries.insertAnswer({
                                            "iQuestionId":row.insertId,
                                            "vAnswer":req.body.options[i].vAnswer
                                        },function(err,info){
                                            if(err) throw err;
                                        });
                                    }
                                }
                                res.json({
                                    "status":200,
                                    "message":"Question inserted successfully."
                                });
                            }else{
                                res.json({
                                    "status": 404,
                                    "message": "Something went wrong"
                                });
                            }
                        })
                    }else{
                        res.json({
                            "status": 404,
                            "message": "Please fill all required value"
                        });
                    }
                }else{
                    cli.blue("VSQ call");
                    if(!validator.isEmpty(req.body.question.vModeName) &&
                        !validator.isEmpty(req.body.question.eTypeQuestion) &&
                        !validator.isEmpty(req.body.question.vQuestion) &&
                        req.body.options.length == 1 &&
                        !validator.isEmpty(req.body.options[0].vAnswer)){
                        var tempiQuestionId = "";
                        queries.insertQuestion({
                            "vModeName":req.body.question.vModeName,
                            "vQuestion":req.body.question.vQuestion,
                            "eType":req.body.question.eType,
                            "eTypeQuestion":req.body.question.eTypeQuestion
                        },function(err,row){
                            if(err) throw err;
                            if(row.insertId > 0){
                                tempiQuestionId = row.insertId;

                                queries.insertAnswer({
                                    "iQuestionId":row.insertId,
                                    "vAnswer":req.body.options[0].vAnswer
                                },function(err,info){
                                    if(err) throw err;
                                    if(info.insertId > 0){
                                        queries.updateAfterInsertQuestion({
                                            "iAnswerId":info.insertId,
                                            "iQuestionId":tempiQuestionId
                                        },function (errors,details) {
                                            if(errors) throw errors;
                                            if(details.affectedRows > 0){
                                                res.json({
                                                    "status":200,
                                                    "message":"Question inserted successfully."
                                                });
                                            }else{
                                                res.json({
                                                    "status": 404,
                                                    "message": "Something went wrong"
                                                });
                                            }
                                        });
                                    }else{
                                        res.json({
                                            "status": 404,
                                            "message": "Something went wrong"
                                        });
                                    }
                                });

                            }else{
                                res.json({
                                    "status": 404,
                                    "message": "Something went wrong"
                                });
                            }
                        })

                    }else{
                        res.json({
                            "status": 404,
                            "message": "Please fill all required value"
                        });
                    }
                }
            }else{
                res.json({
                    "status":404,
                    "message":"Please fill all required value"
                });
            }
        }else{
            res.json({
                "status":404,
                "message":"User not exsits"
            })
        }
    });

    /**
     * END Question Add Operataion
     */

    /**
     * BEGIN List Mcq question
     */

    app.post('/list_mcq',function (req,res) {

        var eTypeQuestion = [];
        req.body.CustomSearch.panethesis == "true" ? eTypeQuestion.push('Parenthesis') : '';
        req.body.CustomSearch.exponent == "true" ? eTypeQuestion.push('Exponent') : '';
        req.body.CustomSearch.mutiplication == "true" ? eTypeQuestion.push('Multiplication') : '';
        req.body.CustomSearch.division == "true" ? eTypeQuestion.push('Division') : '';
        req.body.CustomSearch.addition == "true" ? eTypeQuestion.push('Addition') : '';
        req.body.CustomSearch.subtraction == "true" ? eTypeQuestion.push('Subtraction') : '';

        var obj = {
            'eExamType':req.body.search.eExamType,
            'eExamSubType':req.body.search.eExamSubType,
            'eTypeQuestion':eTypeQuestion
        };

        queries.ls_mcq_count(obj,function(err,record){
            if(err) throw err;
            var iTotalRecords = parseInt(record[0].iTotalRecords);
            var iDisplayLength = parseInt(req.body.length);
            iDisplayLength = iDisplayLength < 0 ? iTotalRecords : iDisplayLength;
            var iDisplayStart = parseInt(req.body.start);
            var end = iDisplayStart + iDisplayLength;
            end = end > iTotalRecords ? iTotalRecords : end;
            var obj = {
                'limit': end,
                'offset': iDisplayStart,
                'vModeName':req.body.search.value,
                'eType':req.body.search.value,
                'sort':getSorting(req.body),
                'eTypeQuestion':eTypeQuestion
            }
            queries.ls_mcq_select(obj,function(err,question){
                if(err) throw err;
                var i = 0;
                var records = {};
                records['draw'] = req.body.draw;
                records['recordsTotal'] = iTotalRecords;
                records['recordsFiltered'] = iTotalRecords;
                records['data'] = [];
                for(i=0;i<question.length;i++){
                    var operation = '<button ng-click="qOperation('+question[i].iQuestionId+',&quot;view&quot;)" title="View"  class="btn btn-success btn-xs">View</button>';
                    operation+= '<button ng-click="qOperation('+question[i].iQuestionId+',&quot;edit&quot;)" title="Edit"  class="btn btn-warning  btn-xs">Edit</button>';
                    operation+= '<button ng-click="qOperation('+question[i].iQuestionId+',&quot;delete&quot;)" title="Delete"  class="btn btn-danger  btn-xs">Delete</button>';
                    records['data'][i] = {"iQuestionId":question[i].iQuestionId,
                        "vModeName":question[i].vModeName,
                        "eTypeQuestion":question[i].eTypeQuestion,
                        "eType":question[i].eType,
                        "vQuestion":question[i].vQuestion,
                        "vAnswer":question[i].vAnswer,
                        "eStatus":question[i].eStatus,
                        "operation":operation
                    };
                }
                res.json(records);
            })
        });
    });

    /**
     * END List Mcq question
     */

    /**
     * BEGIN List Vsq question
     */


    app.post('/list_vsq',function (req,res) {

        var eTypeQuestion = [];
        req.body.CustomSearch.panethesis == "true" ? eTypeQuestion.push('Parenthesis') : '';
        req.body.CustomSearch.exponent == "true" ? eTypeQuestion.push('Exponent') : '';
        req.body.CustomSearch.mutiplication == "true" ? eTypeQuestion.push('Multiplication') : '';
        req.body.CustomSearch.division == "true" ? eTypeQuestion.push('Division') : '';
        req.body.CustomSearch.addition == "true" ? eTypeQuestion.push('Addition') : '';
        req.body.CustomSearch.subtraction == "true" ? eTypeQuestion.push('Subtraction') : '';

        var obj = {
            'vModeName':req.body.search.value,
            'eType':req.body.search.value,
            'eTypeQuestion':eTypeQuestion
        };
        queries.ls_vsq_count(obj,function(err,record){
            if(err) throw err;
            var iTotalRecords = parseInt(record[0].iTotalRecords);
            var iDisplayLength = parseInt(req.body.length);
            iDisplayLength = iDisplayLength < 0 ? iTotalRecords : iDisplayLength;
            var iDisplayStart = parseInt(req.body.start);
            var end = iDisplayStart + iDisplayLength;
            end = end > iTotalRecords ? iTotalRecords : end;
            var obj = {
                'limit': end,
                'offset': iDisplayStart,
                'vModeName':req.body.search.value,
                'eType':req.body.search.value,
                'sort':getSorting(req.body),
                'eTypeQuestion':eTypeQuestion
            }
            queries.ls_vsq_select(obj,function(err,question){
                if(err) throw err;
                var i = 0;
                var records = {};
                records['draw'] = req.body.draw;
                records['recordsTotal'] = iTotalRecords;
                records['recordsFiltered'] = iTotalRecords;
                records['data'] = [];
                for(i=0;i<question.length;i++){
                    var operation = '<button ng-click="qOperation('+question[i].iQuestionId+',&quot;view&quot;)" title="View"  class="btn btn-success btn-xs">View</button>';
                    operation+= '<button ng-click="qOperation('+question[i].iQuestionId+',&quot;edit&quot;)" title="Edit"  class="btn btn-warning  btn-xs">Edit</button>';
                    operation+= '<button ng-click="qOperation('+question[i].iQuestionId+',&quot;delete&quot;)" title="Delete"  class="btn btn-danger  btn-xs">Delete</button>';
                    records['data'][i] = {"iQuestionId":question[i].iQuestionId,
                        "vModeName":question[i].vModeName,
                        "eTypeQuestion":question[i].eTypeQuestion,
                        "eType":question[i].eType,
                        "vQuestion":question[i].vQuestion,
                        "vAnswer":question[i].vAnswer,
                        "eStatus":question[i].eStatus,
                        "operation":operation
                    };
                }
                res.json(records);
            })
        });
    });

    /**
     * END List Vcq question
     */

    /**
     * Generate Exam Start
     */

    app.post('/generate_exam',passport.authenticate('jwt',{session:false}),function(req,res){
        /***
         * vTitle,vDescription
         */
        console.log(req.body.vTitle);
        req.checkBody("vTitle","Ttile must be required").notEmpty();
        req.checkBody("vDescription","Description must be required").notEmpty();
        req.checkBody("iUserId","PArent or Teacher must be required").notEmpty();
        var validatorError = req.validationErrors();
        req.getValidationResult().then(function(result) {
            if (!result.isEmpty()) {
                res.json({
                    "status": 404,
                    "message": "Please fill all required value",
                    "Data":result.mapped()
                });
            }else{
                queries.insert_exam({vTitle:req.body.vTitle,vDescription:req.body.vDescription,iParentId:0,iUserId:req.body.iUserId},function(errOne,rowsOne){
                    var iRoundOneExamId  = rowsOne.insertId;
                    queries.insert_exam({vTitle:req.body.vTitle,vDescription:req.body.vDescription,iParentId:iRoundOneExamId,iUserId:req.body.iUserId},function(errTwo,rowsTwo){
                        var iRoundTwoExamId  = rowsTwo.insertId;
                        queries.insert_exam_schedule({"iExamId":iRoundOneExamId},function(err,resultOne){
                            var iRoundOneScheduleId = resultOne.insertId;
                            queries.insert_exam_schedule({"iExamId":iRoundTwoExamId},function(err,resultTwo){


                                var iRoundTwoScheduleId = resultTwo.insertId;
                                cli.yellow("response")
                                res.json({
                                    'status':200,
                                    'message':'Success',
                                    'data':{
                                        "RoundOne":{
                                            "iExamId":iRoundOneExamId,
                                            "iScheduleId":iRoundOneScheduleId
                                        },
                                        "RoundTwo":{
                                            "iExamId":iRoundTwoExamId,
                                            "iScheduleId":iRoundTwoScheduleId
                                        }
                                    }
                                })



                            });
                        });
                    });
                });
            }
        });

    });

    /**
     * Generate Exam Close
     */

    /**
     *  Data Table With Server Side Rendering Start
     *  For New Module
     */
    app.post('/list_exam',passport.authenticate('jwt',{session:false}),function(req,res){
        cli.blue(JSON.stringify(req.user));
        var obj = {
            'vTitle': req.body.search.value, //Search Apply for default search text box
            'iUserId':req.user[0].iUserId
        };



        queries.ls_exam_count(obj, function(err, record) {
            var iTotalRecords = parseInt(record[0].iTotalRecords);
            var iDisplayLength = parseInt(req.body.length);
            iDisplayLength = iDisplayLength < 0 ? iTotalRecords : iDisplayLength;
            var iDisplayStart = parseInt(req.body.start);
            var end = iDisplayStart + iDisplayLength;
            end = end > iTotalRecords ? iTotalRecords : end;
            var obj = {
                'limit': end,
                'offset': iDisplayStart,
                'vTitle': req.body.search.value,
                'sort':getSorting(req.body),
                'iUserId':req.user[0].iUserId
            };
            queries.ls_exam_select(obj, function(err, exams) {
                if (err) return err;
                var i = 0;
                var records = {};
                records['draw'] = req.body.draw;
                records['recordsTotal'] = iTotalRecords;
                records['recordsFiltered'] = iTotalRecords;
                records['data'] = [];
                for (var key in exams) {
                    // var status = '<input bs-switch ng-model="'+users[i].eStatus+'" value="'+users[i].eStatus+'" class="switch-small" type="checkbox" ng-true-value="&apos;y&apos;" ng-false-value="&apos;n&apos;" ng-change="onUserStatusChange(&apos;'+users[i].eStatus+'&apos;,'+users[i].iUserId+')">';
                    var operation = '<button style="color: #ffffff; margin-right: 10px;" ng-click="examOperation('+exams[i].iExamId+',&quot;view&quot;)" title="View"  class="btn btn-raised btn-xs bg-light-blue waves-effect">View</button>';
                    operation+= '<button style="color: #ffffff; margin-right: 10px;" ng-click="examOperation('+exams[i].iExamId+',&quot;edit&quot;)" title="Edit"  class="btn btn-raised btn-xs bg-orange waves-effect">Edit</button>';
                    operation+= '<button style="color: #ffffff; margin-right: 10px;" ng-click="examOperation('+exams[i].iExamId+',&quot;delete&quot;)" title="Delete"  class="btn btn-raised btn-xs bg-red waves-effect">Delete</button>';
                    // var operation = '<button ng-click="viewOperation('+exams[i].iExamId+',&quot;view&quot;)" title="View"  class="btn btn-success btn-xs"> <i class="fa fa-eye" aria-hidden="true"></i> View</button>';
                    records['data'][i] = {"iExamId":exams[i].iExamId,"vTitle":exams[i].vTitle,'vDescription':exams[i].vDescription,"eStatus":exams[i].eStatus,"vOperation":operation};
                    i++;
                }
                res.json(records);
            });
        });


    });

    /**
     * Exam result
     */

    app.post('/exam_result',passport.authenticate('jwt',{session:false}),function(req,res){
        req.checkBody("iExamId","ExamId must be required").notEmpty();
        req.getValidationResult().then(function(result) {
            if (!result.isEmpty()) {
                res.json({
                    "status": 404,
                    "message": "Please fill all required value",
                    "Data":result.mapped()
                });
            }else{

                queries.get_exam_details({'iExamId':req.body.iExamId},function(err,exams){
                    if(err) throw err;
                    queries.get_round_details({'iExamId':exams[0].iRoundOneId},function(errs,roundOne){
                        if(errs) throw errs;
                        queries.get_round_details({'iExamId':exams[0].iRoundTwoId},function(error,roundTwo){
                            if(error) throw error;
                            console.log("Exam Details");
                            cli.yellow(JSON.stringify(exams));
                            console.log("Round One");
                            cli.yellow(JSON.stringify(roundOne));
                            console.log("Round Two");
                            cli.yellow(JSON.stringify(roundTwo));

                            var RoundOneGraph = {
                                "Right":[],
                                "Wrong":[],
                                "Users":[]
                            };

                            for(var i = 0; i < roundOne.length; i++){
                                RoundOneGraph.Right.push(roundOne[i].iRightAnswers);
                                RoundOneGraph.Wrong.push(roundOne[i].iWrongAnswers);
                                RoundOneGraph.Users.push(roundOne[i].vFullName);
                            }

                            var RoundTwoGraph = {
                                    "Right":[],
                                    "Wrong":[],
                                    "Users":[]
                                }

                                ;
                            for(var i = 0; i < roundTwo.length; i++){
                                RoundTwoGraph.Right.push(roundTwo[i].iRightAnswers);
                                RoundTwoGraph.Wrong.push(roundTwo[i].iWrongAnswers);
                                RoundTwoGraph.Users.push(roundTwo[i].vFullName);
                            }


                            res.json({
                                'status':200,
                                'message':'Success',
                                'data':{
                                    "ExamDetails":exams[0],
                                    "RoundOne":roundOne,
                                    "Roundtwo":roundTwo,
                                    "RoundOneGraph":RoundOneGraph,
                                    "RoundTwoGraph":RoundTwoGraph
                                }
                            });

                        });
                    });
                });

            }
        });
    });


    app.post('/exam_question',passport.authenticate('jwt',{session:false}),function(req,res){

        req.checkBody("iUserId","UserId must be required").notEmpty();
        req.checkBody("iParticipentId","iParticipentId must be required").notEmpty();
        req.getValidationResult().then(function(result) {
            if (!result.isEmpty()) {
                res.json({
                    "status": 404,
                    "message": "Please fill all required value",
                    "Data":result.mapped()
                });
            }else{
                console.log(req.body);
                queries.get_roundOne_question({"iParticipentId":req.body.iParticipentId},function(err,RoundOne){
                    if(err) throw err;
                    console.log("Get Round One Question");
                    cli.yellow(JSON.stringify(RoundOne[0]));
                    async.forEachOf(RoundOne,function(value,key,cb){


                        queries.get_ans_by_Id({"iAnswerId":value.AnsGiven},function(errs,resultOne){
                            if(errs) throw errs;
                            queries.get_ans_by_Id({"iAnswerId":value.RightAns},function(errs,resultTwo){
                                if(errs)
                                    RoundOne[key].AnsGiven = resultOne[0].vAnswer;
                                RoundOne[key].RightAns = resultTwo[0].vAnswer;
                            });
                        });
                        cb();
                    },function(err){
                        console.log("Call back call");
                        console.log("Get Round One Question");
                        cli.yellow(JSON.stringify(RoundOne[0]));


                    });
                });
            }
        });
    });

    //Client Module

    app.post('/list_client',function(req,res){
        cli.blue(JSON.stringify(req.body));
        var obj = {
            'vUserName': req.body.search.value, //Search Apply for default search text box
            'vEmail': req.body.search.value //Search Apply for default search text box
        };
        queries.ls_client_count(obj, function(err, record) {
            var iTotalRecords = parseInt(record[0].iTotalRecords);
            var iDisplayLength = parseInt(req.body.length);
            iDisplayLength = iDisplayLength < 0 ? iTotalRecords : iDisplayLength;
            var iDisplayStart = parseInt(req.body.start);
            var end = iDisplayStart + iDisplayLength;
            end = end > iTotalRecords ? iTotalRecords : end;
            var obj = {
                'limit': end,
                'offset': iDisplayStart,
                'vFullName': req.body.search.value,
                'vEmail': req.body.search.value,
                'sort':getSorting(req.body)
            };
            queries.ls_client_select(obj, function(err, users) {
                if (err) return err;
                var i = 0;
                var records = {};
                records['draw'] = req.body.draw;
                records['recordsTotal'] = iTotalRecords;
                records['recordsFiltered'] = iTotalRecords;
                records['data'] = [];
                for (var key in users) {
                    // var status = '<input bs-switch ng-model="'+users[i].eStatus+'" value="'+users[i].eStatus+'" class="switch-small" type="checkbox" ng-true-value="&apos;y&apos;" ng-false-value="&apos;n&apos;" ng-change="onUserStatusChange(&apos;'+users[i].eStatus+'&apos;,'+users[i].iUserId+')">';
                    var operation = '<button style="color: #ffffff; margin-right: 10px;" ng-click="userOperation('+users[i].iUserId+',&quot;view&quot;)" title="View"  class="btn btn-raised btn-xs bg-light-blue waves-effect">View</button>';
                    operation+= '<button style="color: #ffffff; margin-right: 10px;" ng-click="userOperation('+users[i].iUserId+',&quot;edit&quot;)" title="Edit"  class="btn btn-raised btn-xs bg-orange waves-effect">Edit</button>';
                    operation+= '<button style="color: #ffffff; margin-right: 10px;" ng-click="userOperation('+users[i].iUserId+',&quot;delete&quot;)" title="Delete"  class="btn btn-raised btn-xs bg-red waves-effect">Delete</button>';
                    records['data'][i] = {"iUserId":users[i].iUserId,"vFullName":users[i].vFullName,"vEmail":users[i].vEmail,"eStatus":users[i].eStatus,"vOperation":operation,"vUserType":users[i].vUserType};
                    i++;
                }
                res.json(records);
            });
        });
    });

    app.post('/clientadd',passport.authenticate('jwt',{session:false}),function (req,res) {
        if(req.user.length > 0){
            cli.blue("Check Email");cli.blue(JSON.stringify(req.body));
            cli.blue(!validator.isEmpty(req.body.vParentType));
            if(!validator.isEmpty(req.body.vFullName) && validator.isEmail(req.body.vEmail) && !validator.isEmpty(req.body.vParentType)){
                checkUser(req.body.vEmail,function(error,isActive){
                    if(error) throw error;
                    if(isActive.length > 0){
                        res.json({
                            "status":404,
                            "message":"User already available"
                        });
                    }else{

                        var vPassword = randomstring.generate(6);
                        queries.addUser({"vUserType":"client","vFullName":req.body.vFullName,"vUserName":req.body.vEmail,"vEmail":req.body.vEmail,"vPassword":vPassword},function(err,rows){
                            if(err) throw err;
                            if(rows.affectedRows > 0){
                                queries.addParent({"iUserId":rows.insertId,"vParentType":req.body.vParentType},function(errors,row){
                                    if(row.affectedRows > 0){

                                        //Send Mail
                                        var mailOptions = {
                                            from: '"SYSTEMIC21" <info@systeemic21.com>', // sender address
                                            to: req.body.vEmail, // list of receivers
                                            subject: 'Hello '+ req.body.vFullName, // Subject line
                                            text: 'One time password  : ' + vPassword // plaintext body
                                        };
                                        mail.sendMail(mailOptions,function(err,info){
                                            if(err){
                                                cli.red("Mail not send");
                                                console.log(err);
                                            }else{
                                                cli.yellow("Mail send");
                                            }
                                        });
                                        //Send mail end


                                        res.json({
                                            "status":200,
                                            "message":"User Insert Successfully."
                                        });

                                    }
                                    else{
                                        res.json({
                                            "status":400,
                                            "message":"Something went wrong"
                                        });
                                    }

                                });
                            }else{
                                res.json({
                                    "status":400,
                                    "message":"Something went wrong"
                                });
                            }
                        });

                    }
                });
            }else{
                res.json({
                    "status":404,
                    "message":"Please fill all required value"
                });
            }
        }else{
            res.json({
                "status":404,
                "message":'User not active'
            })
        }

    });

    app.post('/clientoperation',passport.authenticate('jwt',{session:false}),function(req,res){
        if(!validator.isEmpty(req.body.id) && !validator.isEmpty(req.body.vOperation)){
            cli.blue("inside");
            console.log("Inside");
            if(req.user.length > 0 ){

                if(req.body.vOperation == 'view'){
                    cli.blue("view call");
                    queries.getUserFroById({'id':req.body.id},function(e,users){
                        if(users.length > 0){
                            var temp = {};
                            var child = [];
                            temp.ParentName = users[0].vFullName;
                            temp.ParentEmail = users[0].vEmail;
                            temp.ParentUserName = users[0].vUserName;
                            temp.ParentType = users[0].vParentType;
                            queries.get_child_by_client_id({'id':req.body.id},function(error,rows){
                                if(rows.length > 0 ){

                                    for(var i=0; i< rows.length; i++){
                                        child.push({
                                            "ChildName":rows[i].ChildName,
                                            "ChildEmail":rows[i].ChildEmail,
                                            "ChildUserName":rows[i].ChildUserName,
                                            "ChildId":rows[i].ChildUserId
                                        });
                                    }

                                }
                                temp.child = child;
                                res.json({
                                    'status':200,
                                    'message':'success',
                                    'result':temp
                                });
                            });
                        }else{
                            res.json({
                                'status':404,
                                'message':'User Not Found',
                            })
                        }
                    });




                }else if(req.body.vOperation == 'edit'){
                    if(!validator.isEmpty(req.body.vFullName)){
                        cli.green("Edit call");
                        cli.red(req.body.id);
                        queries.updateUserById({'id':req.body.id,'vFullName':req.body.vFullName},function(err,rows){
                            if(err) throw err;
                            res.status(200).json({
                                'message':'User updated successfully'
                            });
                        });
                    }else{
                        res.json({
                            "status":404,
                            "message":"Please fill all required value"
                        });
                    }
                }else if(req.body.vOperation == 'delete'){
                    queries.deleteUserById({'id':req.body.id},function(error,rows){
                        if(error) throw error;
                        res.json({
                            'status':200,
                            'message':'User deleted successfully.'
                        });
                    });
                }else if(req.body.vOperation == 'status'){
                    if(!validator.isEmpty(req.body.eStatus+'')){
                        queries.changeUserStatusById({'id':req.body.id,'eStatus':req.body.eStatus},function(error,rows){
                            if(error) throw error;
                            res.json({
                                'status':200,
                                'message':'User status changed successfully.'
                            });
                        });
                    }else{
                        res.json({
                            "status":404,
                            "message":"Please fill all required value"
                        })
                    }
                } else{
                    res.json({
                        "status":404,
                        "message":"Please fill all required value"
                    })
                }
            }else{
                res.json({
                    "status":404,
                    "message":"Something webnt wrong"
                })
            }

        }else{

            res.json({
                "status":404,
                "message":"Please fill all required value"
            })

        }

    });

    // End Client Module

    /**
     * Back Up For Before Selecting Users
     */
    app.post('/exam_generates',passport.authenticate('jwt',{session:false}),function(req,res){
        cli.blue(req.user);
        if(req.user.length > 0){

            req.checkBody("iRoundOneQuestion","Question must be required").notEmpty();
            req.checkBody("iRoundTwoQuestion","Question must be required").notEmpty();
            req.checkBody("vTitle","Title must be required").notEmpty();
            req.checkBody("vDescription","Description must be required").notEmpty();
            var validatorError = req.validationErrors();
            req.getValidationResult().then(function(result) {
                if (!result.isEmpty()) {
                    res.json({
                        "status": 404,
                        "message": "Please fill all required value",
                        "Data":result.mapped()
                    });
                }else{
                    queries.insert_exam({vTitle:req.body.vTitle,vDescription:req.body.vDescription,iParentId:0,iUserId:req.user[0].iUserId},function(errOne,rowsOne){
                        var iRoundOneExamId  = rowsOne.insertId;
                        queries.insert_exam({vTitle:req.body.vTitle,vDescription:req.body.vDescription,iParentId:iRoundOneExamId,iUserId:req.user[0].iUserId},function(errTwo,rowsTwo){
                            var iRoundTwoExamId  = rowsTwo.insertId;
                            queries.insert_exam_schedule({"iExamId":iRoundOneExamId},function(err,resultOne){
                                var iRoundOneScheduleId = resultOne.insertId;
                                queries.insert_exam_schedule({"iExamId":iRoundTwoExamId},function(err,resultTwo){
                                    var iRoundTwoScheduleId = resultTwo.insertId;

                                    queries.get_child_by_client_id({'id':req.user[0].iUserId},function(error,childs){
                                        var tbl_exam_participant = [];
                                        for(var i = 0; i < childs.length ; i++ ){
                                            var temp = [
                                                iRoundOneScheduleId,
                                                childs[i].ChildUserId,
                                                0,0,0,'y',dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss")+""
                                            ];
                                            var tempOne = [
                                                iRoundTwoScheduleId,
                                                childs[i].ChildUserId,
                                                0,0,0,'y',dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss")+""
                                            ];
                                            tbl_exam_participant.push(temp);
                                            tbl_exam_participant.push(tempOne);
                                        }

                                        queries.insert_exam_participant(tbl_exam_participant,function(errorThree,resultThree){
                                            if(errorThree) throw errorThree;

                                            var tbl_exam_question = [];

                                            for(var i=0; i<req.body.iRoundOneQuestion.length ;i++){
                                                var temp = [
                                                    iRoundOneScheduleId,
                                                    iRoundOneExamId,
                                                    req.body.iRoundOneQuestion[i]
                                                ]
                                                tbl_exam_question.push(temp);
                                            }
                                            for(var i=0; i<req.body.iRoundTwoQuestion.length ;i++){
                                                var temp = [
                                                    iRoundTwoScheduleId,
                                                    iRoundTwoExamId,
                                                    req.body.iRoundTwoQuestion[i]
                                                ]
                                                tbl_exam_question.push(temp);
                                            }

                                            queries.insert_exam_question(tbl_exam_question,function(errorFour,resultFour){
                                                if(errorFour) throw errorFour;

                                                res.json({
                                                    'status':200,
                                                    'message':'Success',
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });

                }

            });

        }else{
            res.json({
                "status":404,
                "message":'User not active'
            })
        }
    });

    /**
     * Changes Mage for exam_generate
     */

    app.post('/exam_generate',passport.authenticate('jwt',{session:false}),function(req,res){
        cli.blue(req.user);
        if(req.user.length > 0){
            req.checkBody("iRoundOneQuestion","Question must be required").notEmpty();
            req.checkBody("iRoundTwoQuestion","Question must be required").notEmpty();
            req.checkBody("vTitle","Title must be required").notEmpty();
            req.checkBody("vDescription","Description must be required").notEmpty();
            req.checkBody("ExamUser","Must Be Select Exam User").notEmpty();
            req.checkBody("eExamType","Exam Tyoe").notEmpty();
            req.checkBody("eExamSubType","Question Type").notEmpty();
            var validatorError = req.validationErrors();
            req.getValidationResult().then(function(result) {
                if (!result.isEmpty()) {
                    res.json({
                        "status": 404,
                        "message": "Please fill all required value",
                        "Data":result.mapped()
                    });
                }else{
                    queries.insert_exam({vTitle:req.body.vTitle,vDescription:req.body.vDescription,eExamType:req.body.eExamType,eExamSubType:req.body.eExamSubType,iParentId:0,iUserId:req.user[0].iUserId},function(errOne,rowsOne){
                        var iRoundOneExamId  = rowsOne.insertId;
                        queries.insert_exam({vTitle:req.body.vTitle,vDescription:req.body.vDescription,eExamType:req.body.eExamType,eExamSubType:req.body.eExamSubType,iParentId:iRoundOneExamId,iUserId:req.user[0].iUserId},function(errTwo,rowsTwo){
                            var iRoundTwoExamId  = rowsTwo.insertId;
                            queries.insert_exam_schedule({"iExamId":iRoundOneExamId},function(err,resultOne){
                                var iRoundOneScheduleId = resultOne.insertId;
                                queries.insert_exam_schedule({"iExamId":iRoundTwoExamId},function(err,resultTwo){
                                    var iRoundTwoScheduleId = resultTwo.insertId;



                                        var tbl_exam_question = [];
                                        for(var i=0; i<req.body.iRoundOneQuestion.length ;i++){
                                            var temp = [
                                                iRoundOneScheduleId,
                                                iRoundOneExamId,
                                                req.body.iRoundOneQuestion[i]
                                            ]
                                            tbl_exam_question.push(temp);
                                        }
                                        for(var i=0; i<req.body.iRoundTwoQuestion.length ;i++){
                                            var temp = [
                                                iRoundTwoScheduleId,
                                                iRoundTwoExamId,
                                                req.body.iRoundTwoQuestion[i]
                                            ]
                                            tbl_exam_question.push(temp);
                                        }
                                        queries.insert_exam_question(tbl_exam_question,function(errorFour,resultFour){
                                            if(errorFour) throw errorFour;

                                            for(var i = 0; i< req.body.ExamUser.length; i++){
                                                queries.updateExamUser({"iExamId":iRoundOneExamId,
                                                    "iScheduleId":iRoundOneScheduleId,
                                                    "eAvailable":req.body.ExamUser[i].eAvailable,
                                                    "iExamUserId":req.body.ExamUser[i].iExamUserId
                                                },function(errUpdateExamUser,record){
                                                    if(errUpdateExamUser) throw errUpdateExamUser;
                                                });
                                            }

                                            async.forEachOf(req.body.ExamUser,function(value,key,cb){
                                                cli.blue("Total Question");
                                                cli.red(req.body.iRoundOneQuestion.length);
                                                cli.red(req.body.iRoundTwoQuestion.length);
                                                queries_v1.ins_exam_participant({iScheduleId:iRoundOneScheduleId,iUserId:value.iUserId,iParentParticipentId:0,iTotalQuestion:req.body.iRoundOneQuestion.length},function(er1,r1){
                                                    queries_v1.ins_exam_participant({iScheduleId:iRoundTwoScheduleId,iUserId:value.iUserId,iParentParticipentId:r1.insertId,iTotalQuestion:req.body.iRoundTwoQuestion.length},function(er2,r2){

                                                        var tbl_participant_questions = [];
                                                        for(var i=0; i<req.body.iRoundOneQuestion.length ;i++){
                                                            var temp = [
                                                                    r1.insertId,
                                                                    req.body.iRoundOneQuestion[i],
                                                                    "0",
                                                                    "",
                                                                    "wrong",
                                                                    "n"
                                                            ];
                                                            tbl_participant_questions.push(temp);
                                                        }
                                                        for(var i=0; i<req.body.iRoundTwoQuestion.length ;i++){
                                                            var temp = [
                                                                r2.insertId,
                                                                req.body.iRoundTwoQuestion[i],
                                                                "0",
                                                                "",
                                                                "wrong",
                                                                "n"
                                                            ];
                                                            tbl_participant_questions.push(temp);
                                                        }
                                                        queries_v1.ins_participant_question(tbl_participant_questions,function(e3,r3){
                                                           if(e3) throw e3;
                                                        });
                                                    });
                                                });
                                                cb();
                                            },function(err){
                                                console.log("Call back call");
                                                console.log("Get Round One Question");
                                            });
                                            res.json({
                                                'status':200,
                                                'message':'Success',
                                            });
                                        });

                                });
                            });
                        });
                    });

                }

            });

        }else{
            res.json({
                "status":404,
                "message":'User not active'
            });
        }
    });


    /**
     * Get Exam Users
     */

    app.post('/exam_users',passport.authenticate('jwt',{session:false}),function(req,res){
        if(req.user.length > 0){
            req.checkBody("iParentId","Question must be required").notEmpty();
            req.getValidationResult().then(function(result) {
                if (!result.isEmpty()) {
                    res.json({
                        "status": 404,
                        "message": "Please fill all required value",
                        "Data":result.mapped()
                    });
                }else{
                    queries.getExamUser({"iParentId":req.body.iParentId},function(err,result){
                        cli.blue("result for exam users");
                        if(result.length > 0){
                            res.json({
                                'status':200,
                                'message':'Success',
                                'exam_users':result

                            });
                        }else{
                            res.json({
                                'status':400,
                                'message':'Not Found',
                                'exam_users':0
                            });
                        }
                    });
                }
            });
        }else{
            res.json({
                "status":404,
                "message":'User not active'
            });
        }
    });

    /**
     * Get Exam Details for Edit Functionality
     */

    app.post('/exam_details_edit',passport.authenticate('jwt',{session:false}),function (req,res) {
        if(req.user.length > 0){
            req.checkBody("iExamId","ExamId Must be required").notEmpty();
            req.getValidationResult().then(function(result){
                if(!result.isEmpty()){
                    res.json({
                        "status": 404,
                        "message": "Please fill all required value",
                        "Data":result.mapped()
                    });
                }else{
                    queries.get_exam_details({iExamId:req.body.iExamId},function(error,result){
                        cli.blue("GET Exam Details*************************************************");
                        console.log(result[0].vTitle);
                        queries.get_exam_edit_question({iRoundOneId:result[0].iRoundOneId,iRoundTwoId:result[0].iRoundTwoId},function(errOne,resultOne){
                            var RoundOne = [];
                            var RoundTwo = [];
                            var RoundOneScheduleId, RoundTwoScheduleId;
                            for(var i= 0; i<resultOne.length;i++){
                                if(resultOne[i].iExamId == result[0].iRoundOneId){
                                    RoundOne.push(resultOne[i].iQuestionId)
                                    RoundOneScheduleId = resultOne[i].iScheduleId;
                                }else{
                                    RoundTwo.push(resultOne[i].iQuestionId)
                                    RoundTwoScheduleId = resultOne[i].iScheduleId;
                                }
                            }
                            res.json({
                                "status":200,
                                "vTitle":result[0].vTitle,
                                "eExamType":result[0].eExamType,
                                "eExamSubType":result[0].eExamSubType,
                                "vDescription":result[0].vDescription,
                                "RoundOne":RoundOne,
                                "RoundTwo":RoundTwo,
                                "iRoundOneId":result[0].iRoundOneId,
                                "iRoundTwoId":result[0].iRoundTwoId,
                                "RoundOneScheduleId":RoundOneScheduleId,
                                "RoundTwoScheduleId":RoundTwoScheduleId
                            })
                        })
                    });
                }
            });
        }else{
            res.json({
                "status":404,
                "message":'User not active'
            });
        }

    })

    /**
     * Submit Exam Data for Update Exam Detaials
     */
    app.post('/exam_details_update',passport.authenticate('jwt',{session:false}),function(req,res){
        cli.blue("/exam_details_update call ***********************************");
        if(req.user.length > 0 ){
            // req.checkBody("RoundOneQuestion","Question must be required").notEmpty();
            // req.checkBody("RoundTwoQuestion","Question must be required").notEmpty();
            req.checkBody("vTitle","Title must be required").notEmpty();
            req.checkBody("vDescription","Description must be required").notEmpty();
            req.checkBody("ExamUser","Must Be Select Exam User").notEmpty();
            req.checkBody("iRoundOneId","Round One Exam Id Must ").notEmpty();
            req.checkBody("iRoundTwoId","Round Two Exam Id Must ").notEmpty();
            req.checkBody("RoundOneScheduleId","Round One ScheduleId").notEmpty();
            req.checkBody("RoundTwoScheduleId","Round Two ScheduleId").notEmpty();
            req.checkBody("eExamType","Exam Tyoe").notEmpty();
            req.checkBody("eExamSubType","Question Type").notEmpty();
            console.log(JSON.stringify(req.body));
            req.getValidationResult().then(function(result) {
                if (!result.isEmpty()) {
                    res.json({
                        "status": 404,
                        "message": "Please fill all required value",
                        "Data":result.mapped()
                    });
                }else{
                    //Update tbl_exams
                    queries.update_tbl_exams({vTitle:req.body.vTitle,vDescription:req.body.vDescription,iExamId:req.body.iRoundOneId,eExamType:req.body.eExamType,eExamSubType:req.body.eExamSubType});
                    queries.update_tbl_exams({vTitle:req.body.vTitle,vDescription:req.body.vDescription,iExamId:req.body.iRoundTwoId,eExamType:req.body.eExamType,eExamSubType:req.body.eExamSubType});
                    var tbl_exam_question = [];
                    for(var i=0; i<req.body.RoundOneQuestion.length ;i++){
                        var temp = [
                                    req.body.RoundOneScheduleId,
                                    req.body.iRoundOneId,
                                    req.body.RoundOneQuestion[i]
                                    ]
                                    tbl_exam_question.push(temp);
                    }
                    for(var i=0; i<req.body.RoundTwoQuestion.length ;i++){
                                var temp = [
                                    req.body.RoundTwoScheduleId,
                                    req.body.iRoundTwoId,
                                    req.body.RoundTwoQuestion[i]
                                ]
                                tbl_exam_question.push(temp);
                    }

                    if(tbl_exam_question.length > 0){

                        queries.insert_exam_question(tbl_exam_question,function(errorFour,resultFour){
                            if(errorFour) throw errorFour;
                        });

                    }

                    for(var i = 0; i< req.body.ExamUser.length; i++){
                        queries.updateExamUser({"iExamId":req.body.ExamUser[i].iExamId,
                            "iScheduleId":req.body.ExamUser[i].iScheduleId,
                            "eAvailable":req.body.ExamUser[i].eAvailable,
                            "iExamUserId":req.body.ExamUser[i].iExamUserId
                        },function(errUpdateExamUser,record){
                            if(errUpdateExamUser) throw errUpdateExamUser;
                        });
                    }

                    res.json({
                        'status':200,
                        'message':'Success',
                    });
                    async.forEachOf(req.body.ExamUser,function(value,key,cb){
                        if(value.isNewUser == true){
                            cli.blue("Total Question");
                            cli.red(parseInt(req.body.RoundOneQuestion.length) + parseInt(req.body.RoundOneOldQuestion.length)  );
                            queries_v1.ins_exam_participant({iScheduleId:req.body.RoundOneScheduleId,iUserId:value.iUserId,iParentParticipentId:0,iTotalQuestion:parseInt(req.body.RoundOneQuestion.length) + parseInt(req.body.RoundOneOldQuestion.length) },function(er1,r1){
                                queries_v1.ins_exam_participant({iScheduleId:req.body.RoundTwoScheduleId,iUserId:value.iUserId,iParentParticipentId:r1.insertId,iTotalQuestion:parseInt(req.body.RoundTwoQuestion.length) + parseInt(req.body.RoundTwoOldQuestion.length)},function(er2,r2){
                                    var tbl_participant_questions = [];
                                    for(var i=0; i<req.body.RoundOneQuestion.length ;i++){
                                        var temp = [
                                            r1.insertId,
                                            req.body.RoundOneQuestion[i],
                                            "0",
                                            "",
                                            "wrong",
                                            "n"
                                        ];
                                        tbl_participant_questions.push(temp);
                                    }
                                    for(var i=0; i<req.body.RoundOneOldQuestion.length ;i++){
                                        var temp = [
                                            r1.insertId,
                                            req.body.RoundOneOldQuestion[i],
                                            "0",
                                            "",
                                            "wrong",
                                            "n"
                                        ];
                                        tbl_participant_questions.push(temp);
                                    }

                                    for(var i=0; i<req.body.RoundTwoOldQuestion.length ;i++){
                                        var temp = [
                                            r2.insertId,
                                            req.body.RoundTwoOldQuestion[i],
                                            "0",
                                            "",
                                            "wrong",
                                            "n"
                                        ];
                                        tbl_participant_questions.push(temp);
                                    }

                                    for(var i=0; i<req.body.RoundTwoQuestion.length ;i++){
                                        var temp = [
                                            r2.insertId,
                                            req.body.RoundTwoQuestion[i],
                                            "0",
                                            "",
                                            "wrong",
                                            "n"
                                        ];
                                        tbl_participant_questions.push(temp);
                                    }
                                    queries_v1.ins_participant_question(tbl_participant_questions,function(e3,r3){
                                        if(e3) throw e3;
                                    });
                                });
                            });

                        }else{
                            cli.red("Get Value of Exam USers");
                            cli.red(JSON.stringify(value));
                            queries_v1.get_participant_id({iUserId:value.iUserId},function (e4,rFour) {
                                if(e4) throw e4;
                                cli.blue(JSON.stringify(rFour));
                                queries_v1.update_total_question({iTotalQuestion:parseInt(req.body.RoundOneQuestion.length) + parseInt(req.body.RoundOneOldQuestion.length),iWrongAnswers:parseInt(req.body.RoundOneQuestion.length), iParticipantId: rFour[0].RoundOneParticipantId });
                                queries_v1.update_total_question({iTotalQuestion:parseInt(req.body.RoundTwoQuestion.length) + parseInt(req.body.RoundTwoOldQuestion.length),iWrongAnswers:parseInt(req.body.RoundTwoQuestion.length), iParticipantId: rFour[0].RoundTwoParticipantId });
                                var tbl_participant_questions = [];
                                for(var i=0; i<req.body.RoundOneQuestion.length ;i++){
                                    var temp = [
                                        rFour[0].RoundOneParticipantId,
                                        req.body.RoundOneQuestion[i],
                                        "0",
                                        "",
                                        "wrong",
                                        "n"
                                    ];
                                    tbl_participant_questions.push(temp);
                                }


                                for(var i=0; i<req.body.RoundTwoQuestion.length ;i++){
                                    var temp = [
                                        rFour[0].RoundTwoParticipantId,
                                        req.body.RoundTwoQuestion[i],
                                        "0",
                                        "",
                                        "wrong",
                                        "n"
                                    ];
                                    tbl_participant_questions.push(temp);
                                }

                                if(tbl_participant_questions.length > 0){
                                    cli.yellow("Tbl_participant_question");
                                    cli.green("if");
                                    queries_v1.ins_participant_question(tbl_participant_questions,function(e5,r5){
                                        if(e5) throw e5;
                                    });
                                 }else{
                                    cli.yellow("Tbl_participant_question");
                                    cli.blue(JSON.stringify(req.body.RoundOneQuestion));
                                    cli.blue(JSON.stringify(req.body.RoundTwoQuestion));
                                    cli.yellow("Tbl_participant_question");
                                    cli.green("else");
                                }
                            });
                        }
                        cb();
                    },function(err){
                        console.log("Call back call");
                        console.log("Get Round One Question");
                    });











                }
            });
        }else{
            res.json({
                "status":404,
                "message":'User not active'
            });
        }

    })

    /**
     * Get Exam Details for admin panel
     */

    app.post('/exam_details',passport.authenticate('jwt',{session:false}),function(req,res){
        if(req.user.length > 0){
            req.checkBody("iExamId","Exam Id must be required").notEmpty();
            req.getValidationResult().then(function(result) {
                if (!result.isEmpty()) {
                    res.status(404).json({
                        "message": "Please fill all required value",
                        "Data":result.mapped()
                    });
                }else{
                    queries.get_exam_users_by_examid({'iExamId':req.body.iExamId},function(errOne,resOne){
                        if(errOne) throw errOne;
                        queries.get_exam_details({'iExamId':req.body.iExamId},function(errTwo,resTwo){

                            queries.get_question({iExamId:[resTwo[0].iRoundOneId,resTwo[0].iRoundTwoId]},function(errThree,resThree){

                                if(errThree) throw errThree;

                                var RoundOneQuestion = [];
                                var RoundTwoQuestion = [];

                                var mcq = [];
                                var vsq = [];

                                for(var i =0; i<resThree.length;i++){
                                    if(resThree[i].iExamId == resTwo[0].iRoundOneId){
                                        mcq.push(resThree[i].iQuestionId);
                                    }else if(resThree[i].iExamId == resTwo[0].iRoundTwoId){
                                        vsq.push(resThree[i].iQuestionId);
                                    }
                                }

                                queries.get_mcq_by_Ids({"iQuestionId":mcq},function(err,rowsOne) {
                                    var i = 0;
                                    while (i < rowsOne.length) {
                                        var temp = {};
                                        temp.Question = {
                                            "iQuestionId": rowsOne[i].iQuestionId,
                                            "vQuestion": rowsOne[i].vQuestion,
                                            "vAns":rowsOne[i].Ans
                                        };
                                        temp.Answers = [];
                                        for (var j = 0; j < 4; j++) {
                                            temp.Answers.push({
                                                "iAnswerId": rowsOne[i].iAnswerId,
                                                "vAnswer": rowsOne[i].vAnswer
                                            });
                                            i++;
                                        }
                                        RoundOneQuestion.push(temp);
                                    }
                                    /**
                                     * Generate Round Two Question
                                     */
                                    queries.get_vsq_by_Ids({"iQuestionId":vsq},function(ersr,rowsTwo) {
                                        if(ersr) throw ersr;
                                        var j = 0
                                        while(j< rowsTwo.length){
                                            RoundTwoQuestion.push({
                                                "iQuestionId": rowsTwo[j].iQuestionId,
                                                "vQuestion": rowsTwo[j].vQuestion,
                                                "vAns":rowsTwo[j].Ans
                                            });
                                            j++;
                                        }
                                        cli.yellow("Exam Data for");
                                        cli.red("Exam Users");
                                        console.log(resOne);
                                        cli.red("Exam Details All Round");
                                        console.log(resTwo);
                                        cli.red("RoundOne Question");
                                        console.log(RoundOneQuestion);
                                        cli.red("RoundTwo Question");
                                        console.log(RoundTwoQuestion);
                                        cli.red("Round One Details");
                                        res.json({
                                            Users:resOne,
                                            Exam:resTwo,
                                            RoundOne:RoundOneQuestion,
                                            RoundTwo:RoundTwoQuestion
                                        });
                                    });
                                });

                            });

                        });
                    });
                }
            });
        }else{
            res.status(401).json({
                "status":401,
                "message":'Unothorize'
            });
        }
    });

    /**
     * Change Exam Status Delete or Disable or Enable
     */
    app.post('/exam_status',passport.authenticate('jwt',{session:false}),function(req,res){
        if(req.user.length > 0){
            req.checkBody("iExamId","Exam Id must be required").notEmpty();
            req.checkBody("Op","Operation type must be required").notEmpty();
            req.checkBody("eStatus","Status Must be required").notEmpty();
            req.getValidationResult().then(function(result) {
                if (!result.isEmpty()) {
                    res.status(404).json({
                        "message": "Please fill all required value",
                        "Data":result.mapped()
                    });
                }else{
                    if(req.body.Op == "status"){
                        queries.tbl_exams_status({iExamId:req.body.iExamId,eStatus:req.body.eStatus},function(errOne,resOne){
                            if(errOne) throw  errOne;
                            if(resOne.affectedRows > 0){



                                res.status(200).json({
                                    "message":"Exam status changed Successfully."
                                });
                            }else{
                                res.status(400).json({
                                    "message":"Something Wrong"
                                });
                            }
                        })
                    }else if(req.body.Op == "delete"){
                        queries.tbl_exams_status({iExamId:req.body.iExamId,eStatus:req.body.eStatus},function(errOne,resOne){
                            if(errOne) throw  errOne;
                            queries.deleteExamUser({iExamId:req.body.iExamId},function(errTwo,resTwo){
                                if(errTwo) throw errTwo;
                                console.log(resTwo);
                                if(resTwo.affectedRows > 0){
                                    res.status(200).json({
                                        "message":"Exam Deleted Successfully."
                                    });
                                }else{
                                    res.status(400).json({
                                        "message":"Something Wrong"
                                    });
                                }
                            });
                            console.log(resOne);
                        })
                    }
                }
            });



        }else{
            res.status(401).json({
                "status":401,
                "message":'Unothorize'
            });
        }
    });

    /**
     * Total Users
     */

    app.post('/total_users',passport.authenticate('jwt',{session:false}),function(req,res){
        if(req.user.length > 0){
            req.checkBody("offset","Offset is required").notEmpty();
            req.checkBody("limit","Limit is required").notEmpty();
            req.getValidationResult().then(function(result) {
                if (!result.isEmpty()) {
                    res.status(404).json({
                        "message": "Please fill all required value",
                        "Data":result.mapped()
                    });
                }else{
                    queries.total_users({},function(errOne,resOne){
                        console.log(resOne);
                        queries.list_users({limit:req.body.limit, offset: req.body.offset},function(errTwo,resTwo){
                            console.log(resTwo);
                            res.status(200).json({
                                "TotalUsers":resOne[0].TotalUser,
                                "Users":resTwo
                            });
                        });
                    });
                }
            });



        }else{
            res.status(401).json({
                "status":401,
                "message":'Unothorize'
            });
        }
    });

    /**
     * Statistics by iUserId
     */

    app.post('/statistics_by_user',passport.authenticate('jwt',{session:false}),function(req,res){
        console.log(JSON.stringify(req.body));
        if(req.user.length > 0){
            req.checkBody("iUserId","User required").notEmpty();
            req.getValidationResult().then(function(result) {
                if(!result.isEmpty()){
                    res.status(404).json({
                        "message": "Please fill all required value",
                        "Data":result.mapped()
                    });
                }else{
                    queries.state_get_all_exam({"iUserId":req.body.iUserId},function(errOne,resOne){
                        if(errOne) throw errOne;

                        queries.getUserById({"id":req.body.iUserId},function(errTwo,resTwo){
                            var result = {};
                            var itempId = 0;
                            var tempResult = [];
                            cli.blue(JSON.stringify(resOne));
                            for(var i = 0; i<resOne.length; i++){
                                cli.blue(tempResult);
                                if(resOne[i].ROneExamId == itempId){
                                    cli.red("if Call "+i);
                                    result.ExamAttempt.push({
                                        ROneParticipantId:resOne[i].ROneParticipantId,
                                        ROneRightAnswer:resOne[i].ROneRightAnswers,
                                        ROneTotalQuestion:resOne[i].ROneTotalQuestion,
                                        ROneWrongAnswers:resOne[i].ROneWrongAnswers,
                                        ROneExamId:resOne[i].ROneExamId,
                                        RTwoParticipantId:resOne[i].RTwoParticipantId,
                                        RTwoRightAnswers:resOne[i].RTwoRightAnswers,
                                        RTwoTotalQuestion:resOne[i].RTwoTotalQuestion,
                                        RTwoWrongAnswers:resOne[i].RTwoWrongAnswers,
                                        RTwoExamId:resOne[i].RTwoExamId,
                                        ExamDate:resOne[i].ExamDate,
                                        iTotalAttempt:resOne[i].iTotalAttempt
                                    });
                                    i == resOne.length -1 ? tempResult.push(result) : "";
                                }else{
                                    // result != null && itempId == 0 ? tempResult.push(result) : result = {};
                                    cli.red("else call "+i);
                                    if(itempId == 0){
                                        result = {};
                                    }else{
                                        tempResult.push(result);
                                        result = {};
                                    }
                                    itempId = resOne[i].ROneExamId;
                                    result.vTitle = resOne[i].vTitle;
                                    result.vDescription = resOne[i].vDescription;
                                    result.ExamAttempt == undefined ? result.ExamAttempt = [] : "";
                                    result.ExamAttempt.push({
                                        ROneParticipantId:resOne[i].ROneParticipantId,
                                        ROneRightAnswer:resOne[i].ROneRightAnswers,
                                        ROneTotalQuestion:resOne[i].ROneTotalQuestion,
                                        ROneWrongAnswers:resOne[i].ROneWrongAnswers,
                                        ROneExamId:resOne[i].ROneExamId,
                                        RTwoParticipantId:resOne[i].RTwoParticipantId,
                                        RTwoRightAnswers:resOne[i].RTwoRightAnswers,
                                        RTwoTotalQuestion:resOne[i].RTwoTotalQuestion,
                                        RTwoWrongAnswers:resOne[i].RTwoWrongAnswers,
                                        RTwoExamId:resOne[i].RTwoExamId,
                                        ExamDate:resOne[i].ExamDate,
                                        iTotalAttempt:resOne[i].iTotalAttempt
                                    });
                                    i == resOne.length -1 ? tempResult.push(result) : "";
                                    cli.blue(JSON.stringify(tempResult));
                                }
                            }
                            console.log(tempResult);
                            res.status(200).json({tempResult,"User":resTwo});

                        });
                    });
                }
            });
        }else{
            res.status(401).json({
                "status":401,
                "message":'Unothorize'
            });
        }
    });

    /**
     * Dashboard Api for Client And Admin
     */

    app.post('/dashboard',passport.authenticate('jwt',{session:false}),function(req,res)    {
        cli.blue("Dashboard call");
        var eTypeQuestion = [];
        if(req.user.length > 0){
            console.log(JSON.stringify(req.user[0].vUserType));
            if(req.user[0].vUserType == 'client'){
                queries.get_count_users_under_customer({"iUserId":req.user[0].iUserId},function(errOne,resOne){
                    if(errOne) throw  errOne;
                    queries.get_total_exam_generated({"iUserId":req.user[0].iUserId},function(errTwo,resTwo){
                        if(errTwo) throw errTwo;
                        queries.ls_mcq_count({eTypeQuestion:eTypeQuestion},function(errThree,resThree){
                            queries.ls_vsq_count({eTypeQuestion:eTypeQuestion},function(errFour,resFour){
                                queries.getSettings(req,function(errorFive,rowsFive){
                                    res.status(200).json({TotalGameUser:resOne[0].TotalGameUser,
                                        TotalExam:resTwo[0].TotalExam,
                                        iTotalQuestion:resThree[0].iTotalRecords + resFour[0].iTotalRecords,
                                        settings:rowsFive
                                    });
                                });
                            });
                        });

                    });
                });
            }else{
                cli.blue("else CAll");
                queries.get_total_users_for_admin({vParentType:'Parent'},function(errOne,resOne){
                    cli.blue(resOne);
                    if(errOne) throw  errOne;
                    queries.get_total_game_users_for_admin_parent({},function(errTwo,resTwo){
                        cli.blue(resTwo);
                        if(errTwo) throw errTwo;
                        queries.ls_mcq_count({eTypeQuestion:eTypeQuestion},function(errThree,resThree){
                            queries.ls_vsq_count({eTypeQuestion:eTypeQuestion},function(errFour,resFour){
                                queries.get_total_users_for_admin({vParentType:'Teacher'},function(errFive,resFive){
                                    queries.get_total_exams({},function(errSix,resSix){
                                        queries.getSettings(req,function(errorSeven,resSeven){
                                            res.status(200).json({
                                                Parent:resOne[0].TotalUser,
                                                Teacher:resFive[0].TotalUser,
                                                TotalGameUser:resTwo[0].TotalGameUser,
                                                iTotalQuestion:resThree[0].iTotalRecords + resFour[0].iTotalRecords,
                                                TotalExam:resSix[0].TotalExam,
                                                settings:resSeven
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }
        }else{
            res.status(401).json({
                "status":401,
                "message":'Unothorize'
            });
        }
    });


    /**
     * Details Result According to Exam
     */

    app.post('/detail_result',passport.authenticate('jwt',{session:false}),function (req,res) {
        if(req.user.length > 0){
            req.checkBody("ROneParticipantId","Participant required").notEmpty();
            req.checkBody("RTwoParticipantId","Participant required").notEmpty();
            req.getValidationResult().then(function(result) {
                if(!result.isEmpty()){
                    res.status(404).json({
                        "message": "Please fill all required value",
                        "Data":result.mapped()
                    });
                }else{
                    queries.detail_result_round_one({iParticipantId:req.body.ROneParticipantId},function (errOne,resOne) {
                        if(errOne) throw errOne;
                        queries.detail_result_round_two({iParticipantId:req.body.RTwoParticipantId},function (errTwo,resTwo) {
                            if (errTwo) throw errTwo;
                            if(resOne.length > 0 && resTwo.length > 0){
                                res.status(200).json({
                                    "status":200,
                                    "RoundOne":resOne,
                                    "RoundTwo":resTwo,
                                });
                            }else{
                                res.status(404).json({
                                    "status":404,
                                    "message":"Data Not Found"
                                });
                            }
                        });
                    });
                }
            });

        }else{
            res.status(401).json({
                "status":401,
                "message":"Unothorize"
            });
        }
    });

}

/**
 * Magic happen for data table sorting function
 * @param req
 * @returns {*}
 */
function getSorting(req) {
    var i = 0;
    var vSort = [];
    for (i = 0; i < req.order.length; i++) {
        vSort.push(req.columns[req.order[i].column].name + ' ' + req.order[i].dir);
    }
    console.log("try me");
    console.log(JSON.stringify(req));
    console.log(vSort);
    return vSort.toString();
}

/**
 * Check Email Available or not
 * @param vEmail
 * @param cb
 */
function checkUser(vEmail,cb){
    queries.checkEmail({'vEmail':vEmail},cb);
}

