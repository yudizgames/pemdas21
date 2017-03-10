angular.module('main').controller('ClientDetailsCtrl',function ($scope,$stateParams,$resource,$http,toastr,DTOptionsBuilder, DTColumnBuilder) {
    console.log("Cleint Details controller call");
    console.log($stateParams.id);
    var postData = {
            'id':$stateParams.id,
            'vOperation':'view'
    }
    $http({
        method:'post',
        url:'/clientoperation',
        dataType:'json',
        data:postData
    }).then(function(res){
        console.log("Success call");
        console.log(res);
        $scope.profile = res.data.result;
        $scope.child = res.data.result.child;
        console.log($scope.child);
        console.log($scope.profile);
    },function(err){
        console.log("Error");
        console.log(err);
    });
});

