/**
 * Created by YudizAshish on 22/03/17.
 */
angular.module('client').controller('PlayerDetailsCtrl',function ($scope,$rootScope,$resource,$http,$stateParams) {

   var highchart =  Highcharts.chart('container', {
        chart: {
            type: 'column'
        },
        credits: {
           enabled: false
        },
        exporting: {
           enabled: false
        },
        title: {
            text: 'User Exam Attempt'
        },
        xAxis: {
            categories: [],
            crosshair: true
        },
        yAxis: {
            min: 1,
            title: {
                text: 'Exam Attempt'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: [{
            name: 'Attempt',
            data: []
        }]
    })


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
        console.log("Client detauls dfasdfasdfafasfasdfasdfasdfasdfasdfasdfadf");
        console.log("Success call");
        console.log(res.data.graph);
        console.log(res.data.graph[0]);
        var examTitle = [];
        var examAttempt = [];
        for(var i =0; i < res.data.graph.length; i++){
            examAttempt.push(res.data.graph[i].TotalAttempt);
            examTitle.push(res.data.graph[i].vTitle);
        }
        highchart.series[0].setData(examAttempt);
        highchart.xAxis[0].setCategories(examTitle);
        console.log(examAttempt);
        console.log(examTitle);
        $scope.data = res.data.tempResult;
        $scoe.user = res.data.User[0];
        console.log("After high chart");
    },function(err){
        console.log("Error");
        console.log(err);
    });


    ;



});