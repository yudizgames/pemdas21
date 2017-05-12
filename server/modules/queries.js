var db = require("./connection");
var cli = require("../../config/config").console;
var md5 = require("md5");
var dateFormat = require("dateformat"); //dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss"); Currnet date time
/**
 * if in comment @ means user only web
 * if in comment * means user only game
 * if in comment @* or *@ means user both game and web
 */

var Users = {
    //   *@   //
    getUser:function(body,callback){
        db.query("SELECT *  FROM `tbl_users` WHERE `vEmail` = ? AND `vPassword` = ? AND `eStatus` = 'y'",[body.vEmail,md5(body.vPassword)],callback);
    },
    getUserAdmin:function(body,callback){
        console.log("Api call");
        db.query("SELECT *  FROM `tbl_users` WHERE `vEmail` = ? AND `vPassword` = ? AND `eStatus` != 'd'",[body.vEmail,md5(body.vPassword)],callback);
    },
    setTocket:function(body,callback){
        console.log("setTocken call");
        return db.query("INSERT INTO tbl_user_devices (iUserId,vAuthToken,eDeviceType) VALUES (?,?,?)",[body.iUserId, body.token, body.eDeviceType], callback);
    },
    authenticate: function(body, cb){
        console.log("authentications call");
        db.query("SELECT u.iUserId,d.iDeviceId,u.vUserType FROM tbl_users as u INNER JOIN tbl_user_devices as d ON (d.iUserId = u.iUserId) WHERE d.vAuthToken = ? AND u.eStatus = ? AND d.eDeviceType = ? AND u.vUserType = ?",[body.token,'y',body.device,body.vUserType],cb);
    },
    //   *@   //
    logOut:function (body,cb) {
        console.log("Loug Out Call");
        db.query("DELETE FROM tbl_user_devices WHERE iDeviceId = ?",[body.iDeviceId],cb);
    },
    checkPassword:function(body,cb){

        db.query("SELECt * FROM tbl_users where iUserId = ? AND vPassword = ?",[body.iUserId,md5(body.vOldPassword)],cb);
    },
    changePassword:function(body,cb){
        console.log("Change PAssword call");
        console.log(body);
        db.query("UPDATE tbl_users SET vPassword = ? WHERE iUserId = ?",[md5(body.vNewPassword),body.iUserId],cb);
    },
    checkEmail:function(body,cb){
        db.query("SELECT * FROM tbl_users WHERE vEmail = ?",[body.vEmail],cb);
    },
    forgotPass:function(body,cb){
        db.query("UPDATE tbl_users SET vPassword = ? WHERE vEmail = ?",[md5(body.vNewPassword),body.vEmail],cb);
    },
    getAllUser:function(body,callback){
        db.query('SELECT * FROM tbl_users WHERE eStatus != "d" AND vUserType = "user"',callback);
    },
    getSettings: function(body,cb){
        db.query("SELECT * FROM mst_site_settings WHERE eEditable = ? ORDER BY iFieldId",['y'], cb);
    },
    saveSettings : function(params, cb){
        db.query("UPDATE mst_site_settings SET vValue = ? WHERE iFieldId = ?", params, cb);
    },
    ls_user_count: function(body, cb){

        if(body.vUserType == 'super_admin'){

            var kWhere = "";
            var vWhere = ['user','d'];
            if(typeof body.vUserName != 'undefined' && body.vUserName != "")
            {
                kWhere += ' AND tbl_users.vUserName LIKE ?';
                vWhere.push('%'+body.vUserName+'%');
            }
            if(typeof body.vEmail != "undefined" && body.vEmail != "")
            {
                kWhere += ' AND tbl_users.vEmail LIKE ?';
                vWhere.push('%'+body.vEmail+'%');
            }
            db.query("SELECT COUNT(*) as iTotalRecords " +
                " FROM tbl_users " +
                " WHERE tbl_users.vUserType = ? AND tbl_users.eStatus != ?"+kWhere,vWhere,cb);


        }else{

            var kWhere = "";
            var vWhere = ['user','d',body.iUserId];
            if(typeof body.vUserName != 'undefined' && body.vUserName != "")
            {
                kWhere += ' AND tbl_users.vUserName LIKE ?';
                vWhere.push('%'+body.vUserName+'%');
            }
            if(typeof body.vEmail != "undefined" && body.vEmail != "")
            {
                kWhere += ' AND tbl_users.vEmail LIKE ?';
                vWhere.push('%'+body.vEmail+'%');
            }
            db.query("SELECT COUNT(*) as iTotalRecords " +
                " FROM tbl_users " +
                " JOIN tbl_child ON tbl_users.iUserId = tbl_child.iUserId " +
                " JOIn tbl_parent ON tbl_child.iParentId = tbl_parent.iParentId" +
                " WHERE tbl_users.vUserType = ? AND tbl_users.eStatus != ?  AND tbl_parent.iUserId = ?"+kWhere,vWhere,cb);

        }


    },
    ls_user_select: function(body, cb){
        cli.blue(JSON.stringify(body));
        if(body.vUserType == 'super_admin'){


            var sWhere = "";
            var aWhere = ['user','d',body.iParentId];
            var sort = "";
            /**
             * Column Search Depending on Table
             */
            if(typeof body.vUserName != 'undefined' && body.vUserName != "")
            {
                sWhere += ' AND vUserName LIKE ?';
                aWhere.push('%'+body.vUserName+'%');
            }
            if(typeof body.vEmail != "undefined" && body.vEmail != "")
            {
                sWhere += ' AND vEmail LIKE ?';
                aWhere.push('%'+body.vEmail+'%');
            }
            if(typeof body.sort != 'undefined' && body.sort != "") {sort = body.sort};
            cli.blue(JSON.stringify(body));
            db.query("SELECT " +
                " iUserId, " +
                " vFullName, " +
                " vUserName, " +
                " vEmail, " +
                " eStatus, " +
                " vUserType " +
                " FROM tbl_users  " +
                " WHERE vUserType = ? AND eStatus != ? "+sWhere+" ORDER BY "+sort+" LIMIT "+body.offset+", "+body.limit,aWhere,cb);

        }else{

            var sWhere = "";
            var aWhere = ['user','d',body.iParentId];
            var sort = "";
            /**
             * Column Search Depending on Table
             */
            if(typeof body.vUserName != 'undefined' && body.vUserName != "")
            {
                sWhere += ' AND vUserName LIKE ?';
                aWhere.push('%'+body.vUserName+'%');
            }
            if(typeof body.vEmail != "undefined" && body.vEmail != "")
            {
                sWhere += ' AND vEmail LIKE ?';
                aWhere.push('%'+body.vEmail+'%');
            }
            if(typeof body.sort != 'undefined' && body.sort != "") {sort = body.sort};
            cli.blue(JSON.stringify(body));
            db.query("SELECT " +
                " tbl_users.iUserId, " +
                " tbl_users.vFullName, " +
                " tbl_users.vUserName, " +
                " tbl_users.vEmail, " +
                " tbl_users.eStatus, " +
                " tbl_users.vUserType " +
                " FROM tbl_users  " +
                " JOIN tbl_child ON tbl_users.iUserId = tbl_child.iUserId " +
                " JOIN tbl_parent ON tbl_child.iParentId = tbl_parent.iParentId " +
                " WHERE tbl_users.vUserType = ? AND tbl_users.eStatus != ? AND tbl_parent.iUserId = ? "+sWhere+" ORDER BY "+sort+" LIMIT "+body.offset+", "+body.limit,aWhere,cb);

        }


    },
    //   *@   //
    getUserById:function(body,cb){
      db.query("SELECT * FROM tbl_users  WHERE tbl_users.iUserId = ? AND tbl_users.eStatus != 'd'",[body.id],cb);
    },
    getUserFroById:function(body,cb){
        db.query("SELECT * FROM tbl_users JOIN tbl_parent ON tbl_users.iUserId = tbl_parent.iUserId WHERE tbl_users.iUserId = ? AND tbl_users.eStatus != 'd'",[body.id],cb);
    },
    getUserFroByIdForClient:function(body,cb){
        db.query("SELECT * FROM tbl_users WHERE tbl_users.iUserId = ? AND tbl_users.eStatus != 'd'",[body.id],cb);
    },
    deleteUserById:function(body,cb){
        db.query("DELETE FROM tbl_users WHERE iUserId = ?",[body.id],cb);
    },
    changeUserStatusById:function(body,cb){
        console.log("User Status");
        cli.blue(JSON.stringify(body));
        db.query("UPDATE tbl_users SET eStatus = ? WHERE iUserId = ?",[body.eStatus,body.id],cb);
    },
    updateTbl_parent:function(body,cb){
        db.query("UPDATE tbl_parent SET vParentType = ? WHERE iUserId = ? ",[body.vParentType,body.id],cb);
    },
    updateUserById:function(body,cb){
        db.query("UPDATE tbl_users SET vFullName = ? , vUserName = ?, dLastActivity = ? WHERE iUserId = ? ",[body.vFullName,body.vFullName,dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss"),body.id],cb);
    },
    addUser:function (body,cb) {
        db.query("INSERT INTO tbl_users (vUserType,vFullName,vUserName,vEmail,vPassword,eStatus,dLastActivity,dCreatedDate) VALUES (?,?,?,?,?,?,?,?)",[body.vUserType,body.vFullName,body.vUserName,body.vEmail,md5(body.vPassword),'y',dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss"),dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss")],cb);
    },
    //QUESTION MODULE START
    listQuestion:function(body,cb){
        db.query("SELECT tbl_questions.*,tbl_answers.vAnswer FROM tbl_questions JOIN tbl_answers ON tbl_answers.iAnswerId = tbl_questions.iAnswerId WHERE tbl_questions.eStatus != 'd'",cb);
    },
    ls_question_count:function(body,cb){
        // var sWhere = "";
        // var aWhere = [];
        // if(typeof body.eType != 'undefined' && body.eType != "")
        // {
        //     sWhere += ' AND eType LIKE ?';
        //     aWhere.push('%'+body.eType+'%');
        // }
        // if(typeof body.vModeName != "undefined" && body.vModeName != "")
        // {
        //     sWhere += ' OR vModeName LIKE ?';
        //     aWhere.push('%'+body.vModeName+'%');
        // }
        cli.yellow(body.eType);
        cli.yellow(body.eTypeQuestion);
        var Where = "";

        for(var i = 0; i < body.eType.length ; i++){
            if(i == 0){
                Where += " AND eType IN  ('"+body.eType[i]+"'";
            }
            if( i != 0){
                Where += ",'"+body.eType[i]+"'";
            }
            if( i == body.eType.length -1){
                Where += ") "
            }
        }
         cli.yellow(Where);

        for(var j = 0; j < body.eTypeQuestion.length ; j++){
            if(j == 0){
                Where += " AND eTypeQuestion IN  ('"+body.eTypeQuestion[j]+"'";
            }
            if( j != 0){
                Where += ",'"+body.eTypeQuestion[j]+"'";
            }
            if( j == body.eTypeQuestion.length -1){
                Where += ") "
            }
        }
        // if(body.vMultiplication > 0){
        //     Where += " AND vMultiplication LIKE '%"+body.vMultiplication+"'";
        // }

        for(var j = 0; j < body.vMultiplication.length ; j++){
            if(j == 0){
                Where += " AND vMultiplication IN  ('"+body.vMultiplication[j]+"'";
            }
            if( j != 0){
                Where += ",'"+body.vMultiplication[j]+"'";
            }

            if( j == body.vMultiplication.length -1){
                Where += ") ";
            }
        }
        cli.red("SELECT COUNT(*) as iTotalRecords FROM tbl_questions JOIN tbl_answers ON tbl_answers.iAnswerId = tbl_questions.iAnswerId WHERE tbl_questions.eStatus != 'd'"+Where);
        db.query("SELECT COUNT(*) as iTotalRecords FROM tbl_questions JOIN tbl_answers ON tbl_answers.iAnswerId = tbl_questions.iAnswerId WHERE tbl_questions.eStatus != 'd'"+Where,cb);
    },
    ls_question_select:function(body,cb){
        // var sWhere = "";
        // var aWhere = [];
        var sort = "";

        // if(typeof body.eType != 'undefined' && body.eType != "")
        // {
        //     sWhere += ' AND eType LIKE ?';
        //     aWhere.push('%'+body.eType+'%');
        // }
        // if(typeof body.vModeName != "undefined" && body.vModeName != "")
        // {
        //     sWhere += ' OR vModeName LIKE ?';
        //     aWhere.push('%'+body.vModeName+'%');
        // }

        var Where = "";

        for(var i = 0; i < body.eType.length ; i++){
            if(i == 0){
                Where += " AND eType IN  ('"+body.eType[i]+"'";
            }
            if( i != 0){
                Where += ",'"+body.eType[i]+"'";
            }
            if( i == body.eType.length -1){
                Where += ") "
            }
        }


        for(var j = 0; j < body.eTypeQuestion.length ; j++){
            if(j == 0){
                Where += " AND eTypeQuestion IN  ('"+body.eTypeQuestion[j]+"'";
            }
            if( j != 0){
                Where += ",'"+body.eTypeQuestion[j]+"'";
            }
            if( j == body.eTypeQuestion.length -1){
                Where += ") "
            }
        }
        if(typeof body.sort != 'undefined' && body.sort != "") {
            sort = body.sort
        }else{ sort = "iQuestionId DESC" };
        cli.red("Order for question");
        cli.red(sort);

        for(var j = 0; j < body.vMultiplication.length ; j++){
            if(j == 0){
                Where += " AND vMultiplication IN  ('"+body.vMultiplication[j]+"'";
            }
            if( j != 0){
                Where += ",'"+body.vMultiplication[j]+"'";
            }

            if( j == body.vMultiplication.length -1){
                Where += ") ";
            }
        }
        db.query("SELECT tbl_questions.*,tbl_answers.vAnswer FROM tbl_questions JOIN tbl_answers ON tbl_answers.iAnswerId = tbl_questions.iAnswerId WHERE tbl_questions.eStatus != 'd' "+Where+" ORDER BY "+sort+" LIMIT "+body.offset +" ,"+body.limit,cb);
    },
    viewQuestion:function(body,cb){
        db.query("SELECT tbl_answers.iAnswerId,tbl_questions.vModeName,tbl_questions.vMultiplication,tbl_questions.eTypeQuestion,tbl_questions.eType,tbl_questions.vQuestion,tbl_questions.dUpdatedDate,tbl_answers.vAnswer,tbl_questions.eStatus,IF(tbl_questions.iAnswerId = tbl_answers.iAnswerId,'y','n') as vRightAns FROM tbl_questions JOIN tbl_answers ON tbl_answers.iQuestionId = tbl_questions.iQuestionId WHERE tbl_questions.eStatus != 'd' AND tbl_questions.iQuestionId = ?  ORDER BY vRightAns DESC",body.iQuestionId,cb);
    },
    statusQuestion:function(body,cb){
        db.query("UPDATE tbl_questions SET eStatus = ? WHERE iQuestionId = ?",[body.eStatus,body.iQuestionId],cb);
    },
    deleteQuestion:function(body,cb){
        db.query("DELETE FROM tbl_answers WHERE iQuestionId = ?",[body.iQuestionId]);
        db.query("DELETE FROM tbl_questions WHERE iQuestionId = ?",[body.iQuestionId],cb);
    },
    updateAnswer:function(body,cb){
        db.query("UPDATE tbl_answers SET vAnswer = ? ,dUpdatedDate = ?  WHERE iAnswerId= ?",[body.vAnswer,dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss"),body.iAnswerId],cb);
    },
    updateQuestion:function(body,cb){
        cli.blue(body.vMultiplication);
        db.query("UPDATE tbl_questions SET eTypeQuestion = ?, vModeName = ? ,eType = ? ,vQuestion = ?, iAnswerId = ?, dUpdatedDate = ?, vMultiplication= ? WHERE iQuestionId = ?",[body.eTypeQuestion,body.vModeName,body.eType,body.vQuestion,body.iAnswerId,dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss"),body.vMultiplication,body.iQuestionId],cb);
    },
    insertQuestion:function(body,cb){
        db.query("INSERT INTO tbl_questions (vModeName,eType,eTypeQuestion,vQuestion,iAnswerId,eStatus,vMultiplication) VALUES (?,?,?,?,?,?,?)",[body.vModeName,body.eType,body.eTypeQuestion,body.vQuestion,'0','n',body.vMultiplication],cb);
    },
    insertAnswer:function(body,cb){
        db.query("INSERT INTO tbl_answers (iQuestionId,vAnswer) VALUES (?,?)",[body.iQuestionId,body.vAnswer],cb);
    },
    updateAfterInsertQuestion(body,cb){
        db.query("UPDATE tbl_questions SET iAnswerId = ? , eStatus = ? WHERE iQuestionId= ?",[body.iAnswerId,'y',body.iQuestionId],cb);
    },
    //QUESTION MODULE END

    //EXAM MODULE MCQ START
    ls_mcq_count:function(body,cb){
        var Where = "";
        cli.yellow(Where);

        for(var j = 0; j < body.eTypeQuestion.length ; j++){
            if(j == 0){
                Where += " AND eTypeQuestion IN  ('"+body.eTypeQuestion[j]+"'";
            }
            if( j != 0){
                Where += ",'"+body.eTypeQuestion[j]+"'";
            }

            if( j == body.eTypeQuestion.length -1){
                Where += ")";
            }
        }
        for(var j = 0; j < body.vMultiplication.length ; j++){
                if(j == 0){
                    Where += " AND vMultiplication IN  ('"+body.vMultiplication[j]+"'";
                }
                if( j != 0){
                    Where += ",'"+body.vMultiplication[j]+"'";
                }

                if( j == body.vMultiplication.length -1){
                    Where += ")";
                }
        }


        db.query("SELECT COUNT(*) as iTotalRecords FROM tbl_questions JOIN tbl_answers ON tbl_answers.iAnswerId = tbl_questions.iAnswerId WHERE tbl_questions.eStatus = 'y' AND tbl_questions.eType = 'MCQ'"+Where,cb);
    },
    ls_mcq_select:function(body,cb){
        // var sWhere = "";
        // var aWhere = [];
        var sort = "";
        //
        // if(typeof body.eType != 'undefined' && body.eType != "")
        // {
        //     sWhere += ' AND eType LIKE ?';
        //     aWhere.push('%'+body.eType+'%');
        // }
        // if(typeof body.vModeName != "undefined" && body.vModeName != "")
        // {
        //     sWhere += ' OR vModeName LIKE ?';
        //     aWhere.push('%'+body.vModeName+'%');
        // }

        var Where = "";
        cli.yellow(Where);
        for(var j = 0; j < body.eTypeQuestion.length ; j++){
            if(j == 0){
                Where += " AND eTypeQuestion IN  ('"+body.eTypeQuestion[j]+"'";
            }
            if( j != 0){
                Where += ",'"+body.eTypeQuestion[j]+"'";
            }
            if( j == body.eTypeQuestion.length -1){
                Where += ")";
            }
        }

        for(var j = 0; j < body.vMultiplication.length ; j++){
            if(j == 0){
                Where += " AND vMultiplication IN  ('"+body.vMultiplication[j]+"'";
            }
            if( j != 0){
                Where += ",'"+body.vMultiplication[j]+"'";
            }

            if( j == body.vMultiplication.length -1){
                Where += ")";
            }
        }

        if(typeof body.sort != 'undefined' && body.sort != "") {sort = body.sort};
        cli.red("SELECT tbl_questions.*,tbl_answers.vAnswer, 'n' as eSelected FROM tbl_questions JOIN tbl_answers ON tbl_answers.iAnswerId = tbl_questions.iAnswerId WHERE tbl_questions.eStatus = 'y' AND tbl_questions.eType = 'MCQ'"+Where+" ORDER BY "+sort+" LIMIT "+body.offset +" ,"+body.limit);
        db.query("SELECT tbl_questions.*,tbl_answers.vAnswer, 'n' as eSelected FROM tbl_questions JOIN tbl_answers ON tbl_answers.iAnswerId = tbl_questions.iAnswerId WHERE tbl_questions.eStatus = 'y' AND tbl_questions.eType = 'MCQ'"+Where+" ORDER BY "+sort+" LIMIT "+body.offset +" ,"+body.limit,cb);
    },
    //EXAM MODULE VSQ START
    ls_vsq_count:function(body,cb){
        // var sWhere = "";
        // var aWhere = [];
        // if(typeof body.eType != 'undefined' && body.eType != "")
        // {
        //     sWhere += ' AND eType LIKE ?';
        //     aWhere.push('%'+body.eType+'%');
        // }
        // if(typeof body.vModeName != "undefined" && body.vModeName != "")
        // {
        //     sWhere += ' OR vModeName LIKE ?';
        //     aWhere.push('%'+body.vModeName+'%');
        // }

        var Where = "";
        cli.yellow(Where);
        for(var j = 0; j < body.eTypeQuestion.length ; j++){
            if(j == 0){
                Where += " AND eTypeQuestion IN  ('"+body.eTypeQuestion[j]+"'";
            }
            if( j != 0){
                Where += ",'"+body.eTypeQuestion[j]+"'";
            }
            if( j == body.eTypeQuestion.length -1){
                Where += ")";;
            }
        }
        for(var j = 0; j < body.vMultiplication.length ; j++){
            if(j == 0){
                Where += " AND vMultiplication IN  ('"+body.vMultiplication[j]+"'";
            }
            if( j != 0){
                Where += ",'"+body.vMultiplication[j]+"'";
            }

            if( j == body.vMultiplication.length -1){
                Where += ")";;
            }
        }
        db.query("SELECT COUNT(*) as iTotalRecords FROM tbl_questions JOIN tbl_answers ON tbl_answers.iAnswerId = tbl_questions.iAnswerId WHERE tbl_questions.eStatus = 'y' AND tbl_questions.eType = 'VSQ'"+Where,cb);
    },
    ls_vsq_select:function(body,cb){
        // var sWhere = "";
        // var aWhere = [];
        var sort = "";
        // if(typeof body.eType != 'undefined' && body.eType != "")
        // {
        //     sWhere += ' AND eType LIKE ?';
        //     aWhere.push('%'+body.eType+'%');
        // }
        // if(typeof body.vModeName != "undefined" && body.vModeName != "")
        // {
        //     sWhere += ' OR vModeName LIKE ?';
        //     aWhere.push('%'+body.vModeName+'%');
        // }
        var Where = "";
        cli.yellow(Where);
        for(var j = 0; j < body.eTypeQuestion.length ; j++){
            if(j == 0){
                Where += " AND eTypeQuestion IN  ('"+body.eTypeQuestion[j]+"'";
            }
            if( j != 0){
                Where += ",'"+body.eTypeQuestion[j]+"'";
            }
            if( j == body.eTypeQuestion.length -1){
                Where += ")";
            }
        }
        if(typeof body.sort != 'undefined' && body.sort != "") {sort = body.sort};
        for(var j = 0; j < body.vMultiplication.length ; j++){
            if(j == 0){
                Where += " AND vMultiplication IN  ('"+body.vMultiplication[j]+"'";
            }
            if( j != 0){
                Where += ",'"+body.vMultiplication[j]+"'";
            }

            if( j == body.vMultiplication.length -1){
                Where += ")";
            }
        }
        db.query("SELECT tbl_questions.*,tbl_answers.vAnswer, 'n' as eSelected FROM tbl_questions JOIN tbl_answers ON tbl_answers.iAnswerId = tbl_questions.iAnswerId WHERE tbl_questions.eStatus = 'y' AND tbl_questions.eType = 'VSQ'"+Where+" ORDER BY "+sort+" LIMIT "+body.offset +" ,"+body.limit,cb);
    },
    get_mcq_by_Ids:function(body,cb){
        db.query("SELECT tbl_questions.iQuestionId,tbl_questions.eTypeQuestion,tbl_questions.iAnswerId as Ans,tbl_questions.vQuestion, tbl_answers.vAnswer, tbl_answers.iAnswerId FROM tbl_answers JOIN tbl_questions ON tbl_answers.iQuestionId = tbl_questions.iQuestionId WHERE tbl_questions.iQuestionId IN (?)",[body.iQuestionId],cb)
    },
    get_vsq_by_Ids:function(body,cb){
        db.query("SELECT tbl_questions.iQuestionId,tbl_questions.eTypeQuestion,tbl_questions.vQuestion,tbl_answers.vAnswer as Ans FROM tbl_questions JOIN tbl_answers ON tbl_questions.iQuestionId = tbl_answers.iQuestionId WHERE tbl_questions.iQuestionId IN (?)",[body.iQuestionId],cb)
    },
    insert_exam:function(body,cb){
        db.query("INSERT INTO tbl_exams (iUserId,vTitle,vDescription,eExamType,eExamSubType,eStatus,dCreatedDate,iParentId) VALUES (?,?,?,?,?,?,?,?)",
            [body.iUserId,body.vTitle,body.vDescription,body.eExamType,body.eExamSubType,"y",dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss"),body.iParentId],cb);
    },
    insert_exam_schedule:function(body,cb){
        db.query("INSERT INTO tbl_exam_schedule (iExamId,dExamDate,iWinnerId,dCreatedDate) VALUES (?,?,?,?)",[body.iExamId,dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss"),0,dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss")],cb);
    },
    insert_exam_participant:function(body,cb){
        db.query("INSERT INTO tbl_exam_participant (iScheduleId,iUserId,dCreatedDate,iParentParticipentId) VALUES (?,?,?,?) ",[body.iScheduleId,body.iUserId,dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss"),body.iParentParticipentId],cb);
    },
    insert_exam_question:function(body,cb){
        db.query("INSERT INTO tbl_exam_question (iExamId,iScheduleId,iQuestionId) VALUES ? ",[body],cb);
    },
    check_round_one_question_answer:function(body,cb){
        db.query("SELECT COUNT(*) as rowCount FROM tbl_questions WHERE iQuestionId = ? AND iAnswerId = ? AND eStatus != 'd'",[body.iQuestionId,body.iAnswerId],cb);
    },
    insert_participant_questions:function(body,cb){
        db.query("INSERT INTO tbl_participant_questions (iParticipantId,iQuestionId,iAnswerId,vAnswer,eCheck,eStatus) VALUES (?,?,?,?,?,?)",[body.iParticipantId,body.iQuestionId,body.iAnswerId,body.vAnswer,body.eCheck,body.eStatus],cb);
    },
    update_exam_participant:function(body,cb){
        db.query("UPDATE tbl_exam_participant SET iRightAnswers = iRightAnswers + ? , iWrongAnswers = iWrongAnswers + ?, iTotalQuestion = iTotalQuestion + ? WHERE iParticipantId = ? ",[body.iRightAnswers,body.iWrongAnswers,body.iTotalQuestion,body.iParticipantId],cb);
    },
    check_round_two_question_answer:function(body,cb){
        db.query("SELECT COUNT(*) as rowCount FROM tbl_questions JOIN tbl_answers ON tbl_questions.iAnswerId = tbl_answers.iAnswerId WHERE tbl_questions.iQuestionId = ? AND tbl_answers.vAnswer = ? AND tbl_questions.eStatus != 'd'",[body.iQuestionId,body.vAnswer],cb);
    },
    //EXAM MODULE END
    //Statiscs
    ls_exam_count: function(body, cb){
        var kWhere = "";
        var vWhere = ['d',0,body.iUserId];
        if(typeof body.vTitle != 'undefined' && body.vTitle != "")
        {
            kWhere += ' AND vTitle LIKE ?';
            vWhere.push('%'+body.vTitle+'%');
        }
        db.query("SELECT COUNT(*) as iTotalRecords FROM tbl_exams WHERE eStatus != ? AND iParentId = ? AND iUserId = ? "+kWhere,vWhere,cb);
    },
    ls_exam_select: function(body, cb){
        var sWhere = "";
        var aWhere = ['d',0,body.iUserId];
        var sort = "";
        /**
         * Column Search Depending on Table
         */
        if(typeof body.vTitle != 'undefined' && body.vTitle != "")
        {
            sWhere += ' AND vTitle LIKE ?';
            aWhere.push('%'+body.vTitle+'%');
        }
        if(typeof body.sort != 'undefined' && body.sort != "") {sort = body.sort};
        db.query("SELECT iExamId, vTitle , vDescription ,eStatus FROM tbl_exams WHERE eStatus != ? AND iParentId = ? AND iUserId = ? "+sWhere+" ORDER BY "+sort+" LIMIT "+body.offset+", "+body.limit,aWhere,cb);
    },
    get_exam_details:function (body,cb){
        db.query("SELECT parent.vTitle,parent.vDescription,parent.eExamType,parent.eExamSubType,parent.iExamId as iRoundOneId, child.iExamId as iRoundTwoId FROM tbl_exams as parent JOIN tbl_exams as child ON child.iParentId = parent.iExamId WHERE parent.iExamId = ? AND parent.eStatus = 'y' ",[body.iExamId],cb);
    },
    get_round_details:function(body,cb){
        db.query("SELECT"+
            " tbl_exam_participant.iTotalQuestion,"+
            " tbl_exam_participant.iRightAnswers,"+
            " tbl_exam_participant.iWrongAnswers,"+
            " tbl_exam_participant.iParticipantId,"+
            " tbl_users.iUserId,"+
            " tbl_users.vFullName"+
            " FROM tbl_exam_schedule"+
            " JOIN tbl_exam_participant ON tbl_exam_participant.iScheduleId = tbl_exam_schedule.iScheduleId"+
            " JOIN tbl_users ON tbl_exam_participant.iUserId = tbl_users.iUserId"+
            " WHERE tbl_exam_schedule.iExamId = ? ",[body.iExamId],cb);
    },
    get_winner_details:function (body,cb) {
        db.query("SELECT * FROM tbl_exam_schedule " +
            "JOIN tbl_users ON tbl_users.iUserId =  tbl_exam_schedule.iWinnerId " +
            "WHERE tbl_exam_schedule.iScheduleId = ?",[body.iScheduleId],cb);
    },
    get_roundOne_question:function(body,cb){
        console.log(body);
        cli.yellow(body.iParticipentId);
        db.query("SELECT tbl_questions.iQuestionId,tbl_questions.vQuestion, tbl_answers.vAnswer, tbl_participant_questions.iAnswerId as AnsGiven, tbl_questions.iAnswerId as RightAns FROM tbl_answers"+
        " JOIN tbl_questions ON tbl_answers.iQuestionId = tbl_questions.iQuestionId"+
        " JOIN tbl_participant_questions ON tbl_questions.iQuestionId = tbl_participant_questions.iQuestionId"+
        " WHERE tbl_participant_questions.iParticipantId = ? ",[body.iParticipentId],cb);
    },
    //Stataics End
    get_ans_by_Id:function(body,cb){
        db.query("SELECT * FROM tbl_answers where iAnswerId IN (?)",[body.iAnswerId],cb);
    },
    ls_client_count: function(body, cb){
        var kWhere = "";
        var vWhere = ['client','d'];
        if(typeof body.vUserName != 'undefined' && body.vUserName != "")
        {
            kWhere += ' AND vUserName LIKE ?';
            vWhere.push('%'+body.vUserName+'%');
        }
        if(typeof body.vEmail != "undefined" && body.vEmail != "")
        {
            kWhere += ' AND vEmail LIKE ?';
            vWhere.push('%'+body.vEmail+'%');
        }
        db.query("SELECT COUNT(*) as iTotalRecords FROM tbl_users WHERE vUserType = ? AND eStatus != ? "+kWhere,vWhere,cb);
    },
    ls_client_select: function(body, cb){
        var sWhere = "";
        var aWhere = ['client','d'];
        var sort = "";
        /**
         * Column Search Depending on Table
         */
        if(typeof body.vUserName != 'undefined' && body.vUserName != "")
        {
            sWhere += ' AND vUserName LIKE ?';
            aWhere.push('%'+body.vUserName+'%');
        }
        if(typeof body.vEmail != "undefined" && body.vEmail != "")
        {
            sWhere += ' AND vEmail LIKE ?';
            aWhere.push('%'+body.vEmail+'%');
        }
        if(typeof body.sort != 'undefined' && body.sort != "") {sort = body.sort};

        db.query("SELECT iUserId, vFullName, vUserName, vEmail ,eStatus ,vUserType FROM tbl_users WHERE vUserType = ? AND eStatus != ? "+sWhere+" ORDER BY "+sort+" LIMIT "+body.offset+", "+body.limit,aWhere,cb);
    },
    get_child_by_client_id:function(body,cb){
        db.query("SELECT child.iUserId as ChildUserId, child.vFullName as ChildName, child.vEmail as ChildEmail, child.vUserName as ChildUserName, parent.vUserName, parent.vFullName as ParentName, parent.vEmail as ParentEmail FROM tbl_child as c" +
            " JOIN tbl_parent as p ON p.iParentId = c.iParentId" +
            " JOIN tbl_users as parent ON p.iUserId = parent.iUserId" +
            " JOIN tbl_users as child ON child.iUserId = c.iUserId" +
            " WHERE p.iUserId = ? AND parent.eStatus != 'd' AND child.eStatus != 'd'",[body.id],cb);
    },
    addParent:function(body,cb){
        db.query("INSERT INTO tbl_parent ( iUserId,vParentType) VALUES (?,?)",[body.iUserId,body.vParentType],cb);
    },
    getParentId:function(body,cb){
        db.query("SELECT iParentId from tbl_parent WHERE iUserId = ?",[body.iUserId],cb);
    },
    addChild:function(body,cb){
        db.query("INSERT INTO tbl_child ( iParentId,iUserId) VALUES (?,?)",[body.iParentId,body.iUserId],cb);
    },
    getChildById:function(body,cb){
        db.query("SELECT " +
            " tbl_users.iUserId," +
            " tbl_users.vFullName," +
            " tbl_users.vUserName," +
            " tbl_users.vEmail," +
            " tbl_parent.iParentId," +
            " tbl_parent.iUserId as iParentUserId" +
            " FROM tbl_users" +
            " JOIN tbl_child ON tbl_users.iUserId = tbl_child.iUserId" +
            " JOIN tbl_parent ON tbl_child.iParentId = tbl_parent.iParentId" +
            " WHERE tbl_users.iUserId = ?",[body.iUserId],cb);
    },
    addExamUser:function(body,cb){
        db.query("INSERT INTO tbl_exam_users (iExamId, iScheduleId, iParentId, iUserId, eAvailable) VALUES (?,?,?,?,?)",[0,0,body.iParentId,body.iUserId,'n'],cb);
    },
    getExamUser:function(body,cb){
        db.query("SELECT tbl_exam_users.*,tbl_users.vFullName FROM tbl_exam_users JOIN tbl_users ON tbl_users.iUserId = tbl_exam_users.iUserId WHERE iParentId = ?",[body.iParentId],cb);
    },
    updateExamUser:function(body,cb){
        db.query("UPDATE tbl_exam_users SET iExamId = ? , iScheduleId = ? , eAvailable = ?  WHERE iExamUserId = ?",[body.iExamId,body.iScheduleId,body.eAvailable,body.iExamUserId],cb);
    },
    get_exam_edit_question:function(body,cb){
        db.query("SELECT * FROM tbl_exam_question WHERE iExamId = ?  OR iExamId = ?",[body.iRoundOneId, body.iRoundTwoId],cb);
    },
    update_tbl_exams:function(body){
        db.query("UPDATE tbl_exams SET vTitle = ? , vDescription = ?, dUpdatedDate = ?, eExamType = ?, eExamSubType = ?  WHERE iExamId = ?",[body.vTitle,body.vDescription,dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss"),body.eExamType,body.eExamSubType,body.iExamId]);
    },
    delete_tbl_exam_question:function(body,cb){
        db.query("DELETE FROM tbl_exam_question WHERE iExamId = ?",[body.iExamId],cb);
    },
    //*
    check_exam_available:function(body,cb){
        db.query("SELECT * FROM tbl_exam_users WHERE iUserId = ? AND iScheduleId > 0 AND iExamId > 0 AND eAvailable = 'y' ",[body.iUserId],cb);
    },
    get_question:function(body,cb){
        db.query("SELECT * FROM tbl_exam_question WHERE iExamId IN (?)",[body.iExamId],cb);
    },
    get_exam_users_by_examid:function(body,cb){
        db.query("SELECT * FROM tbl_exam_users JOIN tbl_users ON tbl_users.iUserId = tbl_exam_users.iUserId WHERE tbl_exam_users.iExamId = ? AND tbl_users.eStatus = 'y'",[body.iExamId],cb);
    },
    tbl_exams_status:function(body,cb){
        db.query("UPDATE tbl_exams set eStatus = ? WHERE iExamId = ?",[body.eStatus,body.iExamId],cb);
    },
    deleteExamUser:function(body,cb){
        db.query("UPDATE tbl_exam_users SET iExamId = 0, iScheduleId = 0, eAvailable = 'n' WHERE iExamId = ?",[body.iExamId],cb);
    },
    list_users:function(body,cb){
        db.query("SELECT * FROM tbl_users  JOIN tbl_parent ON tbl_users.iUserId = tbl_parent.iUserId  WHERE tbl_users.vUserType = 'client' AND tbl_users.eStatus != 'd'  LIMIT ? OFFSET ?",[body.limit,body.offset],cb);
    },
    total_users:function(body,cb){
        db.query("SELECT count(*) as TotalUser FROM tbl_users WHERE vUserType = 'client' AND eStatus != ? ",['d'],cb);
    },

    /**
     * Dashboard Query
     */
    get_count_users_under_customer:function(body,cb){
        db.query("SELECT COUNT(*) as TotalGameUser " +
            "FROM tbl_child  " +
            "JOIN tbl_parent ON tbl_parent.iParentId = tbl_child.iParentId " +
            "JOIN tbl_users ON tbl_users.iUserId = tbl_child.iUserId " +
            "WHERE tbl_users.eStatus != 'd' AND " +
            "tbl_parent.iUserId = ?",[body.iUserId],cb);
    },
    get_total_exam_generated:function(body,cb){
        db.query("SELECT COUNT(*) TotalExam FROM tbl_exams WHERE iUserId = ? AND iParentId = 0",[body.iUserId],cb);
    },
    get_total_users_for_admin:function(body,cb){
        db.query("SELECT COUNT(*) as TotalUser FROM tbl_users " +
            "JOIN tbl_parent ON tbl_parent.iUserId = tbl_users.iUserId " +
            "WHERE tbl_users.vUserType='client' AND tbl_users.eStatus != 'd' AND tbl_parent.vParentType = ?",[body.vParentType],cb);
    },
    get_total_game_users_for_admin_parent:function(body,cb){
        db.query("SELECT COUNT(*) as TotalGameUser FROM tbl_users WHERE vUserType='user' AND eStatus != 'd'",cb);
    },
    get_total_exams:function(body,cb){
        db.query("SELECT COUNT(*) as TotalExam FROM tbl_exams WHERE eStatus != 'd' AND iParentId = 0",[],cb);
    },
    /**
     * Statistics Module
     */
    //Admin
    state_get_all_exam:function(body,cb){
        db.query("SELECT " +
            "tbl_exams.vTitle, " +
            "tbl_exams.vDescription, " +
            "tbl_exams.iParentId as ROneExamId, " +
            "RoundOne.iParticipantId as ROneParticipantId, " +
            "RoundOne.iTotalQuestion as ROneTotalQuestion, " +
            "RoundOne.iWrongAnswers as ROneWrongAnswers, " +
            "RoundOne.iRightAnswers as ROneRightAnswers, " +
            "RoundOne.iTotalAttempt, "+
            "tbl_exams.iExamId as RTwoExamId, " +
            "RoundTwo.iParticipantId as RTwoParticipantId, " +
            "RoundTwo.iTotalQuestion as RTwoTotalQuestion, " +
            "RoundTwo.iRightAnswers as RTwoRightAnswers, " +
            "RoundTwo.iWrongAnswers as RTwoWrongAnswers, " +
            "RoundOne.dCreatedDate as ExamDate " +
            "FROM tbl_exam_participant as RoundOne " +
            "JOIN tbl_exam_participant as RoundTwo ON RoundTwo.iParentParticipentId = RoundOne.iParticipantId " +
            "JOIN tbl_exam_schedule ON tbl_exam_schedule.iScheduleId = RoundTwo.iScheduleId " +
            "JOIN tbl_exams ON tbl_exams.iExamId = tbl_exam_schedule.iExamId " +
            "WHERE RoundOne.iUserId = ?",[body.iUserId],cb);
    },
    /**
     * Statistics Module End
     */
    get_exam_final_result:function(body,cb){
        db.query("SELECT " +
            "RoundOne.iTotalQuestion + RoundTwo.iTotalQuestion as TotalQuestion, " +
            "RoundOne.iRightAnswers as ROneRightAnswers, " +
            "RoundOne.iWrongAnswers as ROneWrongAnswers, " +
            "RoundTwo.iRightAnswers as RTwoRightAnswers, " +
            "RoundTwo.iWrongAnswers as RTwoWrongAnswers " +
            "FROM tbl_exam_participant as RoundOne " +
            "JOIN tbl_exam_participant as RoundTwo ON RoundTwo.iParentParticipentId = RoundOne.iParticipantId " +
            "WHERE RoundOne.iParticipantId = ?",[body.iParticipantId],cb);
    },
    get_exam_result_after_try_again:function(body,cb){
        db.query("SELECT " +
            "RoundOne.iTotalQuestion + RoundTwo.iTotalQuestion as TotalQuestion, " +
            "RoundOne.iRightAnswers as ROneRightAnswers, " +
            "RoundOne.iWrongAnswers as ROneWrongAnswers, " +
            "RoundTwo.iRightAnswers as RTwoRightAnswers, " +
            "RoundTwo.iWrongAnswers as RTwoWrongAnswers " +
            "FROM tbl_tryagain as RoundOne " +
            "JOIN tbl_tryagain as RoundTwo ON RoundTwo.iParentTryagainId = RoundOne.iTryagainId " +
            "WHERE RoundOne.iTryagainId = ?",[body.iTryagainId],cb);
    },
    detail_result_round_one:function(body,cb){
        db.query("SELECT " +
            "tbl_participant_questions.eCheck as eCheck, " +
            "tbl_questions.vModeName, " +
            "tbl_questions.eType, " +
            "tbl_questions.eTypeQuestion, " +
            "tbl_questions.vQuestion, " +
            "actual_ans.vAnswer as ActualAns, " +
            "give_ans.vAnswer as GiveAns " +
            "FROM tbl_participant_questions  " +
            "JOIN tbl_questions ON tbl_questions.iQuestionId =  tbl_participant_questions.iQuestionId " +
            "JOIN tbl_answers as actual_ans ON tbl_questions.iAnswerId = actual_ans.iAnswerId " +
            "JOIN tbl_answers as give_ans ON tbl_participant_questions.iAnswerId = give_ans.iAnswerId " +
            "WHERE tbl_participant_questions.iParticipantId = ?",[body.iParticipantId],cb);
    },
    detail_result_round_two:function(body,cb){
        db.query("SELECT " +
            "tbl_participant_questions.eCheck as eCheck, " +
            "tbl_questions.vModeName, " +
            "tbl_questions.eType, " +
            "tbl_questions.eTypeQuestion, " +
            "tbl_questions.vQuestion, " +
            "actual_ans.vAnswer as ActualAns, " +
            "tbl_participant_questions.vAnswer as GiveAns " +
            "FROM tbl_participant_questions  " +
            "JOIN tbl_questions ON tbl_questions.iQuestionId =  tbl_participant_questions.iQuestionId " +
            "JOIN tbl_answers as actual_ans ON tbl_questions.iAnswerId = actual_ans.iAnswerId " +
            "WHERE tbl_participant_questions.iParticipantId = ?",[body.iParticipantId],cb);
    },

    try_again_listing:function (body,cb) {
        db.query("SELECT parent.iTryagainId as ROneTryagainId, " +
            "parent.iTotalQuestion as ROneTotalQuestion, " +
            "parent.iRightAnswers as ROneRightAnswers, " +
            "parent.iWrongAnswers as ROneWrongAnswers, " +
            "child.iTryagainId as RTwoTryagainId," +
            "child.iTotalQuestion as RTwoTotalQuestion, " +
            "child.iRightAnswers as RTwoRightAnswers, " +
            "child.iWrongAnswers as RTwoWrongAnsers " +
            "FROM tbl_tryagain as parent " +
            "JOIN tbl_tryagain as child ON child.iParentTryagainId = parent.iTryagainId " +
            "WHERE parent.iParticipantId = ?",[body.iParticipantId],cb);
    },
    detail_result_tryagain_round_one:function(body,cb){
        db.query("SELECT tbl_tryagain_question.eCheck as eCheck," +
            "tbl_questions.vModeName," +
            "tbl_questions.eType," +
            "tbl_questions.eTypeQuestion," +
            "tbl_questions.vQuestion,actual_ans.vAnswer as ActualAns," +
            "give_ans.vAnswer as GiveAns " +
            "FROM tbl_tryagain_question " +
            "JOIN tbl_questions ON tbl_questions.iQuestionId =  tbl_tryagain_question.iQuestionId " +
            "JOIN tbl_answers as actual_ans ON tbl_questions.iAnswerId = actual_ans.iAnswerId " +
            "JOIN tbl_answers as give_ans ON tbl_tryagain_question.iAnswerId = give_ans.iAnswerId " +
            "WHERE tbl_tryagain_question.iTryagainId = ?",[body.iTryagainId],cb);
    },
    detail_result_tryagain_round_two:function(body,cb){
        db.query("SELECT tbl_tryagain_question.eCheck as eCheck, " +
                "tbl_questions.vModeName, " +
                "tbl_questions.eType, " +
                "tbl_questions.eTypeQuestion, " +
                "tbl_questions.vQuestion, " +
                "actual_ans.vAnswer as ActualAns, " +
                "tbl_tryagain_question.vAnswer as GiveAns " +
                "FROM tbl_tryagain_question " +
                "JOIN tbl_questions ON tbl_questions.iQuestionId =  tbl_tryagain_question.iQuestionId " +
                "JOIN tbl_answers as actual_ans ON tbl_questions.iAnswerId = actual_ans.iAnswerId " +
                "WHERE tbl_tryagain_question.iTryagainId = ?",[body.iTryagainId],cb);
    },
    // get_user_exam_graph:function (body, cb) {
    //     db.query("SELECT COUNT(*) as TotalAttempt, tbl_exams.vTitle " +
    //         "FROM tbl_exam_participant " +
    //         "JOIN tbl_exam_schedule ON tbl_exam_schedule.iScheduleId = tbl_exam_participant.iScheduleId " +
    //         "JOIN tbl_exams ON tbl_exam_schedule.iExamId = tbl_exams.iExamId " +
    //         "WHERE tbl_exam_participant.iParentParticipentId = 0 AND tbl_exam_participant.iUserId = ? GROUP BY tbl_exams.vTitle",[body.iUserId],cb);
    // }

    get_user_exam_graph:function(body,cb){
        db.query("SELECT tbl_exams.vTitle, RoundOne.iTotalQuestion + RoundTwo.iTotalQuestion as TotalQuestion, RoundOne.iRightAnswers + RoundTwo.iRightAnswers as RightAnswer FROM tbl_exam_participant as RoundOne JOIN tbl_exam_participant as RoundTwo ON RoundTwo.iParentParticipentId = RoundOne.iParticipantId JOIN tbl_exam_schedule ON tbl_exam_schedule.iScheduleId = RoundTwo.iScheduleId JOIN tbl_exams ON tbl_exams.iExamId = tbl_exam_schedule.iExamId WHERE RoundOne.iUserId = ?",[body.iUserId],cb);
    },

    sp_get_participent_id:function(body,cb){
        db.query("CALL `get_participent_id`(?)",[body.iUserId],cb);
    },
    get_exam_result_graph_according_to_pemdas:function(body,cb){
        db.query("SELECT tbl_participant_questions.eCheck, tbl_questions.eTypeQuestion FROM tbl_participant_questions " +
                "JOIN tbl_questions ON tbl_questions.iQuestionId = tbl_participant_questions.iQuestionId "+
                "WHERE tbl_participant_questions.iParticipantId IN (?)",[body.iParticipantId],cb);
    }
    /**
     * If you want to graph according to exam wise
     * SQL = "SELECT tbl_exam_participant.iParticipantId AS RoundTwoParticipantId,
     *        tbl_exam_participant.iParentParticipentId as RoundOneParticipantId FROM tbl_exam_schedule
     *        JOIN tbl_exam_participant ON tbl_exam_schedule.iScheduleId = tbl_exam_participant.iScheduleId
     *        WHERE tbl_exam_participant.iUserId = 89 AND tbl_exam_schedule.iExamId = 761"
     *
     */


};
module.exports = Users;

/**
 *
 * Basic Structure for Generate list Query
 ls_question_count:function(body,cb){
        var kWhere = "";
        var vWhere = [];
        db.query("SELECT COUNT(*) FROM tbl_questions WHERE tbl_questions.eStatus != 'd'",cb);
    },
 ls_question_select:function(body,cb){
        var kWhere = "";
        var vWhere = [];
        var sort = "";
        if(typeof body.sort != 'undefined' && body.sort != "") {sort = body.sort};
        db.query("SELECT * FROM tbl_questions WHERE tbl_questions.eStatus != 'd' ORDER BY "+sort+" LIMIT "+body.offset +" ,"+body.limit,cb);
    },
 *
 *
 *
 */


