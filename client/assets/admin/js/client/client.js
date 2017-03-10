'use strict';
var app = angular.module('client',['ui.router',
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
    $stateProvider.state('client',{
        url:'/client',
        templateUrl:'templates/client/client.html',
        data : {bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
        controller:'ClientCtrl',
        abstract:true,
        resolve:{
            depends:['$ocLazyLoad',function($ocLazyLoad){
                return $ocLazyLoad.load({
                    name:'main',
                    insertBefore: '#ng_load_plugins_before',
                    files:[
                        'assets/admin/js/client/controllers/clientctrl.js'
                    ]
                });
            }]
        }
    })
    .state('client.dashboard',{
            url:'/dashboard',
            templateUrl:'templates/client/dashboard.html',
            data :{ pageTitle:'Dashboard',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'ClientDashboardCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/client/controllers/dashboardctrl.js'
                        ]
                    });
                }]
            }
    })
    .state('client.users',{
            url:'/users',
            templateUrl:'templates/client/list_users.html',
            data :{ pageTitle:'Users list',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'ClientUsersCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/client/controllers/client_usersctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('client.userform',{
            url:'/userform',
            templateUrl:'templates/client/client_form_user.html',
            data :{ pageTitle:'Users Operation',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo' },
            controller:'ClientUsersFormCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/client/controllers/client_userformctrl.js',
                        ]
                    });
                }]
            }
    })

    .state('client.examuser',{
            url:'/examuser',
            templateUrl:'templates/admin/list_examuser.html',
            data :{ pageTitle:'Exam User List',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
            controller:'ClientExamUserCtrl',
            reload:true,
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/client/controllers/client_examuserctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('client.mcqexam',{
            url:'/mcqexam',
            templateUrl:'templates/client/list_mcq.html',
            data :{ pageTitle:'Round 1 Question List',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
            controller:'ClientMcqExamCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/client/controllers/client_mcqexamctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('client.vsqexam',{
            url:'/vsqexam',
            templateUrl:'templates/client/list_vsq.html',
            data :{ pageTitle:'Round 2 Question List',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
            controller:'ClientVsqExamCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/client/controllers/client_vsqexamctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('client.exam',{
            url:'/exam',
            templateUrl:'templates/client/exam.html',
            data :{ pageTitle:'Exam User List',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
            controller:'ClientExamCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/client/controllers/client_examctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('client.roundone',{
            url:'/roundone',
            templateUrl:'templates/client/roundone.html',
            data :{ pageTitle:'Round One',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
                controller:'ClientRoundOneCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/client/controllers/client_roundonectrl.js',
                        ]
                    });
                }]
            }
    })
    .state('client.roundtwo',{
            url:'/roundtwo',
            templateUrl:'templates/client/roundtwo.html',
            data :{ pageTitle:'Round Two',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
            controller:'ClientRoundTwoCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/client/controllers/client_roundtwoctrl.js',
                        ]
                    });
                }]
            }
    })
    .state('client.examresult',{
            url:'/examresult/:id',
            templateUrl:'templates/client/list_examresult.html',
            data :{ pageTitle:'Exam Result',bodyClass:'page-header-fixed page-sidebar-closed-hide-logo page-sidebar-closed-hide-logo'},
            controller:'ClientExamresultCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/admin/js/client/controllers/client_examresultctrl.js',
                        ]
                    });
                }]
            }
    });



});
