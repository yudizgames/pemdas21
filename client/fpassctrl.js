/**
 * Created by YudizAshish on 23/03/17.
 */
angular.module('Pemdas').controller('FpassCtrl',function ($scope,$http,$localForage,$state,toastr) {
    $scope.forgotPass = function(data){
        $http({
            method:'post',
            url:'/fpass',
            dataType:'json',
            data:{"vEmail":$scope.vEmail}
        }).then(function (res) {
            console.log(res);
            if(res.data.status == 200){
                toastr.success('Otp send on your password.', 'Success');
                console.log("check mail");
            }else{
                toastr.error(res.data.message,'Error');
            }
        });
    }

});