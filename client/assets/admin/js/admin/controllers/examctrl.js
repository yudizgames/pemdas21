angular.module('main').controller('ExamCtrl',function ($scope,$http,$rootScope,toastr,$state,DTOptionsBuilder, DTColumnBuilder,$compile,mySocket,$state,$localForage) {
    console.log("Exam Controoler");
    // $localForage.getItem("examQuestion").then(function(examQuestion){
    //     $localForage.getItem('examUser').then(function(examUser){
    //         console.log(examQuestion);
    //         console.log(examUser);
    //         mySocket.emit('exam',{"Questions":examQuestion,"vTitle":"Test","vDescription":Date()});
    //     });
    // });
    $scope.status = true;
    $scope.submitExam = function(){
        console.log($scope.exam);
        $http({
            method:'post',
            url:'/generate_exam',
            dataType:'json',
            data:{'vTitle':$scope.exam.vTitle,'vDescription':$scope.exam.vDescription}
        }).then(function(res){
            console.log("Success call");
            console.log(res.data.data.RoundOne);
            console.log(res.data.status);
            if(res.data.status === 200)
            {   console.log("inside if");
                $scope.status = false;
                console.log(res.data);
                $localForage.setItem('RoundOne',res.data.data.RoundOne);
                $localForage.setItem('RoundTwo',res.data.data.RoundTwo);
                $state.go('admin.roundone');
            }
        },function(err){
            console.log("Error");
            console.log(err);
        });
    }

    // $scope.startExam = function () {
    //     console.log("startExam call");
    //
    // }



});