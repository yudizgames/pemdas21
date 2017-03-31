/**
 * Created by YudizAshish on 20/03/17.
 */
'use strict';
angular.module('admin').controller('AdminCtrl',function ($scope,$http,$rootScope,toastr,$state,$localForage){
    console.log("Admin Controller call");
    $localForage.getItem('UserInfo').then(function (data) {
        console.log("Inside admin controller");
        console.log(data);
        $rootScope.vUserName = data.vUserName;
    });

    // $http({
    //     method:'get',
    //     url:'/ws/v1/profile',
    //     dataType:'json',
    // }).then(function(res){
    //     $scope.profile =  res.data.profile;
    // },function(err){
    //     console.log("Error");
    //     console.log(err);
    // });

    $scope.logout = function(){
        console.log("Log out call");
        $http({
            method:'post',
            url:'/logout',
            dataType:'json'
        }).then(function(res){
            if(res.data.status == 200){
                $localForage.clear('UserInfo').then(function(res){
                    $state.transitionTo('login');
                });
            }
        });
    }
});