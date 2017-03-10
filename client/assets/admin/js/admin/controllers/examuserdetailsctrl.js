angular.module('main').controller('ExamuserdetailsCtrl',function ($scope,$rootScope,$resource,$http,$state,$stateParams) {
    console.log("Examuserdetailsctrl call");
    console.log($stateParams.iUserId);
    console.log($stateParams.iParticipentId);
});
