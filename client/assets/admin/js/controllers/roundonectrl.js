angular.module('main').controller('RoundOneCtrl',function ($scope,$http,$rootScope,toastr,$state,DTOptionsBuilder, DTColumnBuilder,$compile,mySocket,$localForage,$stateParams) {
    console.log("RoundOneCtrl");
    console.log($stateParams);
    $scope.questionStatus = [];
    $scope.questionSelected = [];
    $scope.examQuestion = [];
    $scope.showTable = false;
    $scope.clock = true;
    $scope.showLoading = false;
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




    $scope.startGame = function(){
        $localForage.getItem('examUser').then(function(examUser){
            $localForage.getItem('mcqQuestion').then(function(mcqQuestion){
                $localForage.getItem('vsqQuestion').then(function(vsqQuestion){
                   $localForage.getItem('RoundOne').then(function(RoundOne){
                       $localForage.getItem('RoundTwo').then(function (RoundTwo) {

                           $scope.showLoading = true;
                           /**
                            * Generate Datatable
                            */
                           $scope.examQuestion = mcqQuestion;
                           console.log($scope.examQuestion);
                           /**
                            * Socket Part
                            */
                           console.log({"examUser":examUser,"mcqQuestion":mcqQuestion,"vsqQuestion":vsqQuestion,"RoundOne":RoundOne,"RoundTwo":RoundTwo});
                           mySocket.emit('startGame',{"examUser":examUser,"mcqQuestion":mcqQuestion,"vsqQuestion":vsqQuestion,"RoundOne":RoundOne,"RoundTwo":RoundTwo});
                           mySocket.on('vRoundOneAns',function(data){
                               console.log(data);
                           });
                           /**
                            * Start Clock call
                            */
                           setTimeout(function(){
                               $scope.$apply(function(){
                                   $scope.showLoading = false;
                                   $scope.showTable = true;
                                   $scope.clock = false;
                                   clock.start();
                               });
                               console.log("Start Game");
                            },33*1000);
                        });
                   });
                });
            });
        });
    }

    /**
     * Generate Question List
     */

    $scope.dtInstanceQuestion = {};
    console.log("generate datatable call");

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
              url:'/list_mcq',
              type:'POST',
              dataType:'json',
              // data:function(d){
              //     $scope.questionStatus = [];
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

                if($scope.questionSelected[data.iQuestionId] != 'y'){
                    $scope.questionStatus[data.iQuestionId] = 'n';
                }
                console.log($scope.examQuestion);
                if($scope.examQuestion.indexOf(data.iQuestionId) >= 0){
                    console.log(true);
                    $scope.questionStatus[data.iQuestionId] = 'y';
                }else{
                    console.log(false);
                }
                var temp = '<input bs-switch ng-model="questionStatus['+data.iQuestionId+']" class="switch-small" type="checkbox" ng-true-value="&apos;y&apos;" ng-false-value="&apos;n&apos;" ng-change="qOperation('+data.iQuestionId+',&apos;status&apos;,questionStatus['+data.iQuestionId+'])">';
                return temp;
    }

     $scope.qOperation = function(id,vOperation,eStatus){
            $scope.questionSelected[id] = eStatus;
            var changeQuestion= {};
            if(eStatus == 'y'){
                changeQuestion = {
                    'status':'enable',
                    'iQuestion':id
                }
                $scope.examQuestion.push(id);
                console.log($scope.questionSelected);
            }else{
                changeQuestion = {
                    'status':'disable',
                    'iQuestion':id
                }
                $scope.examQuestion.splice(getExamQuestionIndex(id),1);
                console.log($scope.questionSelected);
            }
            console.log('changeQuestion');
            mySocket.emit('ChangeRoundOneQuestion',changeQuestion);
     }

     function getExamQuestionIndex(Id){

         for(var i=0; i<$scope.examQuestion.length;i++){
                if($scope.examQuestion[i] === Id){
                    return i;
                }
         }
     }




});