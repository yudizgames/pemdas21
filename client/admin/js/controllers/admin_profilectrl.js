/**
 * Created by YudizAshish on 04/04/17.
 */
angular.module('admin').controller('AdminProfileCtrl',function ($scope,$rootScope,$resource,$http,$stateParams,toastr,$localForage) {
    console.log("Admin Profile Call");
    console.log($rootScope.vUserName);
    $http({
        method:'GET',
        url:'/ws/v1/profile',
        dataType:'json',
    }).then(function(res){
        console.log(res);
        $scope.user = {
            vEmail:res.data.profile.vEmail,
            vFullName:res.data.profile.vFullName,
            iUserId:res.data.profile.iUserId
        };
    },function(err){
        console.log("Error");
        console.log(err);
    });

    $scope.submitUser = function () {
        console.log($scope.user);
        $http({
            url:'/useroperation',
            method:'post',
            dataType:'json',
            data:{ vOperation:'edit',id:$scope.user.iUserId, vFullName:$scope.user.vFullName},
        }).then(function(res){
            if(res.status == 200){
                $localForage.getItem('UserInfo').then(function(User){
                    $rootScope.vUserName = $scope.user.vFullName;
                    User.vUserName = $scope.user.vFullName;
                    $localForage.setItem('UserInfo',User);
                });
                toastr.success(res.data.message,"Success");
            }else{
                toastr.error("Something went wrong","Error");
            }
            console.log(res);
        },function(err){
            toastr.error("Something went wrong","Error");
            console.log(err);
        });
    }
});