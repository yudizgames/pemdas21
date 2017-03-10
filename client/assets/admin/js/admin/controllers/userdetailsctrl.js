angular.module('main').controller('UserDetailsCtrl',function ($scope,$stateParams,$resource,$http,toastr,DTOptionsBuilder, DTColumnBuilder) {
    console.log("Users Details controller call");
    console.log($stateParams.id);
    var postData = {
            'id':$stateParams.id,
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
        $scope.profile = res.data.result[0];
        console.log($scope.profile);
    },function(err){
        console.log("Error");
        console.log(err);
    });
});

