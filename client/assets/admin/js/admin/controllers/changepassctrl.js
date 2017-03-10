angular.module('main').controller('ChangePassCtrl',function ($scope,$http,toastr) {
    console.log("Change Pass Call");
    $scope.submitCPass = function(){
        var post = {
            "vNewPassword":$scope.pass.nPassword,
            "vOldPassword":$scope.pass.oPassword
        };
        $http({
            method:'post',
            url:'/cpass',
            dataType:"json",
            data:post,
        }).then(function(res){
            console.log(res);
            if(res.data.status == 200){
                toastr.success(res.data.message, 'Success');
            }else{
                toastr.error(res.data.message, 'Error');
            }
            console.log("Success call");
        },function(err){
            console.log("Error call");
        });

        console.log(post);
    }

});
