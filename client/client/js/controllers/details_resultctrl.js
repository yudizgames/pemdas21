/**
 * Created by YudizAshish on 03/04/17.
 */
angular.module('client').controller('DetailResultCtrl',function ($scope,$rootScope,$resource,$http,$stateParams) {
    $scope.postData = {
        ROneParticipantId:$stateParams.ROneParticipantId,
        RTwoParticipantId:$stateParams.RTwoParticipantId
    }
    console.log($stateParams);
    $scope.iUserId = $stateParams.iUserId;
    $http({
        method:'post',
        url:'/detail_result',
        dataType:'json',
        data:$scope.postData
    }).then(function(res){
        $scope.resultOne = res.data.RoundOne;
        $scope.resultTWo = res.data.RoundTwo;
        $scope.tryagain = res.data.TryAgain;
        console.log("Success call");
        console.log(res);
    },function(err){
        console.log("Error");
        console.log(err);
    });



});