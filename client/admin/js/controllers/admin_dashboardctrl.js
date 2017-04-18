/**
 * Created by YudizAshish on 20/03/17.
 */
'use strict';
angular.module('admin').controller('DashboardCtrl',function ($scope,$state,$http,$rootScope,$localForage) {
    console.log("Dashboard controller");
    $localForage.getItem('UserInfo').then(function (data) {
        $http({
            method:'post',
            url:'/dashboard',
        }).then(function(res){
            console.log(res);
            $scope.data = res.data;
            for(var i = 0; i < res.data.settings.length ; i++){
                if(res.data.settings[i].vConstant == "SITENAME"){
                    console.log("Settings call for dashboard controller");
                    console.log(res.data.settings[i].vValue);
                    $rootScope.SITENAME = res.data.settings[i].vValue;
                }
            }
        },function (err) {
            console.log(err);
        })
        console.log("Inside admin controller");
        console.log(data);
        $rootScope.vUserName = data.vUserName;
    });



});