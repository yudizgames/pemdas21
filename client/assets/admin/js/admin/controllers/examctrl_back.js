angular.module('main').controller('ExamCtrl',function ($scope,$http,$rootScope,toastr,$state,DTOptionsBuilder, DTColumnBuilder,$compile,mySocket,$state,$localForage) {
    console.log("Exam Controoler");
    $localForage.getItem("examQuestion").then(function(examQuestion){
        $localForage.getItem('examUser').then(function(examUser){
            console.log(examQuestion);
            console.log(examUser);
            mySocket.emit('exam',{"Questions":examQuestion,"vTitle":"Test","vDescription":Date()});
        });
    });
});