angular.module('main').controller('ClientExamUserCtrl',function ($scope,$http,$rootScope,toastr,$state,DTOptionsBuilder, DTColumnBuilder,$compile,mySocket,$state,$localForage) {
    console.log("ExamUser Controller")
    $scope.userselected = 0;
    $localForage.removeItem('examUser');
    mySocket.on('listUser',function (user) {
        $localForage.getItem('UserInfo').then(function (data) {
            examUser = checkChild(user.data,data.iUserId);
            $scope.examUser = examUser
            console.log($scope.examUser);
        });
    });
    
    $scope.sendQutsion = function(){
        console.log($scope.examUser);

        $localForage.getItem("UserInfo").then(function(user){
            console.log(user);
                mySocket.emit('examUser',{data:$scope.examUser,"User":{"iUserId":user.iUserId,"vUserType":user.vUserType}},function(Room){

                  var Exam = {
                            "Teacher":{
                                "iTeacherUserId":user.iUserId,
                                "vTeacherType":user.vUserType
                            },
                            "Socket":{
                                "Room":Room.Room,
                                "Socket":Room.socket
                            },
                            "examUser":$scope.examUser
                        }

                    $localForage.setItem('Exam',Exam);
                    $state.go("client.mcqexam");
                });
        });
    }

    $scope.selected = function(isActive){
        console.log(isActive);
        if(isActive == true){
            $scope.userselected += 1;
        }else{
            $scope.userselected -= 1;
        }
        console.log($scope.userselected);
    }


    function checkChild(data,iParentUserId){
        console.log("Check Clild call");
        for(var i=0; i<data.length; i ++){
            if(data[i].iParentUserId != iParentUserId){
                data.splice(i,1)
            }
            console.log("For loop call");
        }
        return data;
    }
});
