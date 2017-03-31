/**
 * Created by YudizAshish on 20/03/17.
 */
'use strict';
var app = angular.module('admin',['ui.router',
    'ui.bootstrap',
    'ngAnimate',
    'oc.lazyLoad',
    'LocalForageModule',
    'toastr',
    'datatables',
    'ngResource',
    'frapontillo.bootstrap-switch',
    'infinite-scroll',
]);
app.config(function($stateProvider,$urlRouterProvider,$locationProvider,$ocLazyLoadProvider,$localForageProvider,toastrConfig,$qProvider){
    $urlRouterProvider.otherwise('/admin/dashboard');
    $stateProvider.state('admin',{
        url:'/admin',
        templateUrl:'templates/admin/admin.html',
        data : {bodyClass:'theme-blush' },
        controller:'AdminCtrl',
        abstract:true,
        catch:false,
        resolve:{
            depends:['$ocLazyLoad',function($ocLazyLoad){
                return $ocLazyLoad.load({
                    name:'main',
                    insertBefore: '#ng_load_plugins_before',
                    files:[
                        //Must be include every page
                        'assets/css/main.css',
                        'assets/css/themes/all-themes.css',
                        'assets/bundles/libscripts.bundle.js',
                        'assets/bundles/vendorscripts.bundle.js',
                        'assets/bundles/mainscripts.bundle.js',
                        'assets/js/pages/index.js',
                        'admin/js/controllers/adminctrl.js'
                    ]
                });
            }]
        }
    })
    .state('admin.dashboard',{
            url:'/dashboard',
            templateUrl:'templates/admin/admin_dashboard.html',
            data :{ pageTitle:'Dashboard',bodyClass:'theme-blush' },
            controller:'DashboardCtrl',
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


                            'admin/js/controllers/admin_dashboardctrl.js'
                        ]
                    });
                }]
            }
    })
    .state('admin.cpass',{
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
                            'admin/js/controllers/admin_cpass.js'
                        ]
                    });
                }]
            }
    })
    .state('admin.customer',{
            url:'/customer',
            templateUrl:'templates/admin/list_customer.html',
            data :{ pageTitle:'Customer',bodyClass:'theme-blush' },
            controller:'CustomerCtrl',
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

                            'admin/js/controllers/list_customerctrl.js'
                        ]
                    });
                }]
            }
    })
    .state('admin.formcustomer',{
            url:'/formcustomer',
            params:{
                id:null,
                action:null,
                data:null
            },
            templateUrl:'templates/admin/form_customer.html',
            data :{ pageTitle:'Customer',bodyClass:'theme-blush' },
            controller:'CustomerFormCtrl',
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
                            'admin/js/controllers/form_customerctrl.js'
                        ]
                    });
                }]
            }
    })
    .state('admin.viewcustomer',{
            url:'/viewcustomer',
            params:{
                id:null,
            },
            templateUrl:'templates/admin/view_customer.html',
            data :{ pageTitle:'Customer',bodyClass:'theme-blush' },
            controller:'CustomerViewCtrl',
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
                            'admin/js/controllers/view_customerctrl.js'
                        ]
                    });
                }]
            }
    })
    .state('admin.question',{
            url:'/question',
            templateUrl:'templates/admin/list_question.html',
            data :{ pageTitle:'Customer',bodyClass:'theme-blush' },
            controller:'QuestionCtrl',
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

                            'admin/js/controllers/list_questionctrl.js'
                        ]
                    });
                }]
            }
    })
    .state('admin.formquestion',{
            url:'/formquestion',
            params:{
                id:null,
                action:null,
                data:null
            },
            templateUrl:'templates/admin/form_question.html',
            data :{ pageTitle:'Customer',bodyClass:'theme-blush' },
            controller:'QuestionFormCtrl',
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
                            'admin/js/controllers/form_questionctrl.js'
                        ]
                    });
                }]
            }
    })
    .state('admin.viewquestion',{
            url:'/viewquestion',
            params:{
                id:null,
            },
            templateUrl:'templates/admin/view_question.html',
            data :{ pageTitle:'Customer',bodyClass:'theme-blush' },
            controller:'ViewQuestionCtrl',
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
                            'admin/js/controllers/view_questionctrl.js'
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
// app.directive('bootstrapSwitch', [
//     function() {
//         return {
//             restrict: 'A',
//             require: '?ngModel',
//             link: function(scope, element, attrs, ngModel) {
//                 element.bootstrapSwitch();
//
//                 element.on('switchChange.bootstrapSwitch', function(event, state) {
//                     if (ngModel) {
//                         scope.$apply(function() {
//                             ngModel.$setViewValue(state);
//                         });
//                     }
//                 });
//
//                 scope.$watch(attrs.ngModel, function(newValue, oldValue) {
//                     if (newValue){
//                         console.log("True");
//                         element.bootstrapSwitch('state', true, true);
//                     } else {
//                         console.log("False");
//                         element.bootstrapSwitch('state', false, true);
//                     }
//                 });
//             }
//         };
//     }
// ]);

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





