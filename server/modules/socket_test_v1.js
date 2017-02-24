var cli = require("../../config/config").console;
var queries = require("./queries");
var async = require("async");
var user = []; //List of OneLine User
var examUser = []; //List of Exam User
module.exports = function(app,io){
    io.on('connection', function(socket){

        socket.on('joinGame',function(data,fn){
            queries.getUserById({'id':data.iUserId},function(err,rows){
                if(err) throw err;
                user.push({
                    'socket':socket.id,
                    'iUserId':rows[0].iUserId,
                    'vFullName':rows[0].vFullName,
                    'vUserName':rows[0].vUserName,
                    'vEmail':rows[0].vEmail,
                    'isActive':false
                });
                //list of user send to angular application
                io.sockets.emit('listUser',{data:user});
            });
            fn({"message":"You are in watting state",'status':200,'socket':socket.id});

        });
        io.sockets.emit('listUser',{data:user}); //Angularjs List of Active User.



        socket.on('examUser',function(data){ //Angularjs
            cli.red("examUser");
            examUser = data.examUser;
            cli.blue(examUser);
            io.sockets.emit('examUser',data); //Unity
        });

        socket.on('ReadyForExam',function(data,fn){ //Unity
            cli.red("ReadyForExam");
            socket.join('Exam_Room');
            fn({"message":"Wait for some moment",'status':200,'socket':socket.id,'room':'Exam_Room'});
        });

        // socket.on('startGame',function(startGameData){ //Angularjs
        //     cli.red("startGame");
        //     console.log(startGameData);
        //     queries.get_mcq_by_Ids({"iQuestionId":startGameData.examQuestion},function(err,rows){
        //         console.log(rows);
        //         var i = 0;
        //         var examPaper = [];
        //         while(i < rows.length){
        //             var temp = {};
        //             temp.Question = {
        //                 "iQuestionId":rows[i].iQuestionId,
        //                 "vQuestion":rows[i].vQuestion
        //             };
        //             temp.Answers = [];
        //             for(var j = 0; j < 4; j ++){
        //                 temp.Answers.push({
        //                     "iAnswerId":rows[i].iAnswerId,
        //                     "vAnswer":rows[i].vAnswer
        //                 });
        //                 i++;
        //             }
        //             examPaper.push(temp);
        //         }
        //
        //
        //
        //         console.log("Exam Paper");
        //         cli.blue(JSON.stringify(examPaper));
        //         // io.sockets.in(socket.id).emit('giveQuestion',{"data":examPaper,"iParticipantId":iParticipantId});
        //
        //         startGameData.examQuestion = examPaper;
        //         async.forEachOf(startGameData.examUser,function(value,key,cb){
        //             console.log(value);
        //             console.log(key);
        //             if(startGameData.examUser[key].isActive == true){
        //                 queries.insert_exam_participant({iScheduleId:startGameData.iScheduleId,iUserId:startGameData.examUser[key].iUserId},function (err,result) {
        //                     var iParticipantId = result.insertId;
        //                     cli.blue(iParticipantId);
        //                     startGameData.examUser[key].iParticipantId = iParticipantId;
        //                     cli.blue(JSON.stringify(startGameData));
        //                     cb();
        //                 });
        //             }
        //         },function(err){
        //             cli.blue("Callback call");
        //             console.log("call back call");
        //             cli.red(JSON.stringify(startGameData));
        //             io.sockets.in('Exam_Room').emit('startGame',{data:startGameData});
        //             // setTimeout(function(){
        //             //     console.log("setTimeout call");
        //             //     io.sockets.in('Exam_Room').emit('timeOver',{data:"Time Finish"});
        //             // },10000);
        //         });
        //
        //
        //     });
        // });


        socket.on('startGame',function(startGameData){
            console.log('startGame');
            cli.red(JSON.stringify(startGameData));
            var RoundOneQuestion = [];
            var RoundTwoQuestion = [];
            /**
             * Generate Round One Question
             */

            queries.get_mcq_by_Ids({"iQuestionId":startGameData.mcqQuestion},function(err,rowsOne) {
                console.log(rowsOne);
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
                startGameData.RoundOneQuestion = RoundOneQuestion;
                /**
                 * Generate Round Two Question
                 */
                queries.get_vsq_by_Ids({"iQuestionId":startGameData.vsqQuestion},function(ersr,rowsTwo) {
                    if(ersr) throw ersr;
                    var j = 0
                    console.log("Length");
                    cli.yellow(rowsTwo.length);
                    while(j< rowsTwo.length){
                        RoundTwoQuestion.push({
                            "iQuestionId": rowsTwo[j].iQuestionId,
                            "vQuestion": rowsTwo[j].vQuestion
                        });
                        j++;
                    }
                    startGameData.RoundTwoQuestion = RoundTwoQuestion;

                    async.forEachOf(startGameData.examUser,function(value,key,cb){
                        console.log(value);
                        console.log(key);
                        if(startGameData.examUser[key].isActive == true){
                            queries.insert_exam_participant({iScheduleId:startGameData.RoundOne.iScheduleId,iUserId:startGameData.examUser[key].iUserId},function (err,resultOne) {
                                var iRoundOneParticipantId = resultOne.insertId;
                                queries.insert_exam_participant({iScheduleId:startGameData.RoundTwo.iScheduleId,iUserId:startGameData.examUser[key].iUserId},function (err,resultOne) {
                                    var iRoundTwoParticipantId = resultOne.insertId;
                                    cli.blue(iRoundTwoParticipantId);
                                    startGameData.examUser[key].iParticipantId = { "iRoundOneParticipantId":iRoundOneParticipantId,"iRoundTwoParticipantId":iRoundTwoParticipantId };
                                    cli.blue(JSON.stringify(startGameData));
                                    cb();
                                });

                            });
                        }
                    },function(err){
                        cli.blue("Callback call");
                        console.log("call back call");
                        cli.red(JSON.stringify(startGameData));
                        io.sockets.in('Exam_Room').emit('startGame',{data:startGameData});
                        setTimeout(function(){
                            console.log("setTimeout call");
                            io.sockets.in('Exam_Room').emit('timeOverRoundOne',{data:"Time Finish"});
                        },212130);
                    });

                });

            });

        });

        socket.on('vRoundOneAns',function(data,fn){
            console.log("VAnswer is call from unity game");
            console.log(JSON.stringify(data));
            //body.iQuestionId,body.iAnswerId
            queries.check_round_one_question_answer({"iQuestionId":data.iQuestionId,"iAnswerId":data.iAnswerId},function(err,res1){
                var updatParticipant = {};
                var participantQuestions = {};

                if(res1[0].rowCount > 0){
                    participantQuestions = {
                        "iParticipantId":data.iParticipantId,
                        "iQuestionId":data.iQuestionId,
                        "iAnswerId":data.iAnswerId,
                        "vAnswer":'null',
                        "eCheck":"right",
                        "eStatus":"y"
                    };
                    updatParticipant = {
                        "iRightAnswers":1,
                        "iWrongAnswers":0,
                        "iParticipantId":data.iParticipantId
                    }
                    fn({"message":"You are rignt",'status':200,'eStatus':true});
                }else{
                    participantQuestions = {
                        "iParticipantId":data.iParticipantId,
                        "iQuestionId":data.iQuestionId,
                        "iAnswerId":data.iAnswerId,
                        "vAnswer":'null',
                        "eCheck":"wrong",
                        "eStatus":"y"
                    };
                    updatParticipant = {
                        "iRightAnswers":0,
                        "iWrongAnswers":1,
                        "iParticipantId":data.iParticipantId
                    };
                    fn({"message":"You are wrong",'status':200,'eStatus':false});
                }
                queries.insert_participant_questions(participantQuestions,function(err,res2){
                   if(err) throw err;
                });
                queries.update_exam_participant(updatParticipant,function(err,res3){
                    if(err) throw err;
                });
            });
            io.sockets.emit('vRoundOneAns',data);
        });

        socket.on('ChangeRoundOneQuestion',function(data){
            console.log(data);
            var temp = {};
            if(data.status == 'enable'){
                queries.get_mcq_by_Ids({"iQuestionId":data.iQuestion},function(err,rowsOne) {
                    console.log(rowsOne);
                    var i = 0;
                    while (i < rowsOne.length) {
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
                    }
                    console.log("Change Question");
                    cli.blue(JSON.stringify({data:temp,status:'enable'}));
                    io.sockets.in('Exam_Room').emit('ChangeRoundOneQuestion',{data:temp,status:'enable'});
                });
            }else{
                io.sockets.in('Exam_Room').emit('ChangeRoundOneQuestion',{status:'disable','iQuestionId':data.iQuestion});
            }
        });



        socket.on('vRoundTwoAns',function(data,fn){
            console.log('vRoundTwoAns');
            cli.blue('data');
            cli.blue(JSON.stringify(data));

            queries.check_round_two_question_answer({"iQuestionId":data.iQuestionId,"vAnswer":data.vAnswer},function(err,res1){

                if(res1[0].rowCount > 0){
                    participantQuestions = {
                        "iParticipantId":data.iParticipantId,
                        "iQuestionId":data.iQuestionId,
                        "iAnswerId":0,
                        "vAnswer":data.vAnswer,
                        "eCheck":"right",
                        "eStatus":"y"
                    };
                    updatParticipant = {
                        "iRightAnswers":1,
                        "iWrongAnswers":0,
                        "iParticipantId":data.iParticipantId
                    }
                    fn({"message":"You are rignt",'status':200,'eStatus':true});
                }else{
                    participantQuestions = {
                        "iParticipantId":data.iParticipantId,
                        "iQuestionId":data.iQuestionId,
                        "iAnswerId":0,
                        "vAnswer":data.vAnswer,
                        "eCheck":"wrong",
                        "eStatus":"y"
                    };
                    updatParticipant = {
                        "iRightAnswers":0,
                        "iWrongAnswers":1,
                        "iParticipantId":data.iParticipantId
                    };
                    fn({"message":"You are wrong",'status':200,'eStatus':false});
                }
                queries.insert_participant_questions(participantQuestions,function(err,res2){
                    if(err) throw err;
                });
                queries.update_exam_participant(updatParticipant,function(err,res3){
                    if(err) throw err;
                });

            });
            io.sockets.emit('vRoundTwoAns',data);
        });

        //Disconnected Logic
        socket.on('disconnect',function (data){
            cli.red("disconnect "+socket.id);
            cli.red(getIndexUser(socket.id));
            if(getIndexUser(socket.id) != null){
                cli.blue("not null");
                if(user.length > 0){
                    user.splice(getIndexUser(socket.id),1);
                    // examUser.splice(getIndexUser(socket.id),1)
                }
                //list of user send to angular application
                io.sockets.emit('listUser',{data:user});
            }else{
                console.log("Admin Disconnected");
                io.sockets.emit("AdminDisconnected",{"status":404,"message":"Admin not found"});
            }
            cli.green(JSON.stringify(user));
            cli.blue(JSON.stringify(examUser));
        });


    });
};

function getIndexUser(socketId){
    cli.blue("user lenght"+user.length);
    for(var i=0; i<user.length;i++){
        cli.blue("user deleted");
        cli.blue(i);
        cli.blue(user[i].socket);
        if(user[i].socket === socketId){
            cli.red(i);
            return i;
        }
    }
}
