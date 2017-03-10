angular.module('main').controller('QuestionFormCtrl',function ($scope,$rootScope,$state,$stateParams,$resource,$http,toastr){
    console.log("Question  Form Controller call");
        if($stateParams.id == null){
            $scope.form_action = 'Add';
        }else{
            $rootScope.hideLoad = false;
            $scope.form_action = $stateParams.action;
            var postData = {
                'iQuestionId':$stateParams.id+'',
                'vOperation':'view'
            }
            //Getting value
            $http({
                method:'post',
                url:'/questionoperation',
                dataType:'json',
                data:postData
            }).then(function(res){
                $rootScope.hideLoad = true;
                console.log("Success call");

                var question = {
                    iQuestionId:$stateParams.id+'',
                    eType:res.data.result[0].eType,
                    vQuestion:res.data.result[0].vQuestion,
                    vModeName:res.data.result[0].vModeName,
                }

                if(res.data.result[0].eType == "MCQ"){
                    question.vOptionOne = {
                        iAnswerId:res.data.result[0].iAnswerId,
                        vAnswer:res.data.result[0].vAnswer
                    };
                    question.vOptionTwo={
                        iAnswerId:res.data.result[1].iAnswerId,
                        vAnswer:res.data.result[1].vAnswer
                    };
                    question.vOptionThree= {
                        iAnswerId:res.data.result[2].iAnswerId,
                        vAnswer:res.data.result[2].vAnswer
                    };
                    question.vOptionFour={
                        iAnswerId:res.data.result[3].iAnswerId,
                        vAnswer:res.data.result[3].vAnswer
                    };
                    for(i=0;i<res.data.result.length;i++){
                        if(res.data.result[i].vRightAns == 'y'){
                            question.vOptionAns = i+"";
                        }
                    }
                }else{
                    question.vAnsVsq = {
                        iAnswerId:res.data.result[0].iAnswerId,
                        vAnswer:res.data.result[0].vAnswer
                    };
                }

                $scope.question = question;
                console.log($scope.question);
            },function(err){
                $rootScope.hideLoad = true;
                console.log("Error");
                console.log(err);
            });
            //Getting value end
        }


    $scope.submitQuestion = function(){
        $rootScope.hideLoad = false;
        var postData = {};
        console.log("POST Data");
        console.log($scope.question);
        if($scope.form_action == "Edit"){
            if($scope.question.eType == "MCQ"){
                postData = {
                    question:{
                        iQuestionId:$scope.question.iQuestionId,
                        vQuestion:$scope.question.vQuestion,
                        eType:$scope.question.eType,
                        vModeName:$scope.question.vModeName,
                        iAnswerId:gettingAnsId($scope.question.vOptionAns,$scope.question)
                    },
                    options:[
                        {
                            iAnswerId:$scope.question.vOptionOne.iAnswerId,
                            vAnswer:$scope.question.vOptionOne.vAnswer
                        },
                        {
                            iAnswerId:$scope.question.vOptionTwo.iAnswerId,
                            vAnswer:$scope.question.vOptionTwo.vAnswer
                        },
                        {
                            iAnswerId:$scope.question.vOptionThree.iAnswerId,
                            vAnswer:$scope.question.vOptionThree.vAnswer
                        },
                        {
                            iAnswerId:$scope.question.vOptionFour.iAnswerId,
                            vAnswer:$scope.question.vOptionFour.vAnswer
                        },
                    ]
                };
            }else{
                postData = {
                    question:{
                        iQuestionId:$scope.question.iQuestionId,
                        vQuestion:$scope.question.vQuestion,
                        eType:$scope.question.eType,
                        vModeName:$scope.question.vModeName,
                        iAnswerId:$scope.question.vAnsVsq.iAnswerId
                    },
                    options:[
                        {
                            iAnswerId:$scope.question.vAnsVsq.iAnswerId,
                            vAnswer:$scope.question.vAnsVsq.vAnswer
                        }
                    ]
                };
            }
            $http({
                method:'post',
                url:'/questionedit',
                dataType:'json',
                data:postData
            }).then(function (res) {
                $rootScope.hideLoad = true;
                if(res.data.status == 200){
                    toastr.success(res.data.message,"Successs");
                }else{
                    toastr.error(res.data.message,"Error");
                }
            },function(err){
                $rootScope.hideLoad = true;
                console.log(err);
            });
        }else{

            if($scope.question.eType == "MCQ"){

                postData = {
                    question:{
                        eType:$scope.question.eType,
                        vQuestion:$scope.question.vQuestion,
                        vModeName:$scope.question.vModeName,
                    },
                    options:[
                        {
                            vAnswer:$scope.question.vOptionOne.vAnswer,
                            isAnswer:gettingAns(0,$scope.question.vOptionAns)
                        },
                        {
                            vAnswer:$scope.question.vOptionTwo.vAnswer,
                            isAnswer:gettingAns(1,$scope.question.vOptionAns)
                        },
                        {
                            vAnswer:$scope.question.vOptionThree.vAnswer,
                            isAnswer:gettingAns(2,$scope.question.vOptionAns)

                        },
                        {
                            vAnswer:$scope.question.vOptionFour.vAnswer,
                            isAnswer:gettingAns(3,$scope.question.vOptionAns)
                        }
                    ]
                };

            }else{
                postData = {
                    question:{
                        eType:$scope.question.eType,
                        vQuestion:$scope.question.vQuestion,
                        vModeName:$scope.question.vModeName,
                    },
                    options:[
                        {
                            vAnswer:$scope.question.vAnsVsq.vAnswer
                        }
                    ]
                };

            }
            console.log(postData);
            $http({
                method:'post',
                url:'/questionadd',
                dataType:'json',
                data:postData
            }).then(function (res) {
                $rootScope.hideLoad = true;
                console.log(res);
                if(res.data.status == 200){
                    toastr.success(res.data.message,"Successs");
                }else{
                    toastr.error(res.data.message,"Error");
                }
            },function(err){
                $rootScope.hideLoad = true;
                console.log(err);
            });

        }


    }

    function gettingAnsId(ans,question){
        if(ans == "0"){
            return question.vOptionOne.iAnswerId+"";
        }else if(ans == "1"){
            return question.vOptionTwo.iAnswerId+"";
        }else if(ans == "2"){
            return question.vOptionThree.iAnswerId+"";
        }else if(ans == "3"){
            return question.vOptionFour.iAnswerId+"";
        }else{
            return null;
        }
    }

    function gettingAns(index,ans){
        if(index == ans)
            return true;
        else
            return false;
    }



});
