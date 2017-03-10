angular.module('main').controller('RoundTwoCtrl',function ($scope,$http,$rootScope,toastr,$state,DTOptionsBuilder, DTColumnBuilder,$compile,mySocket,$localForage,$stateParams) {
    console.log('Round Two call');
    $scope.vsqQuestionStatus = [];
    $scope.vsqQuestionSelected = [];
    $scope.vsqExamQuestion = [];
    $scope.showTableTwo = false;
    $scope.showLoading = true;
    mySocket.emit('RoundTwoStart',{status:200,message:'Round Two Start'});
    var clock;
    clock = $(".clock").FlipClock({
        clockFace: 'MinuteCounter',
        countdown: true,
        callbacks: {
            stop: function() {
                console.log("Stop call");
            }
        }
    });
    // 212.13 Actual Time For
    clock.setTime(180); /* set time here - measured in seonds, e.g 60=1 minute; use http://www.calculateme.com/Time/Days/ToSeconds.htm to calculate proper value*/
    clock.setCountdown(true);



    /**
     * Process Data table
     */
    $localForage.getItem('vsqQuestion').then(function(vsqQuestion){
        console.log(vsqQuestion);
        console.log("Log call");

        roundOnetimeOut = setTimeout(function(){
            $scope.$apply(function(){
                $scope.showLoading = false;
                $scope.vsqExamQuestion = vsqQuestion;
                $scope.showTableTwo = true;
                console.log(clock.start());
                clock.start();
            });
        },3*1000);
    });

    /**
     * Generate Question List
     */
    $scope.dtInstanceQuestion = {};
    $scope.dtColumns = [
        DTColumnBuilder.newColumn("iQuestionId", "Question Id").withOption('name', 'iQuestionId'),
        DTColumnBuilder.newColumn("vModeName", "Difficulty level").withOption('name', 'vModeName'),
        DTColumnBuilder.newColumn("vQuestion", "Question").withOption('name', 'vQuestion'),
        DTColumnBuilder.newColumn("vAnswer", "Answer").withOption('name', 'vAnswer'),
        DTColumnBuilder.newColumn(null).withTitle('Status').notSortable().renderWith(actionsHtml),
        // DTColumnBuilder.newColumn("Status",'Status').withOption('name','Status').notSortable(),
        // DTColumnBuilder.newColumn("operation",'Operation').withOption('name','operation').notSortable()
    ];

    $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
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


    function actionsHtml(data, type, full, meta) {
        if($scope.vsqQuestionSelected[data.iQuestionId] != 'y'){
            $scope.vsqQuestionStatus[data.iQuestionId] = 'n';
        }
        console.log($scope.vsqExamQuestion);
        console.log($scope.vsqExamQuestion.indexOf(9));
        if($scope.vsqExamQuestion.indexOf(data.iQuestionId) >= 0){
            console.log(true);
            $scope.vsqQuestionStatus[data.iQuestionId] = 'y';
        }else{
            console.log(false);
        }
        var temp = '<input bs-switch ng-model="vsqQuestionStatus['+data.iQuestionId+']" class="switch-small" type="checkbox" ng-true-value="&apos;y&apos;" ng-false-value="&apos;n&apos;" ng-change="qOperation('+data.iQuestionId+',&apos;status&apos;,vsqQuestionStatus['+data.iQuestionId+'])">';
        return temp;
    }

    $scope.qOperation = function(id,vOperation,eStatus){
        var changeQuestion = {};
        $scope.vsqQuestionSelected[id] = eStatus;
        console.log($scope.vsqQuestionSelected);

        if(eStatus == 'y'){
            changeQuestion = {
                'status':'enable',
                'iQuestion':id
            }
            $scope.vsqExamQuestion.push(id);
        }else{
            changeQuestion = {
                'status':'disable',
                'iQuestion':id
            }
            $scope.vsqExamQuestion.splice(getvsqExamQuestionIndex(id),1);
        }
        console.log(changeQuestion);
        mySocket.emit('ChangeRoundTwoQuestion',changeQuestion);
        console.log($scope.vsqExamQuestion.length);
    }


    function getvsqExamQuestionIndex(Id){
        for(var i=0; i<$scope.vsqExamQuestion.length;i++){
            if($scope.vsqExamQuestion[i] === Id){
                return i;
            }
        }
    }

    mySocket.on('vRoundTwoAns',function(data){
        console.log(data);
    });

});