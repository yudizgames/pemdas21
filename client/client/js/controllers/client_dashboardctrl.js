/**
 * Created by YudizAshish on 20/03/17.
 */
'use strict';
angular.module('client').controller('ClientDashboardCtrl',function ($scope,$state,$http,$localForage) {
    console.log("Dashboard controller Under Client");
    $localForage.getItem('UserInfo').then(function(data){
        $http({
            method:'get',
            url:'/ws/v1/profile',
            dataType:'json',
        }).then(function(res){
            $scope.profile =  res.data.profile;
            data.iParentId = res.data.profile.iParentId
            $localForage.setItem('UserInfo',data);
        },function(err){
            console.log("Error");
            console.log(err);
        });

        $http({
            method:'post',
            url:'/dashboard',
        }).then(function(res){
            console.log(res);
            $scope.data = res.data;
        },function (err) {
            console.log(err);
        })
    });
});