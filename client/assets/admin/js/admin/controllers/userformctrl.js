angular.module('main').controller('UserFormCtrl',function ($scope,$rootScope,$state,$stateParams,$resource,$http,toastr){
    console.log("User Form Ctrl");
    console.log($state.current.data);
    $scope.form_action = $stateParams.action;



    if($stateParams.action == "Edit"){
        loadForm();
    }

    $scope.submitUser = function(){
        $rootScope.hideLoad = false;
        console.log($scope.user);

        //Check Insert or Update User
        if($scope.form_action == 'Edit'){
            submitData = {
                'vOperation':'edit',
                'id':$scope.user.iUserId+'',
                'vFullName':$scope.user.vFullName,
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
            },function(err){
                $rootScope.hideLoad = true;
                console.log("Error");
                console.log(err);
                toastr.error(res.data.message,"Error");
            });

        }else{
            submitData = {
                'vFullName':$scope.user.vFullName,
                'vEmail':$scope.user.vEmail
            };
            $http({
                method:'post',
                url:'/useradd',
                dataType:'json',
                data:submitData
            }).then(function(res){
                $rootScope.hideLoad = true;
                console.log("Success call");
                console.log(res);
                toastr.success(res.data.message,"Successs");
            },function(err){
                $rootScope.hideLoad = true;
                console.log("Error");
                console.log(err);
                toastr.error(res.data.message,"Error");
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
