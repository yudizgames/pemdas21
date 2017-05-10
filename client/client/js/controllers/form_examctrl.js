/**
 * Created by YudizAshish on 24/03/17.
 */
angular.module('client').controller('ExamFormCtrl',function ($scope,$stateParams,$rootScope,$resource,$http,$state,toastr,DTOptionsBuilder,DTColumnBuilder,$compile,$localForage) {
    $scope.examdata = {};
    $scope.ExamDetails = true;
    $scope.RoundOneShow = false;
    $scope.RoundTwoShow = false;
    $scope.form_action = $stateParams.action;
    $scope.iExamId = $stateParams.id;
    /**
     * Intitalization
     */
    //Round One Question
    $scope.questionStatusROne = [];
    $scope.questionSelectedROne = [];
    $scope.examQuestionROne = [];
    $scope.examQuestionROneUpdate = [];
    $scope.dtInstanceQuestionROne = {};


    //Round Two Question
    $scope.vsqQuestionStatus = [];
    $scope.vsqQuestionSelected = [];
    $scope.vsqExamQuestion = [];
    $scope.vsqExamQuestionUpdate = [];
    $scope.dtInstanceQuestionRTwo = {};
    //Edit Purpose
    $scope.examQuestionOne = [];
    $scope.examQuestionTwo = [];


    //Custom search add
    $scope.oneSearchCount = 0;
    $scope.searchOne = {
        panethesis:false,
        exponent:false,
        mutiplication:false,
        division:false,
        addition:false,
        subtraction:false
    }
    $scope.searchTwo = {
        panethesis:false,
        exponent:false,
        mutiplication:false,
        division:false,
        addition:false,
        subtraction:false
    }
    $scope.dtInstances = {};
    $scope.dtInstances.dtInstanceQuestionROne = {};
    $scope.dtInstances.dtInstanceQuestionRTwo = {};
    /**
     * Basic exam details
     */
    $scope.submitExamDetails = function(){
        var submit = false;
        if($stateParams.action == "Edit"){
            console.log($scope.exam_users);
            for(var i = 0; i<$scope.exam_users.length;i++){
                if($scope.exam_users[i].eAvailable == 'y'){
                    submit = true;
                }
            }
            if(submit == true){
                $scope.ExamDetails = false;
                $scope.RoundOneShow = true;
            }else{
                toastr.error("Select At least  One User For Exam","Error");
            }

        }else{
            for(var i = 0; i<$scope.exam_users.length;i++){
                if($scope.exam_users[i].iExamId == 0 && $scope.exam_users[i].eAvailable == 'y'){
                    submit = true;
                }
            }

            if(submit == true){
                $scope.ExamDetails = false;
                $scope.RoundOneShow = true;
            }else{
                toastr.error("Select At least One User For Exam","Error");
            }

            console.log($scope.exam_users);
        }

    }


    if($stateParams.action == "Edit"){
        $http({
            method:'post',
            url:'/exam_details_edit',
            dataType:'json',
            data:{"iExamId":$stateParams.id}
        }).then(function(res){
            console.log(res.data);
            $scope.examdata = {
                "vTitle":res.data.vTitle,
                "vDescription":res.data.vDescription,
                "eExamType":res.data.eExamType,
                "eExamSubType":res.data.eExamSubType,
                "iRoundOneId":res.data.iRoundOneId,
                "iRoundTwoId":res.data.iRoundTwoId,
                "RoundOneScheduleId":res.data.RoundOneScheduleId,
                "RoundTwoScheduleId":res.data.RoundTwoScheduleId
            };
            console.log($scope.examdata);
            $scope.examQuestionROne = res.data.RoundOne;
            $scope.vsqExamQuestion = res.data.RoundTwo;
            $scope.examQuestionOne = res.data.RoundOne;
            $scope.examQuestionTwo = res.data.RoundTwo;
            console.log("Find Index of");
            console.log($scope.examQuestionOne);
            console.log($scope.examQuestionOne.length);
            console.log(res);
        },function(err){
            $state.go('client.exam');
        });
    }
    /**
     * Getting Exam User
     */
    $localForage.getItem("UserInfo").then(function(User){
        $http({
            method:'post',
            url:'/exam_users',
            dataType:'json',
            data:{"iParentId":User.iParentId}
        }).then(function(res){
            console.log("Exam User List ");
            console.log(res);
            if(res.data.status == 200){
                $scope.exam_users = res.data.exam_users;
            }else{
                //toastr.error("Please First Insert User","Error");
                // $state.go('client.users');
            }
        },function(err){
            $state.go('client.exam');
        });
    });

    /**
     * Generate Round One Question List
     */

    $scope.RoundOnefn = function(){
            console.log("Round One Function Call");
            console.log($scope.examdata);
            // $scope.questionStatusROne = [];
            // $scope.questionSelectedROne = [];
            // $scope.examQuestionROne = [];
            // $scope.dtInstanceQuestionROne = {};
            $scope.dtColumnsROne = [
                DTColumnBuilder.newColumn("iQuestionId", "Question Id").withOption('name', 'iQuestionId'),
                DTColumnBuilder.newColumn("vModeName", "Difficulty level").withOption('name', 'vModeName'),
                DTColumnBuilder.newColumn("eTypeQuestion", "Question Type").withOption('name', 'eTypeQuestion'),
                DTColumnBuilder.newColumn("vQuestion", "Question").withOption('name', 'vQuestion'),
                DTColumnBuilder.newColumn("vAnswer", "Answer").withOption('name', 'vAnswer'),
                DTColumnBuilder.newColumn(null).withTitle('Status').notSortable().renderWith(actionsHtmlRoundOne),
                // DTColumnBuilder.newColumn("Status",'Status').withOption('name','Status').notSortable(),
                // DTColumnBuilder.newColumn("operation",'Operation').withOption('name','operation').notSortable()
            ];

            $scope.dtOptionsROne = DTOptionsBuilder.newOptions().withOption('ajax',{
                dataSrc:"data",
                url:'/list_mcq',
                type:'POST',
                dataType:'json',
                data:function(d){
                    d.eExamType = $scope.examdata.eExamType;
                    d.eExamSubType = $scope.examdata.eExamSubType;
                    d.CustomSearch = $scope.searchOne;
                }
            })  .withOption('processing', true) //for show progress bar
                .withOption('serverSide', true) // for server side processing
                .withPaginationType('full_numbers') // for get full pagination options // first / last / prev / next and page numbers
                .withDisplayLength(10) // Page size
                .withOption('aaSorting',[0,'desc'])
                .withOption('createdRow',function(nRow, aData, iDisplayIndex, iDisplayIndexFull){
                    $compile(nRow)($scope);
                });

    }

    function actionsHtmlRoundOne(data, type, full, meta) {
        if($scope.questionSelectedROne[data.iQuestionId] != 'y'){
            $scope.questionStatusROne[data.iQuestionId] = 'n';
        }

        if($scope.examQuestionOne.indexOf(data.iQuestionId) >= 0){
            console.log(true);
            $scope.questionStatusROne[data.iQuestionId] = 'y';
        }
        // var temp = '<input bs-switch ng-model="questionStatusROne['+data.iQuestionId+']" class="switch-small" type="checkbox" ng-true-value="&apos;y&apos;" ng-false-value="&apos;n&apos;" ng-change="qOperationRoundOne('+data.iQuestionId+',&apos;status&apos;,questionStatusROne['+data.iQuestionId+'])">';

        var temp = '<div class="switch">' +
            '<label>' +
            '<input type="checkbox" ng-model="questionStatusROne['+data.iQuestionId+']" ng-true-value="&apos;y&apos;" ng-false-value="&apos;n&apos;" ng-change="qOperationRoundOne('+data.iQuestionId+',&apos;status&apos;,questionStatusROne['+data.iQuestionId+'])"> '+
            '<span class="lever"></span></label>'+
            '</div>';


        return temp;



    }

    $scope.qOperationRoundOne = function(id,vOperation,eStatus){
        $scope.questionSelectedROne[id] = eStatus;
        // if(eStatus == 'y'){
        //     $scope.examQuestionROne.push(id);
        // }else{
        //     $scope.examQuestionROne.splice(getexamQuestionROneIndex(id),1);
        // }

        if($stateParams.action == "Edit"){
            if(eStatus == 'y'){
                $scope.examQuestionROneUpdate.push(id);
            }else{
                $scope.examQuestionROneUpdate.splice(getexamQuestionROneIndex(id,$scope.examQuestionROneUpdate),1);
            }
        }else{
            if(eStatus == 'y'){
                $scope.examQuestionROne.push(id);
            }else{
                $scope.examQuestionROne.splice(getexamQuestionROneIndex(id,$scope.examQuestionROne),1);
            }
        }



    }

    function getexamQuestionROneIndex(Id,data){
        for(var i=0; i<data.length;i++){
            if(data[i] === Id){
                return i;
            }
        }
    }

    $scope.SelectedROneQuestion = function(){
        $scope.RoundOneShow = false;
        $scope.RoundTwoShow = true;
    }

    /**
     * Generate Round Two Question
     */

    $scope.RoundTwofn = function(){
        console.log("McqExam");
        // $scope.vsqQuestionStatus = [];
        // $scope.vsqQuestionSelected = [];
        // $scope.vsqExamQuestion = [];
        //$scope.dtInstanceQuestionRTwo = {};
        /**
         * Generate Question List
         */

        $scope.dtColumnsRTwo = [
            DTColumnBuilder.newColumn("iQuestionId", "Question Id").withOption('name', 'iQuestionId'),
            DTColumnBuilder.newColumn("vModeName", "Difficulty level").withOption('name', 'vModeName'),
            DTColumnBuilder.newColumn("eTypeQuestion", "Question Type").withOption('name', 'eTypeQuestion'),
            DTColumnBuilder.newColumn("vQuestion", "Question").withOption('name', 'vQuestion'),
            DTColumnBuilder.newColumn("vAnswer", "Answer").withOption('name', 'vAnswer'),
            DTColumnBuilder.newColumn(null).withTitle('Status').notSortable().renderWith(actionsHtmlRoundTwo),
            // DTColumnBuilder.newColumn("Status",'Status').withOption('name','Status').notSortable(),
            // DTColumnBuilder.newColumn("operation",'Operation').withOption('name','operation').notSortable()
        ];



        $scope.dtOptionsRTwo = DTOptionsBuilder.newOptions().withOption('ajax',{
            dataSrc:"data",
            url:'/list_vsq',
            type:'POST',
            dataType:'json',
            data:function(d){
                d.vModeName = $scope.examdata.vModeName;
                d.eTypeQuestion = $scope.examdata.eTypeQuestion;
                d.CustomSearch = $scope.searchTwo;
            }
        }).withOption('processing', true) //for show progress bar
            .withOption('serverSide', true) // for server side processing
            .withPaginationType('full_numbers') // for get full pagination options // first / last / prev / next and page numbers
            .withDisplayLength(10) // Page size
            .withOption('aaSorting',[0,'desc'])
            .withOption('createdRow',function(nRow, aData, iDisplayIndex, iDisplayIndexFull){
                $compile(nRow)($scope);
            });


    }

    function actionsHtmlRoundTwo(data, type, full, meta) {
        if($scope.vsqQuestionSelected[data.iQuestionId] != 'y'){
            $scope.vsqQuestionStatus[data.iQuestionId] = 'n';
        }
        if($scope.examQuestionTwo.indexOf(data.iQuestionId) >= 0){
            console.log(true);
            $scope.vsqQuestionStatus[data.iQuestionId] = 'y';
        }
        var temp = '<div class="switch">' +
            '<label>' +
            '<input type="checkbox" ng-model="vsqQuestionStatus['+data.iQuestionId+']" ng-true-value="&apos;y&apos;" ng-false-value="&apos;n&apos;"  ng-change="qOperationRoundTwo('+data.iQuestionId+',&apos;status&apos;,vsqQuestionStatus['+data.iQuestionId+'])"> '+
            '<span class="lever"></span></label>'+
            '</div>';
        // var temp = '<input bs-switch ng-model="vsqQuestionStatus['+data.iQuestionId+']" class="switch-small" type="checkbox" ng-true-value="&apos;y&apos;" ng-false-value="&apos;n&apos;" ng-change="qOperationRoundTwo('+data.iQuestionId+',&apos;status&apos;,vsqQuestionStatus['+data.iQuestionId+'])">';
        return temp;
    }

    $scope.qOperationRoundTwo = function(id,vOperation,eStatus){
        $scope.vsqQuestionSelected[id] = eStatus;
        console.log($scope.vsqQuestionSelected);
        // if(eStatus == 'y'){
        //     $scope.vsqExamQuestion.push(id);
        // }else{
        //     $scope.vsqExamQuestion.splice(getvsqExamQuestionIndex(id),1);
        // }

        if($stateParams.action == "Edit"){
            if(eStatus == 'y'){
                $scope.vsqExamQuestionUpdate.push(id);
            }else{
                $scope.vsqExamQuestionUpdate.splice(getvsqExamQuestionIndex(id,$scope.vsqExamQuestionUpdate),1);
            }
        }else{
            if(eStatus == 'y'){
                $scope.vsqExamQuestion.push(id);
            }else{
                $scope.vsqExamQuestion.splice(getvsqExamQuestionIndex(id,$scope.vsqExamQuestion),1);
            }
        }


    }

    function getvsqExamQuestionIndex(Id,array){
        for(var i=0; i<array.length;i++){
            if(array[i] === Id){
                return i;
            }
        }
    }

    $scope.vsqQuestion = function(){
        var ExamUser = [];
        if($stateParams.action == "Add"){

            for(var i = 0; i < $scope.exam_users.length ; i++){
                if($scope.exam_users[i].iExamId == 0 && $scope.exam_users[i].iScheduleId == 0 && $scope.exam_users[i].eAvailable == "y"){
                    console.log(true);
                    ExamUser.push($scope.exam_users[i]);
                }
            }
            console.log({"iRoundOneQuestion":$scope.examQuestionROne,
                "iRoundTwoQuestion":$scope.vsqExamQuestion,
                "vTitle":$scope.examdata.vTitle,
                "vDescription":$scope.examdata.vDescription,
                "ExamUser":ExamUser});

            $http({
                method:'post',
                url:'/exam_generate',
                dataType:'json',
                data:{"iRoundOneQuestion":$scope.examQuestionROne,
                    "iRoundTwoQuestion":$scope.vsqExamQuestion,
                    "vTitle":$scope.examdata.vTitle,
                    "vDescription":$scope.examdata.vDescription,
                    "eExamType":$scope.examdata.eExamType,
                    "eExamSubType":$scope.examdata.eExamSubType,
                    "ExamUser":ExamUser}
            }).then(function(res){
                console.log(res);
                if(res.data.status == 200){
                    toastr.success("Exam Generated Successfully","Success");
                    $state.go('client.exam');
                }else{
                    toastr.error(res.data.message,"Error");
                    $state.go('client.exam');
                }
            },function(err){
                toastr.error("Exam Generated Successfully","Error");
                $state.go('client.exam');
            });

        }else if($stateParams.action == "Edit"){
            console.log($scope.exam_users);
            var examUser = [];
            for(var i = 0; i< $scope.exam_users.length;i++){
                if($scope.exam_users[i].iExamId == $scope.examdata.iRoundOneId){
                    console.log("Check For USers");
                    if($scope.exam_users[i].eAvailable == 'y'){
                        examUser.push({
                            "eAvailable":$scope.exam_users[i].eAvailable,
                            "iExamId":$scope.exam_users[i].iExamId,
                            "iExamUserId":$scope.exam_users[i].iExamUserId,
                            "iParentId":$scope.exam_users[i].iParentId,
                            "iScheduleId":$scope.exam_users[i].iScheduleId,
                            "iUserId":$scope.exam_users[i].iUserId,
                            "isNewUser":false
                        });
                    }else{
                        examUser.push({
                            "eAvailable":$scope.exam_users[i].eAvailable,
                            "iExamId":0,
                            "iExamUserId":$scope.exam_users[i].iExamUserId,
                            "iParentId":$scope.exam_users[i].iParentId,
                            "iScheduleId":0,
                            "iUserId":$scope.exam_users[i].iUserId,
                            "isNewUser":false
                        });
                    }
                }
                if($scope.exam_users[i].iExamId == 0 && $scope.exam_users[i].eAvailable == 'y'){
                    console.log("Check For USersasdfasdfasdfasdfasdfadsf");
                    examUser.push({
                        "eAvailable":$scope.exam_users[i].eAvailable,
                        "iExamId":$scope.examdata.iRoundOneId,
                        "iExamUserId":$scope.exam_users[i].iExamUserId,
                        "iParentId":$scope.exam_users[i].iParentId,
                        "iScheduleId":$scope.examdata.RoundOneScheduleId,
                        "iUserId":$scope.exam_users[i].iUserId,
                        "isNewUser":true
                    });
                }
            }
            var postData = {
                "iRoundOneId":$scope.examdata.iRoundOneId,
                "iRoundTwoId":$scope.examdata.iRoundTwoId,
                "RoundOneScheduleId":$scope.examdata.RoundOneScheduleId,
                "RoundTwoScheduleId":$scope.examdata.RoundTwoScheduleId,
                "vDescription":$scope.examdata.vDescription,
                "vTitle":$scope.examdata.vTitle,
                "eExamType":$scope.examdata.eExamType,
                "eExamSubType":$scope.examdata.eExamSubType,
                "RoundOneQuestion":$scope.examQuestionROneUpdate,
                "RoundOneOldQuestion":$scope.examQuestionROne,
                "RoundTwoQuestion":$scope.vsqExamQuestionUpdate,
                "RoundTwoOldQuestion":$scope.vsqExamQuestion,
                "ExamUser":examUser
            }
            console.log(postData);
            $http({
                method:'post',
                url:'/exam_details_update',
                dataType:'json',
                data:postData
            }).then(function(res){
                console.log(res);
                if(res.data.status == 200){
                    toastr.success("Exam Updated Successfully.","Success");
                    $state.go('client.exam');
                }else{
                    toastr.error(res.data.message,"Error");
                    $state.go('client.exam');
                }
            },function(err){
                toastr.error("Exam Generated Successfully.","Error");
                $state.go('client.exam');
            });


        }


    }

    $scope.fnsearchone = function(str){
        $scope.dtInstances.dtInstanceQuestionROne.reloadData();
        if(str == 'reset'){
            $scope.searchOne = {
                panethesis:false,
                exponent:false,
                mutiplication:false,
                division:false,
                addition:false,
                subtraction:false,
                vMultiplication:""
            }
        }

        $scope.dtOptionsROne = DTOptionsBuilder.newOptions().withOption('ajax',{
            dataSrc:"data",
            url:'/list_mcq',
            type:'POST',
            dataType:'json',
            data:function(d){
                d.eExamType = $scope.examdata.eExamType;
                d.eExamSubType = $scope.examdata.eExamSubType;
                d.CustomSearch = $scope.searchOne;
            }
            }).withOption('serverSide', true) // for server side processing
            .withPaginationType('full_numbers') // for get full pagination options // first / last / prev / next and page numbers
            .withDisplayLength(10) // Page size
            .withOption('aaSorting',[0,'desc'])
            .withOption('createdRow',function(nRow, aData, iDisplayIndex, iDisplayIndexFull){
                $compile(nRow)($scope);
            });

    }

    $scope.fnsearchtwo = function(str){
        $scope.dtInstances.dtInstanceQuestionRTwo.reloadData();
        if(str == 'reset'){
            $scope.searchOne = {
                panethesis:false,
                exponent:false,
                mutiplication:false,
                division:false,
                addition:false,
                subtraction:false,
                vMultiplication:""
            }
        }
        $scope.dtOptionsROne = DTOptionsBuilder.newOptions().withOption('ajax',{
            dataSrc:"data",
            url:'/list_mcq',
            type:'POST',
            dataType:'json',
            data:function(d){
                d.eExamType = $scope.examdata.eExamType;
                d.eExamSubType = $scope.examdata.eExamSubType;
                d.CustomSearch = $scope.searchTwo;
            }
        }).withOption('serverSide', true) // for server side processing
            .withPaginationType('full_numbers') // for get full pagination options // first / last / prev / next and page numbers
            .withDisplayLength(10) // Page size
            .withOption('aaSorting',[0,'desc'])
            .withOption('createdRow',function(nRow, aData, iDisplayIndex, iDisplayIndexFull){
                $compile(nRow)($scope);
            });

    }

});
