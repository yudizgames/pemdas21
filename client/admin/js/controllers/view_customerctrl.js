/**
 * Created by YudizAshish on 21/03/17.
 */
angular.module('admin').controller('CustomerViewCtrl',function ($scope,$stateParams,$resource,$http) {
    console.log("Cleint Details controller call");
    console.log($stateParams.id);
    var postData = {
        'id':$stateParams.id,
        'vOperation':'view'
    }
    $http({
        method:'post',
        url:'/clientoperation',
        dataType:'json',
        data:postData
    }).then(function(res){
        console.log("Success call");
        console.log(res);
        $scope.profile = res.data.result;
        $scope.child = res.data.result.child;
        console.log($scope.child);
        console.log($scope.profile);
    },function(err){
        console.log("Error");
        console.log(err);
    });
});

