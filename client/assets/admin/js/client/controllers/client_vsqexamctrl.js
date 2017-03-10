angular.module('client').controller('ClientVsqExamCtrl',function ($scope,$http,$rootScope,toastr,$state,DTOptionsBuilder, DTColumnBuilder,$compile,mySocket,$localForage) {
	console.log("McqExam");
    $scope.vsqQuestionStatus = [];
    $scope.vsqQuestionSelected = [];
    $scope.vsqExamQuestion = [];
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
        url:'/list_vsq',
        type:'POST',
        dataType:'json',
        // data:function(d){
        //     $scope.vsqQuestionStatus = [];
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
		if($scope.vsqQuestionSelected[data.iQuestionId] != 'y'){
    		$scope.vsqQuestionStatus[data.iQuestionId] = 'n';
    	}
		var temp = '<input bs-switch ng-model="vsqQuestionStatus['+data.iQuestionId+']" class="switch-small" type="checkbox" ng-true-value="&apos;y&apos;" ng-false-value="&apos;n&apos;" ng-change="qOperation('+data.iQuestionId+',&apos;status&apos;,vsqQuestionStatus['+data.iQuestionId+'])">';
        return temp;
    }

	$scope.qOperation = function(id,vOperation,eStatus){
		$scope.vsqQuestionSelected[id] = eStatus;
		console.log($scope.vsqQuestionSelected);
		if(eStatus == 'y'){
			$scope.vsqExamQuestion.push(id); 
		}else{
			$scope.vsqExamQuestion.splice(getvsqExamQuestionIndex(id),1);
		}
		console.log($scope.vsqExamQuestion.length);
	}

	function getvsqExamQuestionIndex(Id){
		for(var i=0; i<$scope.vsqExamQuestion.length;i++){
			if($scope.vsqExamQuestion[i] === Id){
				return i;
	        }
	    }
	}


	$scope.vsqQuestion = function(){
        console.log($scope.vsqExamQuestion);
		$localForage.getItem('Exam').then(function(Exam){
			Exam.VsqQuestion = $scope.vsqExamQuestion;
			console.log(Exam);
			console.log("Before Local");
			$localForage.setItem('Exam',Exam);
			$state.go('client.exam');
		});


	}
});