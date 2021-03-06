var queries = require("../modules/queries");
var queries_v1 = require("../modules/queries_v1");
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

        queries.getUserAdmin(body,function(err,rows){
            if(err)throw err;
            if(rows.length === 1){
                if(rows[0].eStatus == 'y'){
                    var hash = md5(rows[0].iUserId + Math.random() + Date.now());
                    var payload = { 'token':hash,'device':req.body.eDeviceType,'vUserType':rows[0].vUserType};
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
                    $message = 'User not active, please contact parent / teacher';
                    res.status(401).json({
                        'status': 401,
                        'message': 'Please Check your email/password'
                    });
                }
            }else{
                $message = 'User not exists';
                res.status(401).json({
                    'status': 401,
                    'message': 'Please Check your email/password'
                });
            }
        });

    });

    app.get('/ws/v1/profile',passport.authenticate('jwt',{session:false}),function(req,res){
        cli.yellow("*******************************************************************");
        cli.yellow("***********************************************Profile Call*");

        cli.blue(JSON.stringify(req.user));

        if(req.user[0].vUserType == "client"){

            if (req.user.length > 0) {
                queries.getUserFroById({'id':req.user[0].iUserId}, function(err, record) {
                    cli.yellow("Get Client User Dataasdfasdfasdfasdfasdfasdfadsfadsf");
                    console.log(record[0]);
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


        }else{

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

        }
    });

    app.get('/ws/v1/joinRoom',passport.authenticate('jwt',{session:false}),function(req,res){
        if(req.user.length > 0){
            res.status(200).json({
                'status':200,
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

    app.post('/ws/v1/game_details',passport.authenticate('jwt',{session:false}),function(req,res){
        req.checkBody("iRoundOneId","iRoundOneId must be required").notEmpty();
        req.checkBody("iRoundTwoId","iRoundTwoId must be required").notEmpty();
        req.getValidationResult().then(function(result) {
            if (!result.isEmpty()) {
                res.json({
                    "status": 404,
                    "message": "Please fill all required value",
                    "Data":result.mapped()
                });
            }else{
                queries.get_round_details({'iExamId':req.body.iRoundOneId},function(errs,roundOne){
                    if(errs) throw errs;
                    queries.get_round_details({'iExamId':req.body.iRoundOneId},function(errs,roundTwo){
                        if(errs) throw errs;
                        console.log("Round One Details");
                        cli.yellow(JSON.stringify(roundOne));
                        console.log("Round Two Details");
                        cli.yellow(JSON.stringify(roundTwo));

                        res.json({
                            'status':200,
                            'message':'Success',
                            'data':{
                                "iTotalQuestion":roundOne[0].iTotalQuestion + roundTwo[0].iTotalQuestion,
                                "iRightAnswers":roundOne[0].iRightAnswers + roundTwo[0].iRightAnswers,
                                "iWrongAnswer":roundOne[0].iWrongAnswers + roundTwo[0].iWrongAnswers,
                            }
                        });


                    });

                });

            }
        });
    });

    app.get('/ws/v1/check_exam',passport.authenticate('jwt',{session:false}),function(req,res){
        if(req.user.length > 0){
            queries.check_exam_available({iUserId:req.user[0].iUserId},function(errOne,resOne){
                if(errOne) throw  errOne;
                if(resOne.length > 0 ){
                    queries.get_exam_details({iExamId:resOne[0].iExamId},function(errTwo,resTwo){
                        if(errTwo) throw errTwo;
                        console.log(resTwo);
                        if(resTwo.length > 0){
                            queries.get_question({iExamId:[resTwo[0].iRoundOneId,resTwo[0].iRoundTwoId]},function(errThree,resThree){
                                if(errThree) throw errThree;
                                console.log(resThree);

                                var RoundOneQuestion = [];
                                var RoundTwoQuestion = [];
                                var RoundOne = {};
                                var RoundTwo = {};

                                var mcq = [];
                                var vsq = [];

                                for(var i =0; i<resThree.length;i++){
                                    if(resThree[i].iExamId == resTwo[0].iRoundOneId){
                                        RoundOne.iExamId = resThree[i].iExamId;
                                        RoundOne.iScheduleId = resThree[i].iScheduleId;
                                        mcq.push(resThree[i].iQuestionId);
                                    }else if(resThree[i].iExamId == resTwo[0].iRoundTwoId){
                                        RoundTwo.iExamId = resThree[i].iExamId;
                                        RoundTwo.iScheduleId = resThree[i].iScheduleId;
                                        vsq.push(resThree[i].iQuestionId);
                                    }
                                }
                                mcq.length > 0 ? "" : mcq.push(0);
                                vsq.length > 0 ? "" : vsq.push(0);
                                queries.get_mcq_by_Ids({"iQuestionId":mcq},function(err,rowsOne) {
                                    var i = 0;
                                    while (i < rowsOne.length) {
                                        var temp = {};
                                        temp.Question = {
                                            "iQuestionId": rowsOne[i].iQuestionId,
                                            "vQuestion": rowsOne[i].vQuestion
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
                                    console.log("Exam Paper");
                                    cli.blue(JSON.stringify(RoundOneQuestion));

                                    /**
                                     * Generate Round Two Question
                                     */
                                    queries.get_vsq_by_Ids({"iQuestionId":vsq},function(ersr,rowsTwo) {
                                        if(ersr) throw ersr;
                                        var j = 0
                                        while(j< rowsTwo.length){
                                            RoundTwoQuestion.push({
                                                "iQuestionId": rowsTwo[j].iQuestionId,
                                                "vQuestion": rowsTwo[j].vQuestion
                                            });
                                            j++;
                                        }
                                        cli.yellow("Exam Data for");
                                        cli.red("RoundOne Question");
                                        console.log(RoundOneQuestion);
                                        cli.red("RoundTwo Question");
                                        console.log(RoundTwoQuestion);
                                        cli.red("Round One Details");
                                        console.log(RoundOne);
                                        cli.red("Round Two Details");
                                        console.log(RoundTwo);

                                        queries.insert_exam_participant({iScheduleId:RoundOne.iScheduleId,iUserId:req.user[0].iUserId,iParentParticipentId:0},function (errFour,resFour) {
                                            if(errFour) throw errFour;
                                            queries.insert_exam_participant({iScheduleId:RoundTwo.iScheduleId,iUserId:req.user[0].iUserId,iParentParticipentId: resFour.insertId},function (errFive,resFive) {
                                                if(errFive) throw  errFive;
                                                RoundOne.iParticipantId = resFour.insertId;
                                                RoundTwo.iParticipantId = resFive.insertId;
                                                RoundOne.isAvailable = true;
                                                RoundTwo.isAvailable = true;
                                                res.status(200).json({
                                                    'status':200,
                                                    'data':{
                                                        'RoundOneQuestion':RoundOneQuestion,
                                                        'RoundTwoQuestion':RoundTwoQuestion,
                                                        'RoundOne':RoundOne,
                                                        'RoundTwo':RoundTwo,
                                                    }
                                                });
                                            });
                                        });
                                    });
                                });

                            });

                        } else{
                            res.status(404).json({
                                'status':404,
                                'message':"Exam Not Available For You"
                            })
                        }
                    });
                }else{
                    res.status(404).json({
                        'status':404,
                        'message':"Exam Not Available For You"
                    })
                }
            });
        }else{
            res.status(401).json({
                'status':401,
                'message':'User does not exists'
            })
        }
    });

    app.post('/ws/v1/ans',passport.authenticate('jwt',{session:false}),function(req,res){
        if(req.user.length > 0){
            req.checkBody("iRound","Round Number Must be required").notEmpty();
            req.checkBody("iQuestionId","QuestionId Must Be Required").notEmpty();
            req.checkBody("iParticipantId","Participent Id Must Be Required").notEmpty();
            req.checkBody("iAnswerId","AnswerId Must Be Required").notEmpty();
            req.checkBody("vAnswer","Answer Must Be Required").notEmpty();
            req.checkBody("tryagain","Must be select tryagain").notEmpty();
            req.checkBody("iTryagainId","Participent Id Must Be Required").notEmpty();
            req.getValidationResult().then(function(result) {
                if (!result.isEmpty()) {
                    res.json({
                        "status": 404,
                        "message": "Please fill all required value",
                        "Data":result.mapped()
                    });
                }else{
                    cli.blue(JSON.stringify(req.body));
                    console.log(JSON.stringify(req.body));
                    if(req.body.tryagain == "True"){
                        cli.yellow(JSON.stringify(req.body));
                        console.log(true);
                        if(req.body.iRound == 1){
                            queries.check_round_one_question_answer({"iQuestionId":req.body.iQuestionId,"iAnswerId":req.body.iAnswerId},function(errOne,resOne){
                                var updatParticipant = {};
                                var participantQuestions = {};
                                if(resOne[0].rowCount > 0){
                                    participantQuestions = {
                                        "iTryagainId":req.body.iTryagainId,
                                        "iQuestionId":req.body.iQuestionId,
                                        "iAnswerId":req.body.iAnswerId,
                                        "vAnswer":'null',
                                        "eCheck":"right",
                                        "eStatus":"y"
                                    };
                                    updatParticipant = {
                                        "iTotalQuestion":1,
                                        "iRightAnswers":1,
                                        "iWrongAnswers":0,
                                        "iTryagainId":req.body.iTryagainId
                                    }

                                    res.json({
                                        'status':200,
                                        'message':'Success',
                                        'eStatus':true
                                    });
                                }
                                else{
                                    participantQuestions = {
                                        "iTryagainId":req.body.iTryagainId,
                                        "iQuestionId":req.body.iQuestionId,
                                        "iAnswerId":req.body.iAnswerId,
                                        "vAnswer":'null',
                                        "eCheck":"wrong",
                                        "eStatus":"y"
                                    };
                                    updatParticipant = {
                                        "iTotalQuestion":1,
                                        "iRightAnswers":0,
                                        "iWrongAnswers":1,
                                        "iTryagainId":req.body.iTryagainId,
                                    };
                                    res.json({
                                        'status':200,
                                        'message':'Success',
                                        'eStatus':false
                                    });
                                }
                                queries_v1.update_tryagain_exam_participant(updatParticipant,function(errThree,resThree){
                                   if(errThree) throw errThree;
                                });
                                queries_v1.insert_tryagain_participant_questions(participantQuestions,function (errFour,resFour) {
                                    if(errFour) throw errFour;
                                })
                            });
                        }
                        else if(req.body.iRound == 2){
                            queries.check_round_two_question_answer({"iQuestionId":req.body.iQuestionId,"vAnswer":req.body.vAnswer},function(errTwo,resTwo){
                                var participantQuestions = {};
                                var updatParticipant = {};
                                if(resTwo[0].rowCount > 0){
                                    participantQuestions = {
                                        "iTryagainId":req.body.iTryagainId,
                                        "iQuestionId":req.body.iQuestionId,
                                        "iAnswerId":0,
                                        "vAnswer":req.body.vAnswer,
                                        "eCheck":"right",
                                        "eStatus":"y"
                                    };
                                    updatParticipant = {
                                        "iTotalQuestion":1,
                                        "iRightAnswers":1,
                                        "iWrongAnswers":0,
                                        "iTryagainId":req.body.iTryagainId,
                                    }
                                    res.json({
                                        'status':200,
                                        'message':'Success',
                                        'eStatus':true
                                    });
                                }
                                else{
                                    participantQuestions = {
                                        "iTryagainId":req.body.iTryagainId,
                                        "iQuestionId":req.body.iQuestionId,
                                        "iAnswerId":0,
                                        "vAnswer":req.body.vAnswer,
                                        "eCheck":"wrong",
                                        "eStatus":"y"
                                    };
                                    updatParticipant = {
                                        "iTotalQuestion":1,
                                        "iRightAnswers":0,
                                        "iWrongAnswers":1,
                                        "iTryagainId":req.body.iTryagainId,
                                    };
                                    res.json({
                                        'status':200,
                                        'message':'Success',
                                        'eStatus':false
                                    });
                                }
                                queries_v1.update_tryagain_exam_participant(updatParticipant,function(errThree,resThree){
                                    if(errThree) throw errThree;
                                });
                                queries_v1.insert_tryagain_participant_questions(participantQuestions,function (errFour,resFour) {
                                    if(errFour) throw errFour;
                                })
                            });
                        }

                    }
                    else{
                        console.log(false);
                        if(req.body.iRound == 1){
                            queries.check_round_one_question_answer({"iQuestionId":req.body.iQuestionId,"iAnswerId":req.body.iAnswerId},function(err1,res1){
                                var updatParticipant = {};
                                var participantQuestions = {};
                                if(res1[0].rowCount > 0){
                                    participantQuestions = {
                                        "iParticipantId":req.body.iParticipantId,
                                        "iQuestionId":req.body.iQuestionId,
                                        "iAnswerId":req.body.iAnswerId,
                                        "vAnswer":'null',
                                        "eCheck":"right",
                                        "eStatus":"y"
                                    };
                                    updatParticipant = {
                                        "iTotalQuestion":1,
                                        "iRightAnswers":1,
                                        "iWrongAnswers":0,
                                        "iParticipantId":req.body.iParticipantId
                                    }

                                    res.json({
                                        'status':200,
                                        'message':'Success',
                                        'eStatus':true
                                    });
                                }
                                else{
                                    participantQuestions = {
                                        "iParticipantId":req.body.iParticipantId,
                                        "iQuestionId":req.body.iQuestionId,
                                        "iAnswerId":req.body.iAnswerId,
                                        "vAnswer":'null',
                                        "eCheck":"wrong",
                                        "eStatus":"y"
                                    };
                                    updatParticipant = {
                                        "iTotalQuestion":1,
                                        "iRightAnswers":0,
                                        "iWrongAnswers":1,
                                        "iParticipantId":req.body.iParticipantId
                                    };
                                    res.json({
                                        'status':200,
                                        'message':'Success',
                                        'eStatus':false
                                    });
                                }
                                cli.red("Round One Data");
                                cli.blue(JSON.stringify(participantQuestions));
                                cli.blue(JSON.stringify(updatParticipant));
                                queries.update_exam_participant(updatParticipant,function(err3,res3){
                                    if(err3) throw err3;
                                });
                                queries.insert_participant_questions(participantQuestions,function(e,r){
                                    if(e) throw e;
                                });

                            });
                        }
                        else if(req.body.iRound == 2){
                            queries.check_round_two_question_answer({"iQuestionId":req.body.iQuestionId,"vAnswer":req.body.vAnswer},function(err,res2){
                                var participantQuestions = {};
                                var updatParticipant = {};
                                if(res2[0].rowCount > 0){
                                    participantQuestions = {
                                        "iParticipantId":req.body.iParticipantId,
                                        "iQuestionId":req.body.iQuestionId,
                                        "iAnswerId":0,
                                        "vAnswer":req.body.vAnswer,
                                        "eCheck":"right",
                                        "eStatus":"y"
                                    };
                                    updatParticipant = {
                                        "iTotalQuestion":1,
                                        "iRightAnswers":1,
                                        "iWrongAnswers":0,
                                        "iParticipantId":req.body.iParticipantId
                                    }
                                    res.json({
                                        'status':200,
                                        'message':'Success',
                                        'eStatus':true
                                    });
                                }else{
                                    participantQuestions = {
                                        "iParticipantId":req.body.iParticipantId,
                                        "iQuestionId":req.body.iQuestionId,
                                        "iAnswerId":0,
                                        "vAnswer":req.body.vAnswer,
                                        "eCheck":"wrong",
                                        "eStatus":"y"
                                    };
                                    updatParticipant = {
                                        "iTotalQuestion":1,
                                        "iRightAnswers":0,
                                        "iWrongAnswers":1,
                                        "iParticipantId":req.body.iParticipantId
                                    };

                                    res.json({
                                        'status':200,
                                        'message':'Success',
                                        'eStatus':false
                                    });
                                }
                                cli.red("Round Two Data");
                                cli.blue(JSON.stringify(participantQuestions));
                                cli.blue(JSON.stringify(updatParticipant));
                                queries.update_exam_participant(updatParticipant,function(err3,res3){
                                    if(err3) throw err3;
                                });
                                queries.insert_participant_questions(participantQuestions,function(err,res2){
                                    if(err) throw err;
                                });
                            });
                        }
                    }
                }
            });
        }else{
            res.status(401).json({
                'status':401,
                'message':'User does not exists'
            })
        }
    });

    app.post('/ws/v1/final_result',passport.authenticate('jwt',{session:false}),function(req,res){
        cli.blue(JSON.stringify(req.body));
        if(req.user.length > 0){
            req.checkBody("iRoneParticipantId","Round One  Participent Id Must Be Required").notEmpty();
            req.checkBody("iRtwoParticipantId","Round One  Participent Id Must Be Required").notEmpty();
            req.checkBody("iRoneTryagainId","Round One  Participent Id Must Be Required").notEmpty();
            req.checkBody("iRtwoTryagainId","Round One  Participent Id Must Be Required").notEmpty();
            req.getValidationResult().then(function(result) {
                if (!result.isEmpty()) {
                    res.json({
                        "status": 404,
                        "message": "Please fill all required value",
                        "Data":result.mapped()
                    });
                }else{
                    if(req.body.iRoneTryagainId != 0){
                        queries.get_exam_result_after_try_again({iTryagainId:req.body.iRoneTryagainId},function(errOne,resOne){
                            if(errOne) throw errOne;
                            res.status(200).json({
                                "status":200,
                                "data":resOne[0]
                            });
                        });
                    }else{

                        queries.get_exam_final_result({iParticipantId:req.body.iRoneParticipantId},function(errOne,resOne){
                            if(errOne) throw errOne;
                            res.status(200).json({
                                "status":200,
                                "data":resOne[0]
                            });
                        });

                    }
                }
            });
        }else{
            res.status(401).json({
                'status':401,
                'message':'User does not exists'
            })
        }
    });

    //Just for fun
    app.get('/ws/v1/check_examasdf',passport.authenticate('jwt',{session:false}),function(req,res){
        cli.red("Token");
        cli.red(req);
        if(req.user.length > 0){
            queries_v1.check_exam_available({iUserId:req.user[0].iUserId},function(errOne,resOne){
                if(resOne.length > 0){
                    console.log(JSON.stringify(resOne));

                    queries_v1.get_examId_scheduleId({iExamId:resOne[0].iExamId},function(errTwo,resTwo){
                        console.log(resTwo);
                        queries_v1.ins_exam_participant({iScheduleId:resTwo[0].RoundOneScheduleId,iUserId:resOne[0].iUserId,iParentParticipentId:0,iTotalQuestion:"0"},function(er1,r1){
                            queries_v1.ins_exam_participant({iScheduleId:resTwo[0].RoundTwoScheduleId,iUserId:resOne[0].iUserId,iParentParticipentId:r1.insertId,iTotalQuestion:"0"},function(er2,r2){

                            });
                        });
                    });







                    queries_v1.chek_exam_participent({iUserId:req.user[0].iUserId,iScheduleId:resOne[0].iScheduleId},function(errTwo,resTwo){
                        if(resTwo[0].RoneiWrongAnswer > 0 || resTwo[0].RtwoiWrongAnswer){
                            var RoneiParticipantId = resTwo[0].RoneiParticipantId;
                            var RtwoiParticipantId = resTwo[0].RtwoiParticipantId;
                            var TotalAttempt = resTwo[0].TotalAttempt;
                            var Response  = {};
                            var RoundOneQuestion = [];
                            var RoundTwoQuestion = [];
                            queries_v1.get_participant_question({iParticipantId: RoneiParticipantId},function(errThree,resThree){
                                //TotalAttempt
                                cli.green(JSON.stringify(resThree));
                                if(resThree.length > 0){
                                    var mcq = [];
                                    for ( var k = 0; k < resThree.length ; k++){
                                        mcq.push(resThree[k].iQuestionId);
                                    }
                                    queries.get_mcq_by_Ids({iQuestionId:mcq},function(errFour,resFour){
                                        cli.blue(JSON.stringify(resFour));
                                        var i = 0;
                                        while (i < resFour.length) {
                                            var temp = {};
                                            temp.Question = {
                                                "iQuestionId": resFour[i].iQuestionId,
                                                "vQuestion": resFour[i].vQuestion
                                            };
                                            temp.Answers = [];
                                            for (var j = 0; j < 4; j++) {
                                                temp.Answers.push({
                                                    "iAnswerId": resFour[i].iAnswerId,
                                                    "vAnswer": resFour[i].vAnswer
                                                });
                                                i++;
                                            }
                                            RoundOneQuestion.push(temp);
                                        }
                                        Response.RoundOne = {
                                            "iParticipantId":RoneiParticipantId,
                                            "isAvailable":true
                                        }
                                        Response.RoundOneQuestion = RoundOneQuestion;
                                    });
                                }else{
                                    Response.RoundOne = {
                                        "iParticipantId":RoneiParticipantId,
                                        "isAvailable":false
                                    }
                                }
                                queries_v1.get_participant_question({iParticipantId: RtwoiParticipantId},function(errFive,resFive){
                                    cli.red(JSON.stringify(resFive));
                                    if(resFive.length > 0){
                                        var vsq = [];
                                        for (var l = 0; l<resFive.length ; l++){
                                            vsq.push(resFive[l].iQuestionId);
                                        }
                                        queries.get_vsq_by_Ids({iQuestionId:vsq},function(errSix,resSix){
                                            var j = 0;
                                            while(j< resSix.length){
                                                RoundTwoQuestion.push({
                                                    "iQuestionId": resSix[j].iQuestionId, "vQuestion": resSix[j].vQuestion
                                                });
                                                j++;
                                            }
                                            Response.RoundTwo = {
                                                "iParticipantId":RtwoiParticipantId,
                                                "isAvailable":true
                                            }

                                            Response.RoundTwoQuestion = RoundTwoQuestion;
                                            queries_v1.update_participant_attempt({iParticipantId:RtwoiParticipantId},function(errSeven,resSeven){
                                                cli.red("Attempt ROne");
                                                if(errSeven) throw errSeven;
                                                queries_v1.update_participant_attempt({iParticipantId:RoneiParticipantId},function (errEight,resEight) {
                                                    cli.red("Attempt RTwo");
                                                    if(errEight) throw errEight;
                                                });
                                            });
                                            Response.TotalAttempt = TotalAttempt + 1;
                                            res.status(200).json({
                                                'status':200,
                                                data:Response
                                            });

                                        });
                                    }else{
                                        Response.RoundTwo = {
                                            "iParticipantId":RtwoiParticipantId,
                                            "isAvailable":false
                                        }

                                        Response.TotalAttempt = TotalAttempt + 1;
                                        res.status(200).json({
                                            'status':200,
                                            data:Response
                                        });

                                        queries_v1.update_participant_attempt({iParticipantId:RtwoiParticipantId},function(errSeven,resSeven){
                                            cli.red("Attempt ROne");
                                            if(errSeven) throw errSeven;
                                            queries_v1.update_participant_attempt({iParticipantId:RoneiParticipantId},function (errEight,resEight) {
                                                cli.red("Attempt RTwo");
                                                if(errEight) throw errEight;
                                            });
                                        });

                                    }

                                });
                            });
                        }else{
                            res.status(403).json({
                                'status':403,
                                'message':'You already have completed this exam.'
                            })
                        }
                    });
                }else{
                    res.status(404).json({
                        'status':404,
                        'message':'There is no exams schedule for you.'
                    });
                }
            });
        }else{
            res.status(401).json({
                'status':401,
                'message':'User does not exists'
            });
        }

    });

    app.post('/ws/v1/try_again',passport.authenticate('jwt',{session:false}),function(req,res){
        console.log(JSON.stringify(req.user));
    if(req.user.length > 0){
        req.checkBody("iRoneTryagainId","Try Again Id must be required").notEmpty();
        req.checkBody("iRtwoTryagainId","Try Again Id must be required").notEmpty();
        req.checkBody("iRoneParticipantId","Round One  Participent Id Must Be Required").notEmpty();
        req.checkBody("iRtwoParticipantId","Round One  Participent Id Must Be Required").notEmpty();
        req.getValidationResult().then(function(result){
            if(!result.isEmpty()){
                res.json({
                    "status": 404,
                    "message": "Please fill all required value",
                    "Data":result.mapped()
                });
            }else{
                console.log("Try Again call");
                console.log(JSON.stringify(req.body));
                if(req.body.iRoneTryagainId > 0){
                    queries_v1.get_wrong_question_attempt_second({iTryagainId:[req.body.iRoneTryagainId,req.body.iRtwoTryagainId]},function(errOne,resOne){
                        cli.blue(JSON.stringify(resOne));
                        console.log(resOne.length);
                        if(resOne.length > 0){
                            var Response = {};
                            var RoundOneQuestion = [];
                            var RoundTwoQuestion = [];
                            for(var i = 0;i < resOne.length ;i++){
                                if(req.body.iRoneTryagainId == resOne[i].iTryagainId){
                                    RoundOneQuestion.push(resOne[i].iQuestionId);
                                }
                                if(req.body.iRtwoTryagainId == resOne[i].iTryagainId){
                                    RoundTwoQuestion.push(resOne[i].iQuestionId);
                                }
                                cli.red(i);
                            }
                            cli.blue(RoundOneQuestion);
                            cli.blue(RoundTwoQuestion);

                            RoundOneQuestion.length > 0 ? "" : RoundOneQuestion.push(0);
                            RoundTwoQuestion.length > 0 ? "" : RoundTwoQuestion.push(0);
                            queries_v1.insert_tbl_tryagain({iParticipantId:req.body.iRoneParticipantId,iParentTryagainId:0},function(errTwo,resTwo){
                                queries_v1.insert_tbl_tryagain({iParticipantId:req.body.iRtwoParticipantId,iParentTryagainId:resTwo.insertId},function(errThree,resThree){
                                    queries.get_mcq_by_Ids({iQuestionId:RoundOneQuestion},function (errFour,resFour) {
                                        queries.get_vsq_by_Ids({iQuestionId:RoundTwoQuestion},function (errFive,resFive) {
                                            var RoundOne = [];
                                            var RoundTwo = [];
                                            var i = 0;
                                            while (i < resFour.length) {
                                                var temp = {};
                                                temp.Question = {
                                                    "iQuestionId": resFour[i].iQuestionId,
                                                    "vQuestion": resFour[i].vQuestion
                                                };
                                                temp.Answers = [];
                                                for (var j = 0; j < 4; j++) {
                                                    temp.Answers.push({
                                                        "iAnswerId": resFour[i].iAnswerId,
                                                        "vAnswer": resFour[i].vAnswer
                                                    });
                                                    i++;
                                                }
                                                RoundOne.push(temp);
                                            }

                                            var j = 0;
                                            while(j< resFive.length){
                                                RoundTwo.push({
                                                    "iQuestionId": resFive[j].iQuestionId, "vQuestion": resFive[j].vQuestion
                                                });
                                                j++;
                                            }
                                            if(RoundOne.length > 0){
                                                var temp = {
                                                    'isAvailable':true,
                                                    "iParticipantId":req.body.iRoneParticipantId,
                                                    "iTryagainId":resTwo.insertId
                                                };
                                                Response.RoundOne = temp;
                                            }else{
                                                var temp = {
                                                    'isAvailable':false,
                                                    "iParticipantId":req.body.iRoneParticipantId,
                                                    "iTryagainId":resTwo.insertId
                                                };
                                                Response.RoundOne = temp;
                                            }

                                            if(RoundTwo.length > 0){
                                                var temp = {
                                                    'isAvailable':true,
                                                    "iParticipantId":req.body.iRtwoParticipantId,
                                                    "iTryagainId":resThree.insertId
                                                };
                                                Response.RoundTwo = temp;
                                            }else{
                                                var temp = {
                                                    'isAvailable':false,
                                                    "iParticipantId":req.body.iRtwoParticipantId,
                                                    "iTryagainId":resThree.insertId
                                                };
                                                Response.RoundTwo = temp;
                                            }

                                            Response.RoundOneQuestion = RoundOne;
                                            Response.RoundTwoQuestion = RoundTwo;
                                            res.status(200).json({
                                                'status':200,
                                                'data':Response
                                            });

                                        });
                                    });
                                });
                            });

                        }
                        else{
                            res.status(403).json({
                                'status':403,
                                'message':'You already have completed this exam.'
                            });
                        }
                    });
                    console.log("Not First Time");
                }else{
                    console.log("First Time");
                    queries_v1.get_wrong_question_attempt_first({iParticipantId:[req.body.iRoneParticipantId,req.body.iRtwoParticipantId]},function(errOne,resOne){
                       if(errOne) throw errOne;
                       console.log(resOne);
                       if(resOne.length > 0){
                            var Response = {};
                            var RoundOneQuestion = [];
                            var RoundTwoQuestion = [];
                            for(var i = 0;i < resOne.length ;i++){
                                if(req.body.iRoneParticipantId == resOne[i].iParticipantId){
                                    RoundOneQuestion.push(resOne[i].iQuestionId);
                                }
                                if(req.body.iRtwoParticipantId == resOne[i].iParticipantId){
                                    RoundTwoQuestion.push(resOne[i].iQuestionId);
                                }
                            }

                            RoundOneQuestion.length > 0 ? "" : RoundOneQuestion.push(0);
                            RoundTwoQuestion.length > 0 ? "" : RoundTwoQuestion.push(0);
                            queries_v1.insert_tbl_tryagain({iParticipantId:req.body.iRoneParticipantId,iParentTryagainId:0},function(errTwo,resTwo){
                                queries_v1.insert_tbl_tryagain({iParticipantId:req.body.iRtwoParticipantId,iParentTryagainId:resTwo.insertId},function(errThree,resThree){
                                    queries.get_mcq_by_Ids({iQuestionId:RoundOneQuestion},function (errFour,resFour) {
                                        queries.get_vsq_by_Ids({iQuestionId:RoundTwoQuestion},function (errFive,resFive) {
                                            var RoundOne = [];
                                            var RoundTwo = [];
                                            var i = 0;
                                            while (i < resFour.length) {
                                                var temp = {};
                                                temp.Question = {
                                                    "iQuestionId": resFour[i].iQuestionId,
                                                    "vQuestion": resFour[i].vQuestion
                                                };
                                                temp.Answers = [];
                                                for (var j = 0; j < 4; j++) {
                                                    temp.Answers.push({
                                                        "iAnswerId": resFour[i].iAnswerId,
                                                        "vAnswer": resFour[i].vAnswer
                                                    });
                                                    i++;
                                                }
                                                RoundOne.push(temp);
                                            }

                                            var j = 0;
                                            while(j< resFive.length){
                                                RoundTwo.push({
                                                    "iQuestionId": resFive[j].iQuestionId, "vQuestion": resFive[j].vQuestion
                                                });
                                                j++;
                                            }
                                            if(RoundOne.length > 0){
                                                var temp = {
                                                    'isAvailable':true,
                                                    "iParticipantId":req.body.iRoneParticipantId,
                                                    "iTryagainId":resTwo.insertId
                                                };
                                                Response.RoundOne = temp;
                                            }else{
                                                var temp = {
                                                    'isAvailable':false,
                                                    "iParticipantId":req.body.iRoneParticipantId,
                                                    "iTryagainId":resTwo.insertId
                                                };
                                                Response.RoundOne = temp;
                                            }

                                            if(RoundTwo.length > 0){
                                                var temp = {
                                                    'isAvailable':true,
                                                    "iParticipantId":req.body.iRtwoParticipantId,
                                                    "iTryagainId":resThree.insertId
                                                };
                                                Response.RoundTwo = temp;
                                            }else{
                                                var temp = {
                                                    'isAvailable':false,
                                                    "iParticipantId":req.body.iRtwoParticipantId,
                                                    "iTryagainId":resThree.insertId
                                                };
                                                Response.RoundTwo = temp;
                                            }

                                            Response.RoundOneQuestion = RoundOne;
                                            Response.RoundTwoQuestion = RoundTwo;
                                            res.status(200).json({
                                                'status':200,
                                                'data':Response
                                            });

                                        });
                                    });
                                });
                            });

                           console.log("Round One Question");
                           console.log(RoundOneQuestion);
                           console.log("Round Two Question");
                           console.log(RoundTwoQuestion);
                        }
                       else{
                            res.status(403).json({
                                    'status':403,
                                    'message':'You already have completed this exam.'
                            });
                       }
                    });
                }
            }
        });

    }else{
        res.status(401).json({
            'status':401,
            'message':'User does not exists'
        })
    }
    });

}