angular.module('client').controller('ExamDetailsCtrl',function ($scope,$rootScope,$resource,$http,$stateParams) {
    var postData = {
        'iExamId':$stateParams.id+'',
    }
    $http({
        method:'post',
        url:'/exam_details',
        dataType:'json',
        data:postData
    }).then(function(res){
        console.log(res);
        if(res.status == 200) {
            $scope.Exam = res.data.Exam;
            $scope.RoundOne = res.data.RoundOne;
            $scope.RoundTwo = res.data.RoundTwo;
            $scope.Users = res.data.Users;
        }else{
            toast.error("Something Wrong","Error");
            $state.go('client.exam');
        }
    },function(err){
        toastr.error("Exam Generated Successfully","Error");
        $state.go('client.exam');
    });
});