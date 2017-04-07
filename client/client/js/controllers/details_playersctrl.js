/**
 * Created by YudizAshish on 22/03/17.
 */
angular.module('client').controller('PlayerDetailsCtrl',function ($scope,$rootScope,$resource,$http,$stateParams) {
    var postData = {
        'id':$stateParams.id+'',
        'vOperation':'view'
    }
    $scope.iUserId = $stateParams.id;
    $http({
        method:'post',
        url:'/useroperation',
        dataType:'json',
        data:postData
    }).then(function(res){
        console.log("Success call");
        console.log(res);
        $scope.user = res.data.result[0];
        console.log($scope.user);
    },function(err){
        console.log("Error");
        console.log(err);
    });

    $http({
        method:'post',
        url:'/statistics_by_user',
        dataType:'json',
        data:{iUserId:$stateParams.id}
    }).then(function(res){
        console.log("Success call");
        console.log(res);
        $scope.data = res.data.tempResult;
        $scoe.user = res.data.User[0];
    },function(err){
        console.log("Error");
        console.log(err);
    });

});