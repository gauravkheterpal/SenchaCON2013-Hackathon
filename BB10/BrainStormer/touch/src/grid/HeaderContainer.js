/**
 * @class Ext.grid.HeaderContainer
 * @extends Ext.Container
 * Description
 */
Ext.define('Ext.grid.HeaderContainer', {
    extend: 'Ext.Container',
    xtype: 'headercontainer',

    config: {
        baseCls: Ext.baseCSSPrefix + 'grid-header-container',
        height: 65,
        docked: 'top',
        translationMethod: 'auto',
        defaultType: 'column'
    },

    initialize: function() {
        var me = this;

        me.columns = [];

        me.callParent();

        me.on({
            tap: 'onHeaderTap',
            columnresize: 'onColumnResize',
            show: 'onColumnShow',
            hide: 'onColumnHide',
            sort: 'onColumnSort',
            scope: me,
            delegate: 'column'
        });
    },

    getColumns: function() {
        return this.columns;
    },

    onItemAdd: function(column) {
        if (column.isHeaderGroup) {
            var columns = column.getItems().items,
                ln = columns.length,
                i;

            for (i = 0; i < ln; i++) {
                this.columns.push(columns[i]);
                this.fireEvent('columnadd', this, columns[i]);
            }
        } else {
            this.columns.push(column);
            this.fireEvent('columnadd', this, column);
        }

        this.callParent(arguments);
    },

    onItemRemove: function(column) {
        if (column.isHeaderGroup) {
            var columns = column.getItems().items,
                ln = columns.length,
                i;

            for (i = 0; i < ln; i++) {
                Ext.Array.remove(this.columns, columns[i]);
                this.fireEvent('columnremove', this, columns[i]);
            }
        } else {
            Ext.Array.remove(this.columns, column);
            this.fireEvent('columnremove', this, column);
        }

        this.callParent(arguments);
    },

    onHeaderTap: function(column) {
        if (!column.getIgnore()) {
            var sortDirection = column.getSortDirection() || 'DESC',
                newDirection = (sortDirection === 'DESC') ? 'ASC' : 'DESC';

            column.setSortDirection(newDirection);
        }

        this.fireEvent('columntap', this, column);
    },

    onColumnShow: function(column) {
        this.fireEvent('columnshow', this, column);
    },

    onColumnHide: function(column) {
        this.fireEvent('columnhide', this, column);
    },

    onColumnResize: function(column, width) {
        this.fireEvent('columnresize', this, column, width);
    },

    onColumnSort: function(column, direction, newDirection) {
        if (direction !== null) {
            this.fireEvent('columnsort', this, column, direction, newDirection);
        }
    },

    scrollTo: function(x) {
        switch (Ext.browser.getPreferredTranslationMethod({translationMethod: this.getTranslationMethod()})) {
            case 'scrollposition':
                console.log('todo');
                break;
            case 'csstransform':
                this.innerElement.translate(x, 0);
                break;
        }
    }
});