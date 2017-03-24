/**
 * Created by YudizAshish on 24/03/17.
 */
angular.module('client').controller('ExamFormCtrl',function ($scope,$rootScope,$resource,$http,$state,toastr,DTOptionsBuilder,DTColumnDefBuilder,DTColumnBuilder,$compile,$localForage) {
    $scope.examdata = {};
    $scope.ExamDetails = true;
    $scope.RoundOneShow = false;
    $scope.RoundTwoShow = false;

    /**
     * Basic exam details
     */

    $scope.submitExamDetails = function(){
        $scope.ExamDetails = false;
        $scope.RoundOneShow = true;
    }

    /**
     * Generate Round One Question List
     */

    $scope.RoundOnefn = function(){
            $scope.questionStatusROne = [];
            $scope.questionSelectedROne = [];
            $scope.examQuestionROne = [];
            $scope.dtInstanceQuestionROne = {};
            $scope.dtColumnsROne = [
                DTColumnBuilder.newColumn("iQuestionId", "Question Id").withOption('name', 'iQuestionId'),
                DTColumnBuilder.newColumn("vModeName", "Difficulty level").withOption('name', 'vModeName'),
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
                // data:function(d){
                //     $scope.questionStatusROne = [];
                // }
            }).withOption('processing', true) //for show progress bar
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
        if(eStatus == 'y'){
            $scope.examQuestionROne.push(id);
        }else{
            $scope.examQuestionROne.splice(getexamQuestionROneIndex(id),1);
        }
    }

    function getexamQuestionROneIndex(Id){
        for(var i=0; i<$scope.examQuestionROne.length;i++){
            if($scope.examQuestionROne[i] === Id){
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
        $scope.vsqQuestionStatus = [];
        $scope.vsqQuestionSelected = [];
        $scope.vsqExamQuestion = [];
        /**
         * Generate Question List
         */
        $scope.dtInstanceQuestionRTwo = {};
        $scope.dtColumnsRTwo = [
            DTColumnBuilder.newColumn("iQuestionId", "Question Id").withOption('name', 'iQuestionId'),
            DTColumnBuilder.newColumn("vModeName", "Difficulty level").withOption('name', 'vModeName'),
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
            // data:function(d){
            //     $scope.vsqQuestionStatus = [];
            // }
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
        if(eStatus == 'y'){
            $scope.vsqExamQuestion.push(id);
        }else{
            $scope.vsqExamQuestion.splice(getvsqExamQuestionIndex(id),1);
        }
    }

    function getvsqExamQuestionIndex(Id){
        for(var i=0; i<$scope.vsqExamQuestion.length;i++){
            if($scope.vsqExamQuestion[i] === Id){
                return i;
            }
        }
    }


    $scope.vsqQuestion = function(){

        $http({
            method:'post',
            url:'/exam_generate',
            dataType:'json',
            data:{"iRoundOneQuestion":$scope.examQuestionROne,"iRoundTwoQuestion":$scope.vsqExamQuestion,"vTitle":$scope.examdata.vTitle,"vDescription":$scope.examdata.vDescription}
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
    }



});
