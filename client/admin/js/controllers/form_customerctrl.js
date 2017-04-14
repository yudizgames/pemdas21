/**
 * Created by YudizAshish on 21/03/17.
 */
'use strict';
angular.module('admin').controller('CustomerFormCtrl',function ($scope,$rootScope,$state,$stateParams,$resource,$http,toastr){
    console.log("Customer  Contropller");
    console.log($state.current.data);
    $scope.form_action = $stateParams.action;
    $scope.vParentType = [{"value":"Parent","text":"Parent"},{"value":"Teacher","text":"Teacher"}];


    if($stateParams.action == "Edit"){
        loadForm();
    }

    $scope.submitUser = function(){
        $rootScope.hideLoad = false;
        console.log($scope.user);

        var submitData = {};
        //Check Insert or Update User
        if($scope.form_action == 'Edit'){
            submitData = {
                'vOperation':'edit',
                'id':$scope.user.iUserId+'',
                'vFullName':$scope.user.vFullName,
                'vParentType':$scope.user.vParentType
            };
            $http({
                method:'post',
                url:'/useroperation',
                dataType:'json',
                data:submitData
            }).then(function(res){
                $rootScope.hideLoad = true;
                console.log("Success call");
                console.log(res);
                toastr.success(res.data.message,"Successs");
                $state.go('admin.customer');
            },function(err){
                $rootScope.hideLoad = true;
                console.log("Error");
                console.log(err);
                toastr.error(res.data.message,"Error");
                $state.go('admin.customer');
            });

        }else{
            submitData = {
                'vFullName':$scope.user.vFullName,
                'vEmail':$scope.user.vEmail,
                'vParentType':$scope.user.vParentType
            };
            console.log(submitData);
            $http({
                method:'post',
                url:'/clientadd',
                dataType:'json',
                data:submitData
            }).then(function(res){
                $rootScope.hideLoad = true;
                console.log("Success call");
                console.log(res);
                if(res.data.status == 200){
                    toastr.success(res.data.message,"Successs");
                    $state.go('admin.customer');
                }else{
                    toastr.error(res.data.message,"Error");
                }
            },function(err){
                $rootScope.hideLoad = true;
                console.log("Error");
                console.log(err);
                toastr.error(res.data.message,"Error");
                $state.go('admin.customer');
            });
        }

    }

    function loadForm(){
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
    }


});

