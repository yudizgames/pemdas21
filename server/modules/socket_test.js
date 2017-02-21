var cli = require("../../config/config").console;
var queries = require("./queries");
var roomno = 0;
var user = [];
var examUser = [];
var socketArray = [];
var updateUser = false;
var exam = [];
var startExam = false;
module.exports = function(app,io){
    io.on('connection', function(socket){

        socket.emit('test',{test:'test'});
        socket.on('joinGame',function(data,fn){ //Unity Give SocketId on function respose
            console.log("joinGame call");
            console.log(data);
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

       socket.on('examUser',function(data){ // AngularJs List of Active Socket User
            examUser = [];
            cli.blue('exam user list');
            cli.blue(data);
            cli.green(JSON.stringify(data));
            io.sockets.emit('examUser',{data:data.data}); //Unity Send List of user list to check is selected for exam or not
       });

       socket.on('iAmActive',function(data){ //Unity Active for exam and create room for it.
            socket.join('Exam_Room');
            cli.blue("Exam_Room users");
            queries.getUserById({'id':data.iUserId},function(err,rows){
                if(err) throw err;
                if(!inArray(examUser,socket.id)){
                           examUser.push({    //Push that user details in examUSer
                           'socket':socket.id,
                           'iUserId':rows[0].iUserId,
                           'vFullName':rows[0].vFullName,
                           'vUserName':rows[0].vUserName,
                           'vEmail':rows[0].vEmail,
                           'isActive':true
                        });
                }
                cli.blue(JSON.stringify(io.nsps['/'].adapter.rooms["Exam_Room"]));
                cli.blue(JSON.stringify(examUser));
                //list of user send to angular application
                // io.sockets.emit('listUser',{data:user});
            });
            
            
        });


        socket.on('exam',function(examdata){  //Angularjs Send Exam to Server
            cli.blue("Exam Question Send from Angular");
            cli.blue(JSON.stringify(examdata));
            exam = examdata;             //Store Data to exam variable
            cli.blue("examQuestion");
            cli.red(exam);
            queries.insert_exam({vTitle:exam.vTitle,vDescription:exam.vDescription},function(err,rows){
                var iExamId  = rows.insertId;
                queries.insert_exam_schedule({"iExamId":iExamId},function(err,result){
                        var iScheduleId = result.insertId;
                    cli.blue(JSON.stringify(io.nsps['/'].adapter.rooms["Exam_Room"]));
                    io.sockets.in('Exam_Room').emit('exam',{status:200,message:'ready to exam',data:{"iExamId":iExamId,"iScheduleId":iScheduleId}});  //Unity to start exam flag
                })
            });

        });

        socket.on('askQuestion',function(askQuestion){  //Unity ask question
            cli.red('askQuestion call');
            console.log(askQuestion);
            console.log(exam);
            console.log(examUser);
            queries.insert_exam_participant({iScheduleId:askQuestion.iScheduleId,iUserId:askQuestion.iUserId},function (err,result) {
                var iParticipantId = result.insertId;
                queries.get_mcq_by_Ids({"iQuestionId":exam.Questions},function(err,rows){
                        cli.red("Question List");
                        console.log(rows);
                        var tempIQuestionId = 0;
                        var i = 0;
                        var examPaper = [];
                        while(i < rows.length){
                            var temp = {};
                            temp.Question = {
                                "iQuestionId":rows[i].iQuestionId,
                                "vQuestion":rows[i].vQuestion
                            };
                            temp.Answers = [];
                            for(var j = 0; j < 4; j ++){
                                temp.Answers.push({
                                   "iAnswerId":rows[i].iAnswerId,
                                    "vAnswer":rows[i].vAnswer
                                });
                                i++;
                            }
                            examPaper.push(temp);
                        }
                        console.log("Exam Paper");
                        cli.blue(JSON.stringify(examPaper));
                        io.sockets.in(socket.id).emit('giveQuestion',{"data":examPaper,"iParticipantId":iParticipantId});
                    });
            });
        });





        socket.on('disconnect',function (data){
            cli.red("disconnect "+socket.id);
            cli.red(getIndexUser(socket.id));
            if(getIndexUser(socket.id) != null){
                cli.blue("not null");
                user.splice(getIndexUser(socket.id),1);
                examUser.splice(getIndexUser(socket.id),1)
                //list of user send to angular application
                io.sockets.emit('listUser',{data:user});
            }
            cli.green(JSON.stringify(user));
            cli.blue(JSON.stringify(examUser));
        });










    });
}

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


function inArray(array,socket){
    for(var i = 0;i<array.length;i++){
        return(array[i].socket === socket)
    }
    return false;
}

function getIndexOfExamUser(iUserId,socket){
    for(var i= 0; i<exam.length;i++ ){
        if(exam[i].socket == socket && exam[i].iUserId == iUserId){
            return i;
        }
    }
}