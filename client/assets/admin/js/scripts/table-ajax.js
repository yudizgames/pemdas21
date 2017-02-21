var TableAjax = function () {

    var initPickers = function () {
        //init date pickers
        $('.date-picker').datepicker({
            rtl: Metronic.isRTL(),
            autoclose: true
        });
    }

    var handleRecords = function () {

        grid = new Datatable();

        grid.init({
            src: $("#datatable_ajax"),
            onSuccess: function (grid) {
                // execute some code after table records loaded
            },
            onError: function (grid) {
                // execute some code on network or other general error  
            },
            onDataLoad: function(grid) {
                // execute some code on ajax data load
            },
            loadingMessage: 'Loading...',
            dataTable: { // here you can define a typical datatable settings from http://datatables.net/usage/options 

                // Uncomment below line("dom" parameter) to fix the dropdown overflow issue in the datatable cells. The default datatable layout
                // setup uses scrollable div(table-scrollable) with overflow:auto to enable vertical scroll(see: assets/global/scripts/datatable.js). 
                // So when dropdowns used the scrollable div should be removed. 
                "dom": "<'row'<'col-md-8 col-sm-12'pli><'col-md-4 col-sm-12'<'table-group-actions pull-right'>>r>t<'row'<'col-md-8 col-sm-12'pli><'col-md-4 col-sm-12'>>",
                
                "bStateSave": true, // save datatable state(pagination, sort, etc) in cookie.

                "lengthMenu": [
                    [10, 20, 50, 100, 150, -1],
                    [10, 20, 50, 100, 150, "All"] // change per page values here
                ],
                "pageLength": 10, // default record count per page
                "ajax": {
                    'url':"/api/users",
                    'dataType':'json',
                    'headers': {
                        "Authorization":"JWT "+ getAuth() 
                    }
                },
                "order": [
                    [1, "asc"]
                ],
                "aoColumns": [
                    { sName: "",bSortable:false,bSearchable:false},
                    { sName: "vUserName"},
                    { sName: "vEmail"},
                    { sName: "vCountry"},
                    { sName: "dLastActivity"},
                    { sName: "eStatus",bSearchable:false},
                    { sName: "operation",bSortable:false,bSearchable:false}
                ]
                
            }
        });
                
    }

    return {

        //main function to initiate the module
        init: function () {
            initPickers();
            handleRecords();
        }

    };

}();
function getAuth()
{
    var $auth = window.localStorage['ngStorage-fantasyData'];
    $auth = JSON.parse($auth);
    return $auth.bearer || "";
    
}