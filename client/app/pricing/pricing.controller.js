'use strict';

angular.module('vadsenceNodeApp')
  .controller('PricingCtrl', function ($scope, $resource) {
    $scope.message = 'Hello';
    
    var session_resource = $resource('/api/sessions/:id', {
        id: '@id',
    }, {
        update: {
            method: 'PUT'
        }
    }); 

    function update_session (data_update, callback) {
        console.log('update_session',data_update);
        session_resource.update({
            id: data_update._id,
        }, data_update
        , function(data) {
            console.log(data)
            swal("Success", "Session report submitted!", "success");
            if (typeof callback === "function") {
                // Call it, since we have confirmed it is callable​
                callback();
            }
            
        }, function(err) {
            //console.log(err);
            swal("Error", "Something went wrong. Please try again.", "error");
        });
    }
    
    TableAjax.init('datatable_ajax', update_session);


  });


var TableAjax = {
    init: function(table_id, update_session){
        this.nEditing = null;
        this.nNew = false;
        this.update_session = update_session;
        var table = $("#"+table_id);
        if (table.length > 0) {
            this.table = table;
            this.table_id = table_id;
            this.source_path = '/api/sessions/datatable';
            this.init_datatable();
            this.fix_layout();
        }
    },
    reload_table: function(){
        this.table.DataTable().ajax.reload();        
    },
        
    fix_layout: function(){
        // var dt_filter_area = $(".custom-filter");
        // $(".table-filter").appendTo(dt_filter_area);
        var tableWrapper = $("#"+this.table_id+"_wrapper");

        tableWrapper.find(".dataTables_length select").select2({
            showSearchInput: false ,//hide search box with special css class
            containerCssClass: 'form-control input-xsmall input-inline'
        }); // initialize select2 dropdown
        tableWrapper.find(".dataTables_filter input").addClass('form-control input-small input-inline')

    },


    init_datatable: function(){
        var self = this;
        this.table.dataTable({
            "processing": true,
            // <div id="datatable_ajax_processing" class="dataTables_processing" style="display: none;">Processing...</div>
            "bLengthChange": true,
            "bFilter": true,
            "serverSide": true,
            "iDisplayLength": 10,
            // "scrollX": true,
            "dom": '<"row" <"col-sm-6 custom-filter" l> <"col-sm-6" f> >r<"datatable-wrapper" t> <"row mrg20B" <"col-sm-6" i> <"col-sm-6"p> >',
            "order": [[0,"desc"]],
            "bStateSave": true, // save datatable state(pagination, sort, etc) in cookie.

            "lengthMenu": [
                [5,10, 20, 50, 100, 150, -1],
                [5,10, 20, 50, 100, 150, "All"] // change per page values here
            ],
            "pageLength": 5, // default record count per page

            "autoWidth": true,
            "ajax": {
              url: self.source_path,
              data: function(d){
                // d.timeFilter = $("#time-filter option:selected").val();
              }
            },
            "aoColumnDefs": [
             { bSortable: false, 'aTargets': [ 3 ] },    
            ],
            "columns": [
                {"data": "name"},
                {"data": "fee_normal"},
                {"data": "fee_special"},
                {"data": "_id", render:function ( data, type, row ) {
                        return '<a class="btn btn-sm btn-info" onclick="TableAjax.edit(TableAjax, this)">Edit </a>';
                    }
                    
                },
            ],
            initComplete: function () {
              
            },
            fnDrawCallback: function(data){

              return data;
            }
        });
    },
    edit : function (self, row ) {

        var oTable = self.table;
        /* Get the row as a parent of the link that was clicked on */
        var nRow = $(row).parents('tr')[0];

        if (self.nEditing !== null && self.nEditing != nRow) {
            /* Currently editing - but not this row - restore the old before continuing to edit mode */
            self.restoreRow(oTable, self.nEditing);
            self.editRow(oTable, nRow);
            self.nEditing = nRow;
        } else if (self.nEditing == nRow && row.innerHTML == "Save") {
            /* Editing this row and want to save it */
            self.save(self,row);
        } else {
            /* No edit in progress - let's start one */
            self.editRow(oTable, nRow);
            self.nEditing = nRow;
        }
    },  
    inputVale : function(nRow){
        var jqInputs = $('input', nRow);
        var object_input = [];
        for(var x in jqInputs){
            if(!_.isEmpty(jqInputs[x].name) && !_.isEmpty(jqInputs[x].value)){
                object_input.push({name: jqInputs[x].name, value: jqInputs[x].value});
            }            
        }
        return  _.object(_.pluck(object_input, 'name'), _.pluck(object_input, 'value'));
    },
    save : function (self, row ) {
        var oTable = self.table;
        var nRow = $(row).parents('tr')[0];
        var jqInputs = self.inputVale(nRow);

        self.update_session(jqInputs,function () {
            self.saveRow(oTable, self.nEditing);
            self.nEditing = null;
        });      
    },
    cancel :function (self, row) {
        // e.preventDefault();
        if (self.nNew) {
            self.table.fnDeleteRow(self.nEditing);
            self.nEditing = null;
            self.nNew = false;
        } else {
            self.restoreRow(self.table, self.nEditing);
            self.nEditing = null;
        }
    },
    restoreRow: function (oTable, nRow) {
        var aData = oTable.fnGetData(nRow);
        var jqTds = $('>td', nRow);
        if(!_.isEmpty(aData)){
        oTable.fnUpdate(aData.name, nRow, 0, false);
        oTable.fnUpdate(aData.fee_normal, nRow, 1, false);
        oTable.fnUpdate(aData.fee_special, nRow, 2, false);
        oTable.fnUpdate('<a class="btn btn-sm btn-info" onclick="TableAjax.edit(TableAjax, this)">Edit </a>', nRow, 3, false);
        }
        //oTable.fnDraw();
    },

    editRow: function(oTable, nRow) {
        //console.log(oTable, nRow);
        var aData = oTable.fnGetData(nRow);
        //console.log('editRow', aData);
        var jqTds = $('>td', nRow);
        jqTds[0].innerHTML = aData.name+'<input type="hidden" class="form-control" name="name" value="' + aData.name + '"><input type="hidden" class="form-control" name="_id" value="' + aData._id + '">';
        jqTds[1].innerHTML = '<input type="text" class="form-control" name="fee_normal" value="' + aData.fee_normal + '">';
        jqTds[2].innerHTML = '<input type="text" class="form-control" name="fee_special" value="' + aData.fee_special + '">';
        // jqTds[3].innerHTML = '<input type="text" class="form-control" value="' + aData[3] + '">';
        jqTds[3].innerHTML = '<a class="btn btn-sm btn-success" onclick="TableAjax.save(TableAjax, this)">Save</a><a class="btn btn-sm btn-default" onclick="TableAjax.cancel(TableAjax, this)">Cancel</a>';
        // jqTds[5].innerHTML = '<a class="cancel" href="">Cancel</a>';
    },

    saveRow: function(oTable, nRow) {
        // var jqInputs = $('input', nRow);
        var jqInputs = this.inputVale(nRow);
        oTable.fnUpdate(jqInputs.name, nRow, 0, false);
        oTable.fnUpdate(jqInputs.fee_normal, nRow, 1, false);
        oTable.fnUpdate(jqInputs.fee_special, nRow, 2, false);
        oTable.fnUpdate('<a class="btn btn-sm btn-info" onclick="TableAjax.edit(TableAjax, this)">Edit </a>', nRow, 3, false);
       // oTable.fnDraw();
    },

    cancelEditRow: function(oTable, nRow) {
        // var jqInputs = $('input', nRow);
        var jqInputs = this.inputVale(nRow);
        oTable.fnUpdate(jqInputs.name, nRow, 0, false);
        oTable.fnUpdate(jqInputs.fee_normal, nRow, 1, false);
        oTable.fnUpdate(jqInputs.fee_special, nRow, 2, false);
        oTable.fnUpdate('<a class="btn btn-sm btn-info" onclick="TableAjax.edit(TableAjax, this)">Edit </a>', nRow, 3, false);
    }
}