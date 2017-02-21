angular.module('main').controller('ExamUserCtrl',function ($scope,$http,$rootScope,toastr,$state,DTOptionsBuilder, DTColumnBuilder,$compile,mySocket,$state,$localForage) {
    console.log("ExamUser Controller")
    mySocket.on('test',function(data){
        console.log(data);
    });
    $localForage.removeItem('examUser');
    mySocket.on('listUser',function (data) {
        $scope.$apply(function(){
            $scope.examUser = data.data;
            console.log(data.data);
        });
    });
    
    $scope.sendQutsion = function(){
        console.log($scope.examUser);
        mySocket.emit('examUser',{data:$scope.examUser});
        $localForage.setItem('examUser',$scope.examUser)
        $state.go('admin.mcqexam');         
    }
});
