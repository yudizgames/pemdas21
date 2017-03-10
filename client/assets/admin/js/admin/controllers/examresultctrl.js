angular.module('main').controller('ExamresultCtrl',function ($scope,$rootScope,$resource,$http,$state,$stateParams) {
    var RoundOneGraph = new Highcharts.Chart({
        chart: {
            renderTo: 'roundOne',
            type: 'column',
            options3d: {
                enabled: true,
                alpha: 15,
                beta: 15,
                depth: 50,
                viewDistance: 50
            },

        },
        title: {
            text: 'Round One Statics.'
        },
        credits: {
            enabled: false
        },
        subtitle: {
            text: 'Users marks'
        },
        xAxis:{
            categories : ['asdf','asdf','asdf','asdf','asdf','asdf','asdf','asdf','asdf','asdf','asdf','asdf']
        },
        plotOptions: {
            column: {
                depth: 25
            }
        },
        exporting: {
            enabled:false
        },
        series: [
            {
                data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
                color:'#7ED07F',
                name:"Right"
            },
            {
                data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
                color:'#D07679',
                name:'Wrong'
            }]
    });


    var RoundTwoGraph = new Highcharts.Chart({
        chart: {
            renderTo: 'roundTwo',
            type: 'column',
            options3d: {
                enabled: true,
                alpha: 15,
                beta: 15,
                depth: 50,
                viewDistance: 50
            },

        },
        title: {
            text: 'Round Two Statics.'
        },
        credits: {
            enabled: false
        },
        subtitle: {
            text: 'Users marks'
        },
        xAxis:{
            categories : ['ashish kadam','asdf','asdf','asdf','asdf','asdf','asdf','asdf','asdf','asdf','asdf','asdf']
        },
        plotOptions: {
            column: {
                depth: 25
            }
        },
        exporting: {
            enabled:false
        },
        series: [
            {
                data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
                color:'#7ED07F',
                name:'Right'
            },
            {
                data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
                color:'#D07679',
                name:'Wrong'
            }]
    });

    $http({
        method:'post',
        url:'/exam_result',
        dataType:'json',
        data:{"iExamId":$stateParams.id}
    }).then(function(res){
        RoundOneGraph.series[0].setData(res.data.data.RoundOneGraph.Right);
        RoundOneGraph.series[1].setData(res.data.data.RoundOneGraph.Wrong);
        RoundOneGraph.xAxis[0].setCategories(res.data.data.RoundOneGraph.Users);
        RoundTwoGraph.series[0].setData(res.data.data.RoundTwoGraph.Right);
        RoundTwoGraph.series[1].setData(res.data.data.RoundTwoGraph.Wrong);
        RoundTwoGraph.xAxis[0].setCategories(res.data.data.RoundTwoGraph.Users);
        $scope.RoundOne = res.data.data.RoundOne;
        console.log($scope.RoundOne);
        $scope.RoundTwo = res.data.data.Roundtwo;

    },function(err){
        console.log(err);
    });


    $scope.viewDetails = function(iParticipentId,iUserId){
        console.log(iParticipentId);
        console.log(iUserId);
        $state.go('admin.examuserdetails',{"iParticipentId":iParticipentId,"iUserId":iUserId});
    }




});
