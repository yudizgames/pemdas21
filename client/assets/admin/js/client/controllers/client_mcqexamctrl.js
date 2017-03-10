angular.module('client').controller('ClientMcqExamCtrl',function ($scope,$http,$rootScope,toastr,$state,DTOptionsBuilder, DTColumnBuilder,$compile,mySocket,$localForage) {
	console.log("McqExam");



	$scope.questionStatus = [];
	$scope.questionSelected = [];
	$scope.examQuestion = [];
    /**
     * Generate Question List
     */
	$scope.dtInstanceQuestion = {};
	$scope.dtColumns = [
        DTColumnBuilder.newColumn("iQuestionId", "Question Id").withOption('name', 'iQuestionId'),
        DTColumnBuilder.newColumn("vModeName", "Difficulty level").withOption('name', 'vModeName'),
		DTColumnBuilder.newColumn("vQuestion", "Question").withOption('name', 'vQuestion'),
        DTColumnBuilder.newColumn("vAnswer", "Answer").withOption('name', 'vAnswer'),
        DTColumnBuilder.newColumn(null).withTitle('Status').notSortable().renderWith(actionsHtml),
        // DTColumnBuilder.newColumn("Status",'Status').withOption('name','Status').notSortable(),
        // DTColumnBuilder.newColumn("operation",'Operation').withOption('name','operation').notSortable()
    ];



    $scope.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
        dataSrc:"data",
        url:'/list_mcq',
        type:'POST',
        dataType:'json',
        // data:function(d){
        //     $scope.questionStatus = [];
        // }
    }).withOption('processing', true) //for show progress bar
      .withOption('serverSide', true) // for server side processing
      .withPaginationType('full_numbers') // for get full pagination options // first / last / prev / next and page numbers
      .withDisplayLength(10) // Page size
      .withOption('aaSorting',[0,'desc'])
      .withOption('createdRow',function(nRow, aData, iDisplayIndex, iDisplayIndexFull){
		$compile(nRow)($scope);
      });

    function actionsHtml(data, type, full, meta) {
		if($scope.questionSelected[data.iQuestionId] != 'y'){
    		$scope.questionStatus[data.iQuestionId] = 'n';
    	}
		var temp = '<input bs-switch ng-model="questionStatus['+data.iQuestionId+']" class="switch-small" type="checkbox" ng-true-value="&apos;y&apos;" ng-false-value="&apos;n&apos;" ng-change="qOperation('+data.iQuestionId+',&apos;status&apos;,questionStatus['+data.iQuestionId+'])">';
        return temp;
    }

	$scope.qOperation = function(id,vOperation,eStatus){
		$scope.questionSelected[id] = eStatus;
		console.log($scope.questionSelected);
		if(eStatus == 'y'){
			$scope.examQuestion.push(id); 
		}else{
			$scope.examQuestion.splice(getExamQuestionIndex(id),1);
		}
	}

	function getExamQuestionIndex(Id){
		for(var i=0; i<$scope.examQuestion.length;i++){
			if($scope.examQuestion[i] === Id){
				return i;
	        }
	    }
	}


	$scope.exam = function(){

		console.log($scope.examQuestion);
		$localForage.getItem('Exam').then(function(Exam){
			Exam.McqQuestion = $scope.examQuestion;
			console.log(Exam);
			console.log("Before Local");
			$localForage.setItem('Exam',Exam);
			$state.go('client.vsqexam');
		});
	}
});