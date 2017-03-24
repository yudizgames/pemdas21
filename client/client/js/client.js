/**
 * Created by YudizAshish on 20/03/17.
 */
'use strict';
var app = angular.module('client',['ui.router',
    'ui.bootstrap',
    'ngAnimate',
    'oc.lazyLoad',
    'LocalForageModule',
    'toastr',
    // 'datatables',
    'ngResource',
    // 'frapontillo.bootstrap-switch',
]);
app.config(function($stateProvider,$urlRouterProvider,$locationProvider,$ocLazyLoadProvider,$localForageProvider,toastrConfig,$qProvider){
    $stateProvider.state('client',{
        url:'/client',
        templateUrl:'templates/client/client.html',
        data :{ bodyClass:'theme-blush' },
        controller:'ClientCtrl',
        abstract:true,
        resolve:{
            depends:['$ocLazyLoad',function($ocLazyLoad){
                return $ocLazyLoad.load({
                    name:'main',
                    insertBefore: '#ng_load_plugins_before',
                    files:[
                        //Must be include
                        'assets/css/main.css',
                        'assets/css/themes/all-themes.css',
                        'assets/bundles/libscripts.bundle.js',
                        'assets/bundles/vendorscripts.bundle.js',
                        'assets/bundles/mainscripts.bundle.js',
                        'assets/js/pages/index.js',


                        'client/js/controllers/clientctrl.js'
                    ]
                });
            }]
        }
    })
    .state('client.dashboard',{
            url:'/dashboard',
            templateUrl:'templates/client/client_dashboard.html',
            data :{ pageTitle:'Dashboard',bodyClass:'theme-blush' },
            controller:'ClientDashboardCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            //Must be include every page
                            'assets/css/main.css',
                            'assets/css/themes/all-themes.css',
                            'assets/bundles/libscripts.bundle.js',
                            'assets/bundles/vendorscripts.bundle.js',
                            'assets/bundles/mainscripts.bundle.js',
                            'assets/js/pages/index.js',


                            'client/js/controllers/client_dashboardctrl.js'
                        ]
                    });
                }]
            }
    })
    .state('client.cpass',{
            url:'/cpass',
            params:{
                id:null,
                action:null,
                data:null
            },
            templateUrl:'templates/cpass.html',
            data :{ pageTitle:'Change Password',bodyClass:'theme-blush' },
            controller:'ChangePassCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/css/main.css',
                            'assets/css/themes/all-themes.css',
                            'assets/bundles/libscripts.bundle.js',
                            'assets/bundles/vendorscripts.bundle.js',
                            'assets/bundles/mainscripts.bundle.js',
                            'assets/js/pages/index.js',
                            "assets/plugins/jquery-steps/jquery.steps.js",
                            "assets/plugins/sweetalert/sweetalert.min.js",
                            "assets/js/pages/forms/form-validation.js",
                            'client/js/controllers/client_cpass.js'
                        ]
                    });
                }]
            }
        })
    .state('client.users',{
            url:'/users',
            templateUrl:'templates/client/list_players.html',
            data :{ pageTitle:'Players',bodyClass:'theme-blush' },
            controller:'ClientPlayersCtrl',
            catch:false,
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            //Must be include every page
                            'assets/css/main.css',
                            'assets/css/themes/all-themes.css',
                            'assets/bundles/libscripts.bundle.js',
                            'assets/bundles/vendorscripts.bundle.js',
                            'assets/bundles/mainscripts.bundle.js',
                            'assets/js/pages/index.js',

                            'client/js/controllers/list_playersctrl.js'
                        ]
                    });
                }]
            }
    })
    .state('client.formusers',{
            url:'/formusers',
            params:{
                id:null,
                action:null,
                data:null
            },
            templateUrl:'templates/client/form_players.html',
            data :{ pageTitle:'Users',bodyClass:'theme-blush' },
            controller:'PlayerFormCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/css/main.css',
                            'assets/css/themes/all-themes.css',
                            'assets/bundles/libscripts.bundle.js',
                            'assets/bundles/vendorscripts.bundle.js',
                            'assets/bundles/mainscripts.bundle.js',
                            'assets/js/pages/index.js',
                            "assets/plugins/jquery-steps/jquery.steps.js",
                            "assets/plugins/sweetalert/sweetalert.min.js",
                            "assets/js/pages/forms/form-validation.js",
                            "client/js/controllers/form_playersctrl.js"
                        ]
                    });
                }]
            }
    })
    .state('client.viewusers',{
            url:'/viewusers',
            params:{
                id:null,
            },
            templateUrl:'templates/client/details_players.html',
            data :{ pageTitle:'Users',bodyClass:'theme-blush' },
            controller:'PlayerDetailsCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/css/main.css',
                            'assets/css/themes/all-themes.css',
                            'assets/bundles/libscripts.bundle.js',
                            'assets/bundles/vendorscripts.bundle.js',
                            'assets/bundles/mainscripts.bundle.js',
                            'assets/js/pages/index.js',
                            "assets/plugins/jquery-steps/jquery.steps.js",
                            "assets/plugins/sweetalert/sweetalert.min.js",
                            "assets/js/pages/forms/form-validation.js",
                            'client/js/controllers/details_playersctrl.js'
                        ]
                    });
                }]
            }
    })
    .state('client.exam',{
            url:'/exam',
            templateUrl:'templates/client/list_exam.html',
            data :{ pageTitle:'Exam',bodyClass:'theme-blush' },
            controller:'ExamCtrl',
            catch:false,
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            //Must be include every page
                            'assets/css/main.css',
                            'assets/css/themes/all-themes.css',
                            'assets/bundles/libscripts.bundle.js',
                            'assets/bundles/vendorscripts.bundle.js',
                            'assets/bundles/mainscripts.bundle.js',
                            'assets/js/pages/index.js',
                            'client/js/controllers/list_examctrl.js'
                        ]
                    });
                }]
            }
    })
    .state('client.formexam',{
            url:'/formexam',
            params:{
                id:null,
                action:null,
                data:null
            },
            templateUrl:'templates/client/form_exam.html',
            data :{ pageTitle:'Exam',bodyClass:'theme-blush' },
            controller:'ExamFormCtrl',
            resolve:{
                depends:['$ocLazyLoad',function($ocLazyLoad){
                    console.log("Lazy Load Call");
                    return $ocLazyLoad.load({
                        name:'main',
                        insertBefore:'#ng_load_plugins_before',
                        files:[
                            'assets/css/main.css',
                            'assets/css/themes/all-themes.css',
                            'assets/bundles/libscripts.bundle.js',
                            'assets/bundles/vendorscripts.bundle.js',
                            'assets/bundles/mainscripts.bundle.js',
                            'assets/js/pages/index.js',
                            // "assets/plugins/jquery-steps/jquery.steps.js",
                            // "assets/plugins/sweetalert/sweetalert.min.js",
                            // "assets/js/pages/forms/form-validation.js",
                            "client/js/controllers/form_examctrl.js"
                        ]
                    });
                }]
            }
    });



});
