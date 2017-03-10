'use strict';
var app = angular.module('main',['ui.router',
    'ui.bootstrap',
    'ngAnimate',
    'oc.lazyLoad',
    'LocalForageModule',
	'toastr',
    'datatables',
    'ngResource',
    'frapontillo.bootstrap-switch',
    'btford.socket-io'
]);
app.config(function($stateProvider,$urlRouterProvider,$locationProvider,$ocLazyLoadProvider,$localForageProvider,toastrConfig,$qProvider){
    $urlRouterProvider.otherwise('/admin/dashboard');
    $stateProvider.state('admin',{
		url:'/admin',
		templateUrl:'templates/admin/admin.html',
		data : {bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
		controller:'AdminCtrl',
		abstract:true,
		resolve:{
			depends:['$ocLazyLoad',function($ocLazyLoad){
				return $ocLazyLoad.load({
					name:'main',
					insertBefore: '#ng_load_plugins_before',
					files:[
						'assets/admin/js/admin/controllers/adminctrl.js'
					]
				});
			}]
		}
	})
	.state('admin.dashboard',{
		url:'/dashboard',
		templateUrl:'templates/admin/dashboard.html',
		data :{ pageTitle:'Dashboard',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
		controller:'DashboardCtrl',
		resolve:{
			depends:['$ocLazyLoad',function($ocLazyLoad){
				console.log("Lazy Load Call");
				return $ocLazyLoad.load({
					name:'main',
                    insertBefore:'#ng_load_plugins_before',
					files:[
						'assets/admin/js/admin/controllers/dashboardctrl.js'
					]
				});
			}]
		}
	})
    .state('admin.cpass',{
            url:'/cpass',
            templateUrl:'templates/admin/cpass.html',
            data :{ pageTitle:'Change Password',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'ChangePassCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/admin/controllers/changepassctrl.js',
                        ]
                    });
            }]
    	}
    })
    .state('admin.sitesetting',{
        url:'/sitesetting',
        templateUrl:'templates/admin/sitesettings.html',
        data :{ pageTitle:'Change Password',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
        controller:'SiteSettingsCtrl',
        resolve:{
            depends:['$ocLazyLoad',function($ocLazyLoad){
                console.log("Lazy Load Call");
                return $ocLazyLoad.load({
                    name:'main',
                    insertBefore:'#ng_load_plugins_before',
                    files:[
                        'assets/admin/js/admin/controllers/sitesettingctrl.js',
                    ]
                });
            }]
        }
    })
    .state('admin.users',{
            url:'/users',
            templateUrl:'templates/admin/list_users.html',
            data :{ pageTitle:'Users list',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'UsersCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/admin/controllers/usersctrl.js',
                            ]
                    });
                }]
            }
    })
    .state('admin.userdetails',{
            url:'/userdetails/:id',
            templateUrl:'templates/admin/userdetails.html',
            data :{ pageTitle:'User details',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'UserDetailsCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/pages/css/profile.css',
                            'assets/admin/js/admin/controllers/userdetailsctrl.js',

                        ]
                    });
                }]
            }
    })
    .state('admin.userform',{
            url:'/userform',
            params:{
                id:null,
                action:null,
                data:null
            },
            templateUrl:'templates/admin/form_user.html',
            data :{ pageTitle:'User details',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
            controller:'UserFormCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/admin/controllers/userformctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('admin.question',{
            url:'/question',
            templateUrl:'templates/admin/list_question.html',
            data :{ pageTitle:'Question List',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
            controller:'QuestionCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/admin/controllers/questionctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('admin.questiondetails',{
            url:'/questiondetails',
            params:{
                id:null,
                action:null,
                data:null
            },
            templateUrl:'templates/admin/view_question.html',
            data :{ pageTitle:'Question List',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
            controller:'QuestionDetailsCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/admin/controllers/questiondetailsctrl.js',
                            'assets/admin/global/plugins/jquery.pulsate.min.js'
                        ]
                    });
                }]
            }
    })
    .state('admin.questionform',{
        url:'/questionform',
        params:{
            id:null,
            action:null,
            data:null
        },
        templateUrl:'templates/admin/form_question.html',
        data :{ pageTitle:'Question',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
        controller:'QuestionFormCtrl',
        resolve:{
            depends:['$ocLazyLoad',function($ocLazyLoad){
                console.log("Lazy Load Call");
                return $ocLazyLoad.load({
                    name:'main',
                    insertBefore:'#ng_load_plugins_before',
                    files:[
                        'assets/admin/js/admin/controllers/questionformctrl.js',
                    ]
                });
            }]
        }
    })
    .state('admin.examuser',{
            url:'/examuser',
            templateUrl:'templates/admin/list_examuser.html',
            data :{ pageTitle:'Exam User List',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
            controller:'ExamUserCtrl',
            reload:true,
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/admin/controllers/examuserctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('admin.mcqexam',{
            url:'/mcqexam',
            templateUrl:'templates/admin/list_mcq.html',
            data :{ pageTitle:'Round 1 Question List',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
            controller:'McqExamCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/admin/controllers/mcqexamctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('admin.vsqexam',{
            url:'/vsqexam',
            templateUrl:'templates/admin/list_vsq.html',
            data :{ pageTitle:'Round 2 Question List',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
            controller:'VsqExamCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/admin/controllers/vsqexamctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('admin.exam',{
            url:'/exam',
            templateUrl:'templates/admin/exam.html',
            data :{ pageTitle:'Exam User List',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
            controller:'ExamCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/admin/controllers/examctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('admin.roundone',{
        url:'/roundone',
        templateUrl:'templates/admin/roundone.html',
        data :{ pageTitle:'Round One',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
        controller:'RoundOneCtrl',
        resolve:{
            depends:['$ocLazyLoad',function($ocLazyLoad){
                console.log("Lazy Load Call");
                return $ocLazyLoad.load({
                    name:'main',
                    insertBefore:'#ng_load_plugins_before',
                    files:[
                        'assets/admin/js/controllers/roundonectrl.js',
                    ]
                });
            }]
        }
    })
    .state('admin.roundtwo',{
            url:'/roundtwo',
            templateUrl:'templates/admin/roundtwo.html',
            data :{ pageTitle:'Round Two',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
            controller:'RoundTwoCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/admin/controllers/roundtwoctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('admin.statistics',{
            url:'/statistics',
            templateUrl:'templates/admin/list_statistics.html',
            data :{ pageTitle:'Statistics',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
            controller:'StatisticsCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/admin/controllers/statisticsctrl.js',
                        ]
                    });
                }]
            }//!MY$qld3v$!
    })
    .state('admin.examresult',{
            url:'/examresult/:id',
            templateUrl:'templates/admin/list_examresult.html',
            data :{ pageTitle:'Exam Result',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
            controller:'ExamresultCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/admin/controllers/examresultctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('admin.examuserdetails',{
            url:'/examuserdetails/:iParticipentId/:iUserId',
            templateUrl:'templates/admin/examuserdetails.html',
            data :{ pageTitle:'Exam Result',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
            controller:'ExamuserdetailsCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/admin/controllers/examuserdetailsctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('admin.client',{
            url:'/client',
            templateUrl:'templates/admin/list_clients.html',
            data :{ pageTitle:'Users list',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'ClientsCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/admin/controllers/clientsctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('admin.clientetails',{
            url:'/clientetails/:id',
            templateUrl:'templates/admin/clientdetails.html',
            data :{ pageTitle:'User details',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'ClientDetailsCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/pages/css/profile.css',
                            'assets/admin/js/admin/controllers/clientdetailsctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('admin.clientform',{
            url:'/clientform',
            params:{
                id:null,
                action:null,
                data:null
            },
            templateUrl:'templates/admin/form_client.html',
            data :{ pageTitle:'Cleint Operation ',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
            controller:'ClientFormCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/admin/controllers/clientformctrl.js',
                        ]
                    });
                }]
            }
    });


});
app.run(function(){
    console.log("Inside Admin");
});
app.controller('AppCtrl', function ($scope) {
	console.log("App Controller call");
});
app.directive('bootstrapSwitch', [
    function() {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                element.bootstrapSwitch();

                element.on('switchChange.bootstrapSwitch', function(event, state) {
                    if (ngModel) {
                        scope.$apply(function() {
                            ngModel.$setViewValue(state);
                        });
                    }
                });

                scope.$watch(attrs.ngModel, function(newValue, oldValue) {
                    if (newValue){
                        console.log("True");
                        element.bootstrapSwitch('state', true, true);
                    } else {
                        console.log("False");
                        element.bootstrapSwitch('state', false, true);
                    }
                });
            }
        };
    }
]);

app.directive('a',
    function() {
        return {
            restrict: 'E',
            link: function(scope, elem, attrs) {
                if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
                    elem.on('click', function(e) {
                        e.preventDefault(); // prevent link click for above criteria
                    });
                }
            }
        };
    });




