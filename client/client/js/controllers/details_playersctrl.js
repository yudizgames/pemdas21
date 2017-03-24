/**
 * Created by YudizAshish on 22/03/17.
 */
angular.module('client').controller('PlayerDetailsCtrl',function ($scope,$rootScope,$resource,$http,$stateParams) {
    var postData = {
        'id':$stateParams.id+'',
        'vOperation':'view'
    }
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
});