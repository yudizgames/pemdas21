/**
 * Created by YudizAshish on 23/03/17.
 */
/**
 * Created by YudizAshish on 20/03/17.
 */
angular.module('Pemdas').controller('SignupCtrl',function ($scope,$http,$localForage,$state,toastr) {
    console.log("Sigunup Controller Cakll");

    $scope.showMsg = function(type){
        if(type == 'parent'){
            toastr.info('Choose the parent profile if you will work with less than 10 players.', 'Information');
        }else{
            toastr.info('Choose the teacher profile if you will work with more than 20 players.', 'Information');
        }
    }


    $scope.doSignUp = function (data) {
        console.log(data);
        console.log($scope.user);

        $http({
            method:'post',
            url:'/signup',
            dataType:"json",
            data:{"vEmail":$scope.user.vEmail,"vFullName":$scope.user.Respect+" "+$scope.user.vFullName,"vParentType":$scope.user.vUserType},
        }).then(function(res){
            console.log(res);
            if(res.data.status === 200){
                toastr.success(res.data.message, 'Success');
            }else{
                toastr.error(res.data.message, 'Error');
            }
            console.log("Success call");
        },function(err){
            console.log("Error call");
        });



    }

    $scope.forgotPass = function(data){
        $http({
            method:'post',
            url:'/fpass',
            dataType:'json',
            data:{"vEmail":$scope.email}
        }).then(function (res) {
            if(res.data.status == 200){
                toastr.success('Otp send on your password.', 'Success');
                console.log("check mail");
            }else{
                toastr.error("User not exist, Check your mail.",'Error');
            }
        });
    }

});