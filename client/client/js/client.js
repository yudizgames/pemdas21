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
    });



});
