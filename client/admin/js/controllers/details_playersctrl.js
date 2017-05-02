/**
 * Created by YudizAshish on 22/03/17.
 */
angular.module('admin').controller('UserDetailsCtrl',function ($scope,$rootScope,$resource,$http,$stateParams) {
    var postData = {
        'id':$stateParams.id+'',
        'vOperation':'view'
    }
    $scope.iUserId = $stateParams.id;

    console.log("User Details Ctrl");
    $http({
        method:'post',
        url:'/statistics_by_user',
        dataType:'json',
        data:{iUserId:$stateParams.id}
    }).then(function(res){
        console.log("Success casdfasdfasdfasdfasdfasdfasdfasdfasdfasdfadsfasdfasdfall");
        console.log(res);
        $scope.data = res.data.tempResult;
        $scope.user = res.data.User[0];
        cosnole.log($scope.user);
    },function(err){
        console.log("Error");
        console.log(err);
    });

});