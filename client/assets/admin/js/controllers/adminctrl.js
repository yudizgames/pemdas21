angular.module('main').controller('AdminCtrl',function ($scope,$http,$localForage,$state) {
	console.log("Admin Controller call");
    // $http({
		// method:"post",
		// url:"/user",
		// dataType:'json',
    // }).then(function (data) {
		// console.log("After Login");
		// console.log(data);
    // })
	$scope.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IjI3MTE5ZTlkMWEwOTA3MWMzNDFlMjdhMDZjMmMwNWEyIiwiZGV2aWNlIjoiRGVza1RvcCIsImlhdCI6MTQ4NDg5MzQyMn0.d3A9ceFFW85z_jg60QrEUKopZTDvMSHghpTTnNxOnwk";

	$scope.logout = function(){
		console.log("Log out call");
		$http({
			method:'post',
			url:'/logout',
			dataType:'json'
		}).then(function(res){
			if(res.data.status == 200){
				$localForage.clear('UserInfo').then(function(res){
					$state.transitionTo('login');
				});
			}
		});
	}
});