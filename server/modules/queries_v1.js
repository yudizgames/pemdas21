/**
 * Created by YudizAshish on 12/04/17.
 */
var db = require("./connection");
var cli = require("../../config/config").console;
var md5 = require("md5");
var dateFormat = require("dateformat"); //dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss"); Currnet date time

var Demo = {


    //Generate Exam
    ins_exam:function(body,cb){
        db.query("INSERT INTO tbl_exams (iUserId,vTitle,vDescription,eExamType,eExamSubType,eStatus,dCreatedDate,iParentId) VALUES (?,?,?,?,?,?,?,?)",
            [body.iUserId,body.vTitle,body.vDescription,body.eExamType,body.eExamSubType,"y",dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss"),body.iParentId],cb);
    },
    ins_exam_schedule:function(body,cb){
        db.query("INSERT INTO tbl_exam_schedule (iExamId,dExamDate,iWinnerId,dCreatedDate) VALUES (?,?,?,?)",[body.iExamId,dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss"),0,dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss")],cb);
    },
    get_child_by_client_id:function(body,cb){
        db.query("SELECT child.iUserId as ChildUserId, child.vFullName as ChildName, child.vEmail as ChildEmail, child.vUserName as ChildUserName, parent.vUserName, parent.vFullName as ParentName, parent.vEmail as ParentEmail FROM tbl_child as c" +
            " JOIN tbl_parent as p ON p.iParentId = c.iParentId" +
            " JOIN tbl_users as parent ON p.iUserId = parent.iUserId" +
            " JOIN tbl_users as child ON child.iUserId = c.iUserId" +
            " WHERE p.iUserId = ? AND parent.eStatus != 'd' AND child.eStatus != 'd'",[body.id],cb);
    },
    ins_exam_question:function(body,cb){
        db.query("INSERT INTO tbl_exam_question (iExamId,iScheduleId,iQuestionId) VALUES ? ",[body],cb);
    },
    ins_exam_participant:function(body,cb){
        db.query("INSERT INTO tbl_exam_participant (iScheduleId,iUserId,dCreatedDate,iParentParticipentId,iTotalQuestion,iWrongAnswers) VALUES (?,?,?,?,?,?) ",[body.iScheduleId,body.iUserId,dateFormat(new Date(),"yyyy-mm-dd HH:mm:ss"),body.iParentParticipentId,body.iTotalQuestion,body.iTotalQuestion],cb);
    },
    ins_participant_question:function(body,cb){
        db.query("INSERT INTO tbl_participant_questions (iParticipantId,iQuestionId,iAnswerId,vAnswer,eCheck,eStatus) VALUES ?",[body],cb);
    },
    get_participant_id:function(body,cb){
        db.query("SELECT rtwo.iParentParticipentId as RoundOneParticipantId, rtwo.iParticipantId as RoundTwoParticipantId FROM tbl_exam_participant as rone JOIN tbl_exam_participant as rtwo ON rone.iParticipantId = rtwo.iParentParticipentId WHERE rone.iUserId = ? AND rone.iParentParticipentId = 0",[body.iUserId],cb);
    },
    update_total_question:function(body,cb){
        db.query("UPDATE tbl_exam_participant SET iTotalQuestion = ?, iWrongAnswers = iWrongAnswers + ? WHERE iParticipantId = ?",[body.iTotalQuestion,body.iWrongAnswers,body.iParticipantId]);
    },
    //Generate Exam End

    //Game Api
    check_exam_available:function(body,cb){
        db.query("SELECT * FROM tbl_exam_users JOIN tbl_exams ON tbl_exams.iExamId = tbl_exam_users.iExamId WHERE tbl_exam_users.iUserId = ? AND tbl_exam_users.iScheduleId > 0 AND tbl_exam_users.iExamId > 0 AND tbl_exam_users.eAvailable = 'y' AND tbl_exams.eStatus = 'y'",[body.iUserId],cb);
    },
    chek_exam_participent:function(body,cb){
        db.query("SELECT rone.iParticipantId as RoneiParticipantId," +
                "rone.iTotalQuestion as RoneiTotalQuestion," +
                "rone.iRightAnswers as RoneiRightAnswer," +
                "rone.iWrongAnswers as RoneiWrongAnswer," +
                "rone.iTotalAttempt as TotalAttempt, "+
                "rtwo.iParticipantId as RtwoiParticipantId," +
                "rtwo.iTotalQuestion as RtwoiTotalQuestion," +
                "rtwo.iRightAnswers as RtwoiRightAnswer," +
                "rtwo.iWrongAnswers as RtwoiWrongAnswer " +
                "FROM tbl_exam_participant as rone " +
                "JOIN tbl_exam_participant as rtwo ON rone.iParticipantId = rtwo.iParentParticipentId " +
                "WHERE rone.iScheduleId = ? AND rone.iUserId = ? AND rone.iParentParticipentId = 0 AND rone.eStatus = 'y'",[body.iScheduleId,body.iUserId],cb);
        },
    get_participant_question:function(body,cb){
        db.query("SELECT iQuestionId FROM tbl_participant_questions WHERE iParticipantId = ? AND eCheck = 'wrong'",[body.iParticipantId],cb);
    },
    update_participant_questions:function(body,cb){
        db.query("UPDATE tbl_participant_questions SET iAnswerId = ? , vAnswer = ?,eCheck = ?,eStatus = ? WHERE iParticipantId = ? AND iQuestionId = ?",
            [body.iAnswerId,body.vAnswer,body.eCheck,body.eStatus,body.iParticipantId,body.iQuestionId],cb);
    },
    update_participant_attempt:function(body,cb){
        db.query("UPDATE tbl_exam_participant SET iTotalAttempt = iTotalAttempt + 1 WHERE iParticipantId = ?",[body.iParticipantId],cb);
    },
    get_examId_scheduleId:function(body,cb){
        console.log(body.iExamId);
        db.query("SELECT parent.iExamId as RoundOneExamId, child.iExamId as RoundTwoExamId , RoundOne.iScheduleId as RoundOneScheduleId,  RoundTwo.iScheduleId as RoundTwoScheduleId from tbl_exams as parent JOIN tbl_exams as child ON parent.iExamId = child.iParentId JOIN tbl_exam_schedule as RoundOne ON parent.iExamId = RoundOne.iExamId JOIN tbl_exam_schedule as RoundTwo ON child.iExamId = RoundTwo.iExamId WHERE parent.iExamId = ?",[body.iExamId],cb);
    },
    get_wrong_question_attempt_first:function(body,cb){
        db.query("SELECT * FROM tbl_participant_questions WHERE iParticipantId IN (?) AND eCheck = 'wrong'",[body.iParticipantId],cb);
    },
    insert_tbl_tryagain:function(body,cb){
        db.query("INSERT INTO tbl_tryagain (iParticipantId,iTotalQuestion,iWrongAnswers,iRightAnswers,iParentTryagainId) values (?,?,?,?,?)",[body.iParticipantId,"0","0","0",body.iParentTryagainId],cb);
    },
    insert_tryagain_participant_questions:function(body,cb){
        db.query("INSERT INTO tbl_tryagain_question (iTryagainId,iQuestionId,iAnswerId,vAnswer,eCheck,eStatus) VALUES (?,?,?,?,?,?)",[body.iTryagainId,body.iQuestionId,body.iAnswerId,body.vAnswer,body.eCheck,body.eStatus],cb);
    },
    update_tryagain_exam_participant:function(body,cb){
        db.query("UPDATE tbl_tryagain SET iRightAnswers = iRightAnswers + ? , iWrongAnswers = iWrongAnswers + ?, iTotalQuestion = iTotalQuestion + ? WHERE iTryagainId = ? ",[body.iRightAnswers,body.iWrongAnswers,body.iTotalQuestion,body.iTryagainId],cb);
    },
    get_wrong_question_attempt_second:function(body,cb){
        db.query("SELECT * FROM tbl_tryagain_question WHERE iTryagainId IN (?) AND eCheck = 'wrong'",[body.iTryagainId],cb);
    },

    //Game Api for end
}

module.exports = Demo;
