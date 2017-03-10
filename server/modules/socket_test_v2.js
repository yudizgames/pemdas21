/**
 * Created by YudizAshish on 07/03/17.
 */
var cli = require("../../config/config").console;
var queries = require("./queries");
var async = require("async");
var user = []; //List of OneLine User
var examUser = []; //List of Exam User
var teacher = [];
var RoundFinishUser = 0;
var roundOnetimeOut = null;
var roundTwotimeOut = null;
var Room = [];
var _ = require('lodash');
module.exports = function(app,io){

    io.on('connection', function(socket){
        io.sockets.emit('listUser',{data:user});
        /**
         * First User Join Game And Show on admin/client panels
         */
        socket.on('joinGame',function(data,fn){
            cli.blue('joinGame call');
            console.log(data);
            queries.getChildById({'iUserId':data.iUserId},function(err,rows){
                if(err) throw err;
                user.push({
                    'socket':socket.id,
                    'iUserId':rows[0].iUserId,
                    'vFullName':rows[0].vFullName,
                    'vUserName':rows[0].vUserName,
                    'vEmail':rows[0].vEmail,
                    "iParentId":rows[0].iParentId,
                    "iParentUserId":rows[0].iParentUserId,
                    'isActive':false,
                    'isSelectedByAdmin':false,
                    'isSelectedByClient':false
                });
                //list of user send to angular application
                cli.blue(JSON.stringify(user));
                io.sockets.emit('listUser',{data:user});
            });
            fn({"message":"You are in watting state",'status':200,'socket':socket.id});

        });

        /**
         * List of user selected by admin or client
         */
        socket.on('examUser',function(data,fn){ //Angularjs
            cli.red("examUser");
            cli.red("Exam User call");
            cli.blue(JSON.stringify(data));
            socket.join("Room_"+socket.id);
            Room["Room_"+socket.id] = {
                "socket":[],
                "totaluser":0,
                "RoundOneFinishUser":0,
                "RoundTwoFinishUser":0
            }
            console.log(Room["Room_"+socket.id]);
            fn({"message":"You are become a teacher",'status':200,'socket':socket.id,"Room":"Room_"+socket.id});
            cli.yellow("users in room "+socket.id);
            cli.yellow(JSON.stringify(io.sockets.adapter.rooms["Room_"+socket.id]));
            for(var i=0;i<data.data.length;i++){
                data.data[i].Room = "Room_"+socket.id;
                data.data[i].TeacherSocket = socket.id;
                data.data[i].vTeacherType = data.User.vUserType;
                data.data[i].TeacherUserId = data.User.iUserId;
                data.data[i].TeacherUserType = data.User.vUserType;
            }
            console.log(data.data);
            teacher.push({"iUserId":data.User.iUserId,"vUserType":data.User.vUserType,"socket":socket.id});
            io.sockets.emit('examUser',data); //Unity
        });


        /**
         * Ready For Exam By Unity User
         */
        socket.on('ReadyForExam',function(data,fn){ //Unity
            cli.red("ReadyForExam");
            socket.join(data.Room+"");
            Room[data.Room+""].socket.push(socket.id);
            Room[data.Room+""].totaluser += 1;
            cli.yellow("Total User On Room");
            console.log(Room[data.Room+""]);
            console.log(JSON.stringify(data));
            console.log(JSON.stringify(data.Room));
            cli.yellow(JSON.stringify(io.sockets.adapter.rooms[data.Room+""]));
            fn({"message":"Now You are in Exam room, Wait for some moment",'status':200,'socket':socket.id,'room':'Exam_Room'});
        });

        /**
         * Start User Call By Angular Admin or client
         */

        socket.on('startGame',function(startGameData){
            cli.yellow("console.log");
            console.log(JSON.stringify(startGameData));

            RoundFinishUser =  0;
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
                        cli.red(JSON.stringify(startGameData.Socket.Room));
                        cli.yellow("users in room "+socket.id);
                        cli.yellow(JSON.stringify(io.sockets.adapter.rooms["Room_"+socket.id]));
                        // io.sockets.emit('startGame',{data:startGameData});
                        io.sockets.in(startGameData.Socket.Room+"").emit('startGame',{data:startGameData});
                        roundOnetimeOut =  setTimeout(function(){
                            console.log("setTimeout call Round One");
                            io.sockets.in(startGameData.Socket.Room+"").emit('timeOverRoundOne',{data:"Time Finish",status:200});
                        },212130);
                    });

                });

            });

        });

        /**
         * Round One Ans Send By Unity
         */

        socket.on('vRoundOneAns',function(data,fn){
            console.log("VAnswer is call from unity game");
            console.log(JSON.stringify(data));

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
            cli.yellow("this is data asdfasfasdfasdf")
            cli.yellow(data);
            io.sockets.emit('vRoundOneAns',data);
        });


        /**
         * Change Round One Question By Admin
         */

        socket.on('ChangeRoundOneQuestion',function(data){
            cli.yellow("Round One Question");
            console.log(JSON.stringify(data.Room));
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
                    cli.blue(JSON.stringify({data:temp,status:true}));
                    io.sockets.in(data.Room+"").emit('ChangeRoundOneQuestion',{data:temp,status:true});
                });
            }else{
                io.sockets.in(data.Room+"").emit('ChangeRoundOneQuestion',{status:false,'iQuestionId':data.iQuestion});
            }
        });

        /**
         * If Round One Question Finish unity attemp emit
         */

        socket.on('RoundOneFinish',function(data,fn){
            console.log("RoundOne Finish Call");
            cli.yellow(JSON.stringify(data));
            cli.yellow(JSON.stringify(Room[data.Room+""]));
            console.log(socket.id);
            console.log(_.indexOf(Room[data.Room+""].socket,socket.id));
            if(_.indexOf(Room[data.Room+""].socket,socket.id) >= 0){
                console.log("match");
                cli.blue(JSON.stringify(Room[data.Room+""]));
                Room[data.Room+""].RoundOneFinishUser += 1;
                cli.red(JSON.stringify(Room[data.Room+""]));
                cli.blue(Room[data.Room+""].RoundOneFinishUser == Room[data.Room+""].totaluser);
                if(Room[data.Room+""].RoundOneFinishUser == Room[data.Room+""].totaluser){
                    cli.red("**********************************************************");
                    cli.red("Clear Time Out Call");
                    cli.red("**********************************************************");
                    clearTimeout(roundOnetimeOut);
                    io.sockets.in(data.Room+"").emit('RoundOneFinish',{status:200,message:'All User Finish its exam'});
                }
            }else{
                console.log("not match");
            }
            fn({"message":"You are on watting stage for round two",'status':200});
        });

        /**
         * Round Two Start
         */

        socket.on('RoundTwoStart',function(data){
            cli.blue(JSON.stringify(data));
            console.log(JSON.stringify(data));
                io.sockets.in(data.Room+"").emit('RoundTwoStart',{status:200,message:'Rount Two Start'});
            roundTwotimeOut = setTimeout(function(){
                console.log("setTimeout call");
                io.sockets.in(data.Room+"").emit('timeOverRoundTwo',{data:"Time Finish for Round Two"});
            },191000);
        });


        /**
         * Round Two Ans Send By Unity
         */

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
                    io.sockets.emit('vRoundTwoAns',data);
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
                    fn({"message":"You are wrong","status":200,"eStatus":false});
                    io.sockets.emit('vRoundTwoAns',data);
                }
                queries.insert_participant_questions(participantQuestions,function(err,res2){
                    if(err) throw err;
                });
                queries.update_exam_participant(updatParticipant,function(err,res3){
                    if(err) throw err;
                });

            });

        });


        /**
         * Change Round Two Question By Admin
         */

        socket.on('ChangeRoundTwoQuestion',function(data){
            cli.blue(data.status);
            console.log(data);
            var temp = {};
            if(data.status == true){
                queries.get_vsq_by_Ids({"iQuestionId":data.iQuestion},function(err,rowsOne) {
                    console.log(rowsOne);
                    temp = {
                        "iQuestionId": rowsOne[0].iQuestionId,
                        "vQuestion": rowsOne[0].vQuestion
                    };
                    console.log("Change Question");
                    cli.blue(JSON.stringify({data:temp,status:true}));
                    io.sockets.in(data.Room+"").emit('ChangeRoundTwoQuestion',{data:temp,status:true});
                });
            }else{
                console.log('disable');
                io.sockets.in(data.Room+"").emit('ChangeRoundTwoQuestion',{status:false,'iQuestionId':data.iQuestion});
            }
        });

        /**
         * If Round Two Question Finish unity attemp emit
         */

        socket.on('RoundTwoFinish',function(data,fn){
            console.log("RoundTwo Finish Call");
            cli.yellow(JSON.stringify(data));
            cli.yellow(JSON.stringify(Room[data.Room+""]));
            console.log(socket.id);
            console.log(_.indexOf(Room[data.Room+""].socket,socket.id));
            if(_.indexOf(Room[data.Room+""].socket,socket.id) >= 0){
                Room[data.Room+""].RoundTwoFinishUser += 1;
                if(Room[data.Room+""].RoundTwoFinishUser == Room[data.Room+""].totaluser){
                    cli.red("**********************************************************");
                    cli.red("Clear Time Out Call");
                    cli.red("**********************************************************");
                    clearTimeout(roundTwotimeOut);
                    io.sockets.in(data.Room+"").emit('RoundTwoFinish',{status:200,message:'All User Finish its exam'});
                }
            }else{
                console.log("not match");
            }
            fn({"message":"Finish Exam",'status':200});
        });

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
                // console.log("Admin Disconnected");
                // io.sockets.emit("AdminDisconnected",{"status":404,"message":"Admin not found"});
            }
            cli.green(JSON.stringify(user));
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
