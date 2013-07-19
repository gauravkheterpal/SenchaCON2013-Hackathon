/**
 * @class Ext.grid.plugin.Editable
 * @extends Ext.Component
 * Description
 */
Ext.define('Ext.grid.plugin.Editable', {
    extend: 'Ext.Component',
    alias: 'widget.grideditable' ,

    config: {
        /**
         * @private
         */
        grid: null,

        /**
         * The event used to trigger the showing of the editor form.
         * @type {String}
         */
        triggerEvent: 'doubletap',

        /**
         * By changing the formConfig you can hardcode the form that gets created when editing a row.
         * Note that the fields are not set on this form, so you will have to define them yourself in this config.
         * If you want to alter certain form configurations, but still have the default editor fields applied, use
         * the defaultFormConfig instead.
         * @type Object
         */
        formConfig: null,

        defaultFormConfig: {
            xtype: 'formpanel',
            modal: true,
            scrollable: true,
            items: {
                xtype: 'fieldset'
            }
        },

        toolbarConfig: {
            xtype: 'titlebar',
            docked: 'top',
            items: [{
                xtype: 'button',
                ui: 'decline',
                text: 'Cancel',
                align: 'left',
                action: 'cancel'
            }, {
                xtype: 'button',
                ui: 'confirm',
                text: 'Submit',
                align: 'right',
                action: 'submit'
            }]
        },

        enableDeleteButton: true
    },

    init: function(grid) {
        this.setGrid(grid);
    },

    updateGrid: function(grid, oldGrid) {
        var triggerEvent = this.getTriggerEvent();
        if (oldGrid) {
            oldGrid.renderElement.un(triggerEvent, 'onTrigger', this);
        }

        if (grid) {
            grid.renderElement.on(triggerEvent, 'onTrigger', this);
        }
    },

    onCancelTap: function() {
        this.sheet.hide();
    },

    onSubmitTap: function() {
        this.form.getRecord().set(this.form.getValues());
        this.sheet.hide();
    },

    onSheetHide: function() {
        this.sheet.destroy();
        this.form = null;
        this.sheet = null;
    },

    getRecordByTriggerEvent: function(e) {
        var rowEl = e.getTarget('.' + Ext.baseCSSPrefix + 'grid-row'),
            row;

        if (rowEl) {
            row = Ext.getCmp(rowEl.id);
            if (row) {
                return row.getRecord();
            }
        }

        return null;
    },

    getEditorFields: function(columns) {
        var fields = [],
            ln = columns.length,
            i, column, editor;

        for (i = 0; i < ln; i++) {
            column = columns[i];
            if (column.getEditable()) {
                editor = Ext.apply({}, column.getEditor() || column.getDefaultEditor());
                editor.label = column.getText();
                fields.push(editor);
            }
        }

        return fields;
    },

    onTrigger: function(e) {
        var me = this,
            grid = me.getGrid(),
            formConfig = me.getFormConfig(),
            toolbarConfig = me.getToolbarConfig(),
            record = me.getRecordByTriggerEvent(e),
            fields, form, sheet, toolbar;

        if (record) {
            if (formConfig) {
                this.form = form = Ext.factory(formConfig, Ext.form.Panel);
            } else {
                this.form = form = Ext.factory(me.getDefaultFormConfig());

                fields = me.getEditorFields(grid.getColumns());
                form.down('fieldset').setItems(fields);
            }

            form.setRecord(record);

            toolbar = Ext.factory(toolbarConfig, Ext.form.TitleBar);
            toolbar.down('button[action=cancel]').on('tap', 'onCancelTap', this);
            toolbar.down('button[action=submit]').on('tap', 'onSubmitTap', this);

            this.sheet = sheet = grid.add({
                xtype: 'sheet',
                items: [toolbar, form],
                hideOnMaskTap: true,
                enter: 'right',
                exit: 'right',
                right: 0,
                width: 320,
                layout: 'fit',
                stretchY: true,
                hidden: true
            });

            if (me.getEnableDeleteButton()) {
                form.add({
                    xtype: 'button',
                    text: 'Delete',
                    ui: 'decline',
                    margin: 10,
                    handler: function() {
                        grid.getStore().remove(record);
                        sheet.hide();
                    }
                });
            }

            sheet.on('hide', 'onSheetHide', this);

            sheet.show();
        }
    }
});