angular.module('main').controller('ExamCtrl',function ($scope,$http,$rootScope,toastr,$state,DTOptionsBuilder, DTColumnBuilder,$compile,mySocket,$state,$localForage) {
    console.log("Exam Controoler");
    // $localForage.getItem("examQuestion").then(function(examQuestion){
    //     $localForage.getItem('examUser').then(function(examUser){
    //         console.log(examQuestion);
    //         console.log(examUser);
    //         mySocket.emit('exam',{"Questions":examQuestion,"vTitle":"Test","vDescription":Date()});
    //     });
    // });
    $scope.submitExam = function(){
        console.log($scope.exam);
        $http({
            method:'post',
            url:'/generate_exam',
            dataType:'json',
            data:{'vTitle':$scope.exam.vTitle,'vDescription':$scope.exam.vDescription}
        }).then(function(res){
            console.log("Success call");
            console.log(res.data);
            $localForage.setItem('iExamId',res.data.data.iExamId);
            $localForage.setItem('iScheduleId',res.data.data.iScheduleId);
        },function(err){
            console.log("Error");
            console.log(err);
        });
    }

    $scope.startExam = function () {
        console.log("startExam call");
        $localForage.getItem("examUser").then(function(examUser){
            $localForage.getItem("examQuestion").then(function(examQuestion){
                $localForage.getItem("iExamId").then(function(iExamId){
                    $localForage.getItem("iScheduleId").then(function(iScheduleId){
                        console.log({"examUser":examUser,"examQuestion":examQuestion,"iExamId":iExamId,"iScheduleId":iScheduleId});
                        mySocket.emit('startGame',{"examUser":examUser,"examQuestion":examQuestion,"iExamId":iExamId,"iScheduleId":iScheduleId});
                        mySocket.on('vAnswer',function(data){
                            console.log(data);
                        });
                    });
                });
            });
        });
    }



});