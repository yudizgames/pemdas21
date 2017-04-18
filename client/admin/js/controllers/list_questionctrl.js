/**
 * Created by YudizAshish on 21/03/17.
 */
angular.module('admin').controller('QuestionCtrl',function ($scope,$http,$rootScope,toastr,$state,DTOptionsBuilder, DTColumnBuilder,$compile) {
    console.log("Question controller call");

    $scope.search={
        mcq:false,
        vsq:false,
        panethesis:false,
        exponent:false,
        mutiplication:false,
        division:false,
        addition:false,
        subtraction:false
    }
    $scope.searchCount = 0;

    $scope.questionStatus = [];
    /**
     * Generate Question List
     */
    $scope.dtInstanceQuestion = {};
    function listQuestion(){
        $rootScope.hideLoad = false;  //Loading Stop For Network Operation Start
        $http.post('/question').then(function(response) {
            console.log("Success");
            console.log(response);
            $scope.questions = response.data.result;
            $rootScope.hideLoad = true; //Loading Stop For Network Operation Success
        },function(err){
            console.log("Something wrong in list");
            $rootScope.hideLoad = true; //Loading Stop For Network Operation Error
        });
    }

    $scope.dtColumns = [
        // DTColumnBuilder.newColumn("iQuestionId", "Question Id").withOption('name', 'iQuestionId'),
        DTColumnBuilder.newColumn("vModeName", "Difficulty level").withOption('name', 'vModeName'),
        DTColumnBuilder.newColumn("eType", "Type").withOption('name', 'eType'),
        DTColumnBuilder.newColumn("eTypeQuestion", "Type").withOption('name', 'eTypeQuestion'),
        DTColumnBuilder.newColumn("vQuestion", "Question").withOption('name', 'vQuestion'),
        DTColumnBuilder.newColumn("vAnswer", "Answer").withOption('name', 'vAnswer'),
        DTColumnBuilder.newColumn(null).withTitle('Status').notSortable().renderWith(actionsHtml).notSortable(),
        // DTColumnBuilder.newColumn("Status",'Status').withOption('name','Status').notSortable(),
        DTColumnBuilder.newColumn("operation",'Operation').withOption('name','operation').notSortable()
    ];

    $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
        dataSrc:"data",
        url:'/list_q',
        type:'POST',
        dataType:'json',
        data:function(d){
            d.CustomSearch = $scope.search;
            $scope.questionStatus = [];
        }
    }).withOption('processing', true) //for show progress bar
        .withOption('serverSide', true) // for server side processing
        .withPaginationType('full_numbers') // for get full pagination options // first / last / prev / next and page numbers
        .withDisplayLength(10) // Page size
        // .withOption('aaSorting')
        .withOption('createdRow',function(nRow, aData, iDisplayIndex, iDisplayIndexFull){
            $compile(nRow)($scope);
    });

    function actionsHtml(data, type, full, meta) {
        $scope.questionStatus[data.iQuestionId] = data.eStatus;
        var temp = '<div class="switch">' +
            '<label>' +
            '<input type="checkbox" ng-model="questionStatus['+data.iQuestionId+']" ng-true-value="&apos;y&apos;" ng-false-value="&apos;n&apos;" ng-change="qOperation('+data.iQuestionId+',&apos;status&apos;,questionStatus['+data.iQuestionId+'])"> '+
            '<span class="lever"></span></label>'+
            '</div>';


        // var temp = '<input bs-switch ng-model="questionStatus['+data.iQuestionId+']" class="switch-small" type="checkbox" ng-true-value="&apos;y&apos;" ng-false-value="&apos;n&apos;" ng-change="qOperation('+data.iQuestionId+',&apos;status&apos;,questionStatus['+data.iQuestionId+'])">';
        return temp;
    }


    /**
     * Question Operation View,Status,Delete
     */
    $scope.qOperation = function(id,vOperation,eStatus){
        if(vOperation == 'view'){
            $state.go('admin.viewquestion',{'id':id});
        }else if(vOperation == 'edit'){
            $state.go('admin.formquestion',{'id':id,'action':'Edit'});
        }else{

            if(vOperation == "delete"){

                var t = confirm("Are you sure want to delete this question");
                if(t == true){

                    $http({
                        method:'post',
                        url:'/questionoperation',
                        dataType:'json',
                        data:{'iQuestionId':id+'','vOperation':vOperation,'eStatus':eStatus}
                    }).then(function(res){
                        console.log("Success call");
                        console.log(res.data.status);
                        if(res.data.status == 200){
                            if(vOperation == 'delete'){
                                $scope.dtInstanceQuestion.reloadData();
                            }
                            toastr.success(res.data.message,"Successs");
                        }else{
                            toastr.error(res.data.message,"Error");
                        }
                    },function(err){
                        console.log("Error");
                        console.log(err);
                    });

                }
            }else{
                $http({
                        method:'post',
                        url:'/questionoperation',
                        dataType:'json',
                        data:{'iQuestionId':id+'','vOperation':vOperation,'eStatus':eStatus}
                    }).then(function(res){
                        console.log("Success call");
                        console.log(res.data.status);
                        if(res.data.status == 200){
                            if(vOperation == 'delete'){
                                $scope.dtInstanceQuestion.reloadData();
                            }
                            toastr.success(res.data.message,"Successs");
                        }else{
                            toastr.error(res.data.message,"Error");
                        }
                    },function(err){
                        console.log("Error");
                        console.log(err);
                    });
                }
            }
    }


    /**
     * Search
     */
    $scope.fnsearch = function (str) {

        if(str == 'reset'){
            $scope.search={
                mcq:false,
                vsq:false,
                panethesis:false,
                exponent:false,
                mutiplication:false,
                division:false,
                addition:false,
                subtraction:false
            }
        }
        console.log($scope.dtInstanceQuestion);
        $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            dataSrc:"data",
            url:'/list_q',
            type:'POST',
            dataType:'json',
            data:function(d){
                $scope.questionStatus = [];
                d.CustomSearch = $scope.search;
            }
        })  //.withOption('processing', false) //for show progress bar
            .withOption('serverSide', true)
            .withPaginationType('full_numbers') // for get full pagination options // first / last / prev / next and page numbers
            .withDisplayLength(10) // Page size
            .withOption('aaSorting',[0,'desc'])
            .withOption('createdRow',function(nRow, aData, iDisplayIndex, iDisplayIndexFull){
                $compile(nRow)($scope);
            });
        $scope.dtInstanceQuestion.reloadData();
    }
});


