angular.module('main').controller('SiteSettingsCtrl',function ($scope,$http,toastr,$localForage,$state) {
    console.log("SiteSettingsCtrl call");
    //Getting Settings
    $scope.siteSettings = [];
    $http({
        method: "post",
        url: "/settings",
    }).then(function successCallback(response) {
        console.log(response);
        $scope.siteSettings = response.data.result;
    }, function errorCallback(response) {
        toastr.error('Somting wenmt wrong.','Error');
    });
    //Posting Settings
    $scope.submitSettings = function(){
        var formData = new FormData($('#form_siteSettings')[0]);
        //formData.append("file", $scope.file);
        $http({
            method: "post",
            url: "/settingspost",
            data:formData,
            headers: {
                'Content-Type': undefined,
            }
        }).then(function successCallback(response) {
            if (response.status === 200) {
                toastr.success(response.data.message,'Success');
                console.log("Success call");
                console.log(response);
            } else {
                toastr.error(response.data.message, 'Error');
                console.log("Error call");
            }
        }, function errorCallback(response) {
            console.log("Error call");
            console.log(response);
        });
    }

});
