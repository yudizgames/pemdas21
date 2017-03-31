/**
 * Created by YudizAshish on 21/03/17.
 */
'use strict';
angular.module('admin').controller('CustomerCtrl',function ($scope,$rootScope,$resource,$http,$state,toastr) {
    console.log("Cleints controller call");
    $scope.users = [];
    $scope.iTotalUser = 0;
    $scope.loadMore = function(){
        if($scope.iTotalUser > $scope.users.length || $scope.iTotalUser == 0){
            $http({
                url:'/total_users',
                method:'post',
                data:{offset:$scope.users.length,limit:10}
            }).then(function(res){
                $scope.iTotalUser = res.data.TotalUsers;
                for(var i = 0; i< res.data.Users.length;i++){
                    $scope.users.push(res.data.Users[i]);
                    console.log($scope.users);
                }
                if($scope.users.length == iTotalUser){
                    $scope.disable = true;
                }
                console.log("Success Call");
                console.log(res);
            },function(err){
                console.log(err);
            });
        }
    }

    $scope.userOperation = function(iUserId,OperationType){
        console.log("Operation Type");
        console.log(iUserId);
        console.log(OperationType);
        var postData = {
            'id':iUserId+"",
            'vOperation':OperationType
        }

        if(OperationType == 'view'){
            $state.go('admin.viewcustomer',{'id':iUserId});
        }else if(OperationType == 'delete'){
            $http({
                method:'post',
                url:'/clientoperation',
                dataType:'json',
                data:postData
            }).then(function(res){
                toastr.success(res.data.message,"Successs");
            $scope.users.splice(findIndex($scope.users,iUserId),1);
                console.log("Success call");
                console.log(res);
            },function(err){
                console.log("Error");
                console.log(err);
            });
        }else if(OperationType == 'edit'){
            $state.current.data.form_action = "Edit";
            $state.go('admin.formcustomer',{'id':iUserId,'action':'Edit'});
        }

    }

    $scope.onUserStatusChange = function(id,status){
        console.log(id,status);
        $http({
            method:'post',
            url:'/clientoperation',
            data:{
                'id':id,
                'vOperation':'status',
                'eStatus':status
            }
        }).then(function(res){
            toastr.success(res.data.message,"Successs");
            console.log(res);
        },function(err){
            console.log($rootScope.hideLoad);
            $rootScope.hideLoad = true;  //Loading Stop For Network Operation Error
            console.log("error call");
            console.log(err);
        });
    }

    function findIndex(array,value){
        console.log("index call");
        for(var i =0; i<array.length;i++){
            if(array[i].iUserId == value){
                console.log(i);
                return i;
            }
        }
    }

});


