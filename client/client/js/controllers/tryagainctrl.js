/**
 * Created by YudizAshish on 03/04/17.
 */
angular.module('client').controller('TryagainCtrl',function ($scope,$rootScope,$resource,$http,$stateParams) {
    console.log("tryagain controller call");
    console.log($stateParams);
    $scope.postData = $stateParams;
    $http({
        method:'post',
        url:'/tryagain_details',
        dataType:'json',
        data:$stateParams
    }).then(function(res){
        $scope.resultOne = res.data.RoundOne;
        $scope.resultTWo = res.data.RoundTwo;
        console.log("Success call");
        console.log(res);
    },function(err){
        console.log("Error");
        console.log(err);
    });
});