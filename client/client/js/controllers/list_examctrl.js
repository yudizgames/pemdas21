/**
 * Created by YudizAshish on 24/03/17.
 */
angular.module('client').controller('ExamCtrl',function ($scope,$rootScope,$resource,$http,$state,toastr,DTOptionsBuilder,DTColumnDefBuilder,DTColumnBuilder,$compile,$localForage) {
    $scope.dtColumns = [
        //here We will add .withOption('name','column_name') for send column name to the server
        //here we will add .newColumn('column_name','Title for column name')
        DTColumnBuilder.newColumn("iExamId", "Exam ID").withOption('name', 'iExamId'),
        DTColumnBuilder.newColumn("vTitle", "Exam Title").withOption('name', 'vTitle'),
        DTColumnBuilder.newColumn("vDescription", "Exam Description").withOption('name', 'vDescription'),
        // DTColumnBuilder.newColumn(null).withTitle('Status').notSortable().renderWith(actionsHtml),
        // DTColumnBuilder.newColumn("vOperation",'Operation').withOption('name','vOperation').notSortable()
    ];

    $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
        dataSrc: "data",
        url: "/list_exam",
        type: 'POST',
        dataType:'json',
        data:function(d){
            $scope.userStatus = [];
            console.log("data call");
        }
    }).withOption('processing', true) //for show progress bar
        .withOption('serverSide', true) // for server side processing
        .withPaginationType('full_numbers') // for get full pagination options // first / last / prev / next and page numbers
        .withDisplayLength(10) // Page size
        .withOption('aaSorting',[0,'desc'])
        .withOption('createdRow',function(nRow, aData, iDisplayIndex, iDisplayIndexFull){
            $compile(nRow)($scope);
        });
    function actionsHtml(data, type, full, meta) {
        $scope.userStatus[data.iExamId] = data.eStatus;
        var temp = '<input bs-switch ng-model="userStatus['+data.iExamId+']" class="switch-small" type="checkbox" ng-true-value="&apos;y&apos;" ng-false-value="&apos;n&apos;" ng-change="onUserStatusChange('+data.iExamId+',userStatus['+data.iExamId+'])">';
        return temp;
    }
});
