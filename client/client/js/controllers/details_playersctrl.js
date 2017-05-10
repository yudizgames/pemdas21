/**
 * Created by YudizAshish on 22/03/17.
 */
angular.module('client').controller('PlayerDetailsCtrl',function ($scope,$rootScope,$resource,$http,$stateParams,$timeout) {
    $scope.series = ['Total Question', 'Right Question'];
    $scope.color = ["rgba(0,188,212,0.75)","rgba(233,30,99,0.75)"];
    $scope.chart_data = [];
    $scope.chartone_data = [];
    $scope.labels_one = ["Parenthesis","Exponent","Multiplication","Division","Addition","Subtraction"];
    $scope.labels = [];
    var postData = {
        'id':$stateParams.id+'',
        'vOperation':'view'
    }
    $scope.iUserId = $stateParams.id;
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

    $http({
        method:'post',
        url:'/statistics_by_user',
        dataType:'json',
        data:{iUserId:$stateParams.id}
    }).then(function(res){
        var Total = [];
        var Right = [];
        for(var i = 0; i < res.data.graph.length ; i++){
            Total.push(res.data.graph[i].TotalQuestion);
            Right.push(res.data.graph[i].RightAnswer);
            $scope.labels.push(res.data.graph[i].vTitle);
        }

        $scope.chart_data.push(Total);
        $scope.chart_data.push(Right);
        $scope.chartone_data = res.data.graphTwo;
        $scope.data = res.data.tempResult;
        $scope.user = res.data.User[0];
    },function(err){
        console.log(err);
    });






});

