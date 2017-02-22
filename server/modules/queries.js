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
        return db.query("SELECT *  FROM `tbl_users` WHERE `vEmail` = ? AND `vPassword` = ? AND `eStatus` != 'd'",[body.vEmail,md5(body.vPassword)],callback);
    },
    setTocket:function(body,callback){
        console.log("setTocken call");
        return db.query("INSERT INTO tbl_user_devices (iUserId,vAuthToken,eDeviceType) VALUES (?,?,?)",[body.iUserId, body.token, body.eDeviceType], callback);
    },
    authenticate: function(body, cb){
        console.log("authentications call");
        db.query("SELECT u.iUserId,d.iDeviceId FROM tbl_users as u INNER JOIN tbl_user_devices as d ON (d.iUserId = u.iUserId) WHERE d.vAuthToken = ? AND u.eStatus = ? AND d.eDeviceType = ?",[body.token,'y',body.device],cb);
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
        db.query("SELECT * FROM tbl_users WHERE vEmail = ? AND eStatus = ?",[body.vEmail,'y'],cb);
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
        var kWhere = "";
        var vWhere = ['user','d'];
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
    ls_user_select: function(body, cb){
        var sWhere = "";
        var aWhere = ['user','d'];
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

        db.query("SELECT iUserId, vUserName, vEmail ,eStatus FROM tbl_users WHERE vUserType = ? AND eStatus != ? "+sWhere+" ORDER BY "+sort+" LIMIT "+body.offset+", "+body.limit,aWhere,cb);
    },
    //   *@   //
    getUserById:function(body,cb){
      db.query("SELECT * FROM tbl_users WHERE iUserId = ? AND eStatus != 'd'",[body.id],cb);
    },
    deleteUserById:function(body,cb){
        db.query("UPDATE tbl_users SET eStatus = ? WHERE iUserId = ?",['d',body.id],cb);
    },
    changeUserStatusById:function(body,cb){
        console.log("User Status");
        cli.blue(JSON.stringify(body));
        db.query("UPDATE tbl_users SET eStatus = ? WHERE iUserId = ?",[body.eStatus,body.id],cb);
    },
    updateUserById:function(body,cb){
        db.query("UPDATE tbl_users SET vFullName = ?, dLastActivity = ? WHERE iUserId = ? ",[body.vFullName,dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss"),body.id],cb);
    },
    addUser:function (body,cb) {
        db.query("INSERT INTO tbl_users (vUserType,vFullName,vUserName,vEmail,vPassword,eStatus,dLastActivity,dCreatedDate) VALUES (?,?,?,?,?,?,?,?)",['user',body.vFullName,body.vUserName,body.vEmail,md5(body.vPassword),'y',dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss"),dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss")],cb);
    },
    //QUESTION MODULE START
    listQuestion:function(body,cb){
        db.query("SELECT tbl_questions.*,tbl_answers.vAnswer FROM tbl_questions JOIN tbl_answers ON tbl_answers.iAnswerId = tbl_questions.iAnswerId WHERE tbl_questions.eStatus != 'd'",cb);
    },
    ls_question_count:function(body,cb){
        var sWhere = "";
        var aWhere = [];
        if(typeof body.eType != 'undefined' && body.eType != "")
        {
            sWhere += ' AND eType LIKE ?';
            aWhere.push('%'+body.eType+'%');
        }
        if(typeof body.vModeName != "undefined" && body.vModeName != "")
        {
            sWhere += ' OR vModeName LIKE ?';
            aWhere.push('%'+body.vModeName+'%');
        }
        db.query("SELECT COUNT(*) as iTotalRecords FROM tbl_questions JOIN tbl_answers ON tbl_answers.iAnswerId = tbl_questions.iAnswerId WHERE tbl_questions.eStatus != 'd'"+sWhere,aWhere,cb);
    },
    ls_question_select:function(body,cb){
        var sWhere = "";
        var aWhere = [];
        var sort = "";

        if(typeof body.eType != 'undefined' && body.eType != "")
        {
            sWhere += ' AND eType LIKE ?';
            aWhere.push('%'+body.eType+'%');
        }
        if(typeof body.vModeName != "undefined" && body.vModeName != "")
        {
            sWhere += ' OR vModeName LIKE ?';
            aWhere.push('%'+body.vModeName+'%');
        }
        if(typeof body.sort != 'undefined' && body.sort != "") {sort = body.sort};
        db.query("SELECT tbl_questions.*,tbl_answers.vAnswer FROM tbl_questions JOIN tbl_answers ON tbl_answers.iAnswerId = tbl_questions.iAnswerId WHERE tbl_questions.eStatus != 'd' "+sWhere+" ORDER BY "+sort+" LIMIT "+body.offset +" ,"+body.limit,aWhere,cb);
    },
    viewQuestion:function(body,cb){
        db.query("SELECT tbl_answers.iAnswerId,tbl_questions.vModeName,tbl_questions.eType,tbl_questions.vQuestion,tbl_questions.dUpdatedDate,tbl_answers.vAnswer,tbl_questions.eStatus,IF(tbl_questions.iAnswerId = tbl_answers.iAnswerId,'y','n') as vRightAns FROM tbl_questions JOIN tbl_answers ON tbl_answers.iQuestionId = tbl_questions.iQuestionId WHERE tbl_questions.eStatus != 'd' AND tbl_questions.iQuestionId = ?  ORDER BY vRightAns DESC",body.iQuestionId,cb);
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
        db.query("UPDATE tbl_questions SET vModeName = ? ,eType = ? ,vQuestion = ?, iAnswerId = ?, dUpdatedDate = ? WHERE iQuestionId = ?",[body.vModeName,body.eType,body.vQuestion,body.iAnswerId,dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss"),body.iQuestionId],cb);
    },
    insertQuestion:function(body,cb){
        db.query("INSERT INTO tbl_questions (vModeName,eType,vQuestion,iAnswerId,eStatus) VALUES (?,?,?,?,?)",[body.vModeName,body.eType,body.vQuestion,'0','n'],cb);
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
        var sWhere = "";
        var aWhere = [];
        if(typeof body.eType != 'undefined' && body.eType != "")
        {
            sWhere += ' AND eType LIKE ?';
            aWhere.push('%'+body.eType+'%');
        }
        if(typeof body.vModeName != "undefined" && body.vModeName != "")
        {
            sWhere += ' OR vModeName LIKE ?';
            aWhere.push('%'+body.vModeName+'%');
        }
        db.query("SELECT COUNT(*) as iTotalRecords FROM tbl_questions JOIN tbl_answers ON tbl_answers.iAnswerId = tbl_questions.iAnswerId WHERE tbl_questions.eStatus != 'd' AND tbl_questions.eType = 'MCQ'"+sWhere,aWhere,cb);
    },
    ls_mcq_select:function(body,cb){
        var sWhere = "";
        var aWhere = [];
        var sort = "";

        if(typeof body.eType != 'undefined' && body.eType != "")
        {
            sWhere += ' AND eType LIKE ?';
            aWhere.push('%'+body.eType+'%');
        }
        if(typeof body.vModeName != "undefined" && body.vModeName != "")
        {
            sWhere += ' OR vModeName LIKE ?';
            aWhere.push('%'+body.vModeName+'%');
        }
        if(typeof body.sort != 'undefined' && body.sort != "") {sort = body.sort};
        db.query("SELECT tbl_questions.*,tbl_answers.vAnswer, 'n' as eSelected FROM tbl_questions JOIN tbl_answers ON tbl_answers.iAnswerId = tbl_questions.iAnswerId WHERE tbl_questions.eStatus != 'd' AND tbl_questions.eType = 'MCQ'"+sWhere+" ORDER BY "+sort+" LIMIT "+body.offset +" ,"+body.limit,aWhere,cb);
    },
    //EXAM MODULE MCQ START
    ls_vsq_count:function(body,cb){
        var sWhere = "";
        var aWhere = [];
        if(typeof body.eType != 'undefined' && body.eType != "")
        {
            sWhere += ' AND eType LIKE ?';
            aWhere.push('%'+body.eType+'%');
        }
        if(typeof body.vModeName != "undefined" && body.vModeName != "")
        {
            sWhere += ' OR vModeName LIKE ?';
            aWhere.push('%'+body.vModeName+'%');
        }
        db.query("SELECT COUNT(*) as iTotalRecords FROM tbl_questions JOIN tbl_answers ON tbl_answers.iAnswerId = tbl_questions.iAnswerId WHERE tbl_questions.eStatus != 'd' AND tbl_questions.eType = 'VSQ'"+sWhere,aWhere,cb);
    },
    ls_vsq_select:function(body,cb){
        var sWhere = "";
        var aWhere = [];
        var sort = "";

        if(typeof body.eType != 'undefined' && body.eType != "")
        {
            sWhere += ' AND eType LIKE ?';
            aWhere.push('%'+body.eType+'%');
        }
        if(typeof body.vModeName != "undefined" && body.vModeName != "")
        {
            sWhere += ' OR vModeName LIKE ?';
            aWhere.push('%'+body.vModeName+'%');
        }
        if(typeof body.sort != 'undefined' && body.sort != "") {sort = body.sort};
        db.query("SELECT tbl_questions.*,tbl_answers.vAnswer, 'n' as eSelected FROM tbl_questions JOIN tbl_answers ON tbl_answers.iAnswerId = tbl_questions.iAnswerId WHERE tbl_questions.eStatus != 'd' AND tbl_questions.eType = 'VSQ'"+sWhere+" ORDER BY "+sort+" LIMIT "+body.offset +" ,"+body.limit,aWhere,cb);
    },
    get_mcq_by_Ids:function(body,cb){
        db.query("SELECT tbl_questions.iQuestionId,tbl_questions.vQuestion, tbl_answers.vAnswer, tbl_answers.iAnswerId FROM tbl_answers JOIN tbl_questions ON tbl_answers.iQuestionId = tbl_questions.iQuestionId WHERE tbl_questions.iQuestionId IN (?)",[body.iQuestionId],cb)
    },
    insert_exam:function(body,cb){
        db.query("INSERT INTO tbl_exams (iUserId,vTitle,vDescription,eStatus,dCreatedDate) VALUES (?,?,?,?,?)",[0,body.vTitle,body.vDescription,"y",dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss")],cb);
    },
    insert_exam_schedule:function(body,cb){
        db.query("INSERT INTO tbl_exam_schedule (iExamId,dExamDate,iWinnerId,dCreatedDate) VALUES (?,?,?,?)",[body.iExamId,dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss"),0,dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss")],cb);
    },
    insert_exam_participant:function(body,cb){
        db.query("INSERT INTO tbl_exam_participant (iScheduleId,iUserId,iTotalQuestion,iRightAnswers,iWrongAnswers,eStatus,dCreatedDate) VALUES (?,?,?,?,?,?,?)",[body.iScheduleId,body.iUserId,0,0,0,"y",dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss")],cb);
    },
    check_question_answer:function(body,cb){
        db.query("SELECT COUNT(*) as rowCount FROM tbl_questions WHERE iQuestionId = ? AND iAnswerId = ? AND eStatus != 'd'",[body.iQuestionId,body.iAnswerId],cb);
    },
    insert_participant_questions:function(body,cb){
        db.query("INSERT INTO tbl_participant_questions (iParticipantId,iQuestionId,iAnswerId,eCheck,eStatus) VALUES (?,?,?,?,?)",[body.iParticipantId,body.iQuestionId,body.iAnswerId,body.eCheck,body.eStatus],cb);
    },
    update_exam_participant:function(body,cb){
        db.query("UPDATE tbl_exam_participant SET iTotalQuestion = iTotalQuestion + 1 , iRightAnswers = iRightAnswers + ? , iWrongAnswers = iWrongAnswers + ? WHERE iParticipantId = ? ",[body.iRightAnswers,body.iWrongAnswers,body.iParticipantId],cb);
    }
    //EXAM MODULE MCQ END

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
