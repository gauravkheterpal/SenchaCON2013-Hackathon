/**
 * @private
 */
Ext.define('Ext.grid.column.Column', {
    extend: 'Ext.Component',

    xtype: 'column',

    config: {
        dataIndex: null,

        text: '',

        baseCls: Ext.baseCSSPrefix + 'grid-column',

        sortDirection: null,

        sortedCls: Ext.baseCSSPrefix + 'column-sorted',

        editable: false,
        editor: null,
        defaultEditor: {
            xtype: 'textfield',
            required: true
        },

        ignore: false,

        cellCls: null,

        minWidth: 20
    },

    initialize: function() {
        this.callParent();

        this.element.on({
            tap: 'onColumnTap',
            longpress: 'onColumnLongPress',
            scope: this
        });
    },

    onColumnTap: function(e) {
        this.fireEvent('tap', this, e);
    },

    onColumnLongPress: function(e) {
        this.fireEvent('longpress', this, e);
    },

    updateText: function(text) {
        this.setHtml(text);
    },

    doSetWidth: function(width) {
        this.callParent(arguments);
        this.fireEvent('columnresize', this, width);
    },

    updateDataIndex: function(dataIndex) {
        var editor = this.getEditor();
        if (editor) {
            editor.name = dataIndex;
        } else {
            this.getDefaultEditor().name = dataIndex;
        }
    },

    updateSortDirection: function(direction, oldDirection) {
        var sortedCls = this.getSortedCls();

        if (oldDirection) {
            this.element.removeCls(sortedCls + '-' + oldDirection.toLowerCase());
        }

        if (direction) {
            this.element.addCls(sortedCls + '-' + direction.toLowerCase());
        }

        this.fireEvent('sort', this, direction, oldDirection);
    },

    getCellContent: function(record) {
        var me = this,
            dataIndex = me.getDataIndex(),
            value = dataIndex && record.get(dataIndex);

        return me.defaultRenderer(value, record);
    },

    defaultRenderer: function(value) {
        return value;
    },

    updateCell: function(cell, record) {
        if (cell && record) {
            cell.firstChild.nodeValue = this.getCellContent(record);
        }
    }
});