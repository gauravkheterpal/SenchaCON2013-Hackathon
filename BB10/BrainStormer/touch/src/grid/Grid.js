/**
 * Description
 */
Ext.define('Ext.grid.Grid', {
    extend: 'Ext.List',

    requires: [
        'Ext.grid.Row',
        'Ext.grid.column.Column',
        'Ext.grid.column.Date',
        'Ext.grid.column.Template',
        'Ext.grid.HeaderContainer',
        'Ext.grid.HeaderGroup',
        'Ext.TitleBar',
        'Ext.MessageBox'
    ],

    xtype: 'grid',

    config: {
        defaultType: 'gridrow',
        infinite: true,

        /**
         * @cfg {Ext.grid.column.Column[]} columns (required)
         * An array of column definition objects which define all columns that appear in this grid.
         * Each column definition provides the header text for the column, and a definition of where
         * the data for that column comes from.
         *
         * This can also be a configuration object for a {Ext.grid.header.Container HeaderContainer}
         * which may override certain default configurations if necessary. For example, the special
         * layout may be overridden to use a simpler layout, or one can set default values shared
         * by all columns:
         *
         *      columns: {
         *          items: [
         *              {
         *                  text: "Column A"
         *                  dataIndex: "field_A"
         *              },{
         *                  text: "Column B",
         *                  dataIndex: "field_B"
         *              },
         *              ...
         *          ],
         *          defaults: {
         *              flex: 1
         *          }
         *      }
         *
         */
        columns: null,

        /**
         * @cfg baseCls
         * @inheritdoc
         */
        baseCls: Ext.baseCSSPrefix + 'grid',

        useHeaders: false,
        itemHeight: 60,
        variableHeights: false,

        headerContainer: {
            xtype: 'headercontainer'
        },

        striped: true,

        itemCls: Ext.baseCSSPrefix + 'list-item',
        scrollToTopOnRefresh: false,

        titleBar: {
            xtype: 'titlebar',
            docked: 'top'
        },
        title: ''
    },

    platformConfig: [{
        theme: ['Windows'],
        itemHeight: 60
    }],

    beforeInitialize: function() {
        this.container = Ext.factory({
            xtype: 'container',
            scrollable: {
                scroller: {
                    autoRefresh: false,
                    direction: 'auto',
                    directionLock: true
                }
            }
        });

        this.callParent();
    },

    initialize: function() {
        var me = this,
            titleBar = me.getTitleBar(),
            headerContainer = me.getHeaderContainer();

        me.callParent();

        if (titleBar) {
            me.container.add(me.getTitleBar());
        }
        me.container.doAdd(headerContainer);

        me.scrollElement.addCls(Ext.baseCSSPrefix + 'grid-scrollelement');
    },

    onTranslate: function(x) {
        this.callParent(arguments);
        this.getHeaderContainer().scrollTo(x);
    },

    applyTitleBar: function(titleBar) {
        if (titleBar && !titleBar.isComponent) {
            titleBar = Ext.factory(titleBar, Ext.TitleBar);
        }
        return titleBar;
    },

    updateTitle: function(title) {
        this.getTitleBar().setTitle(title);
    },

    applyHeaderContainer: function(headerContainer) {
        if (headerContainer && !headerContainer.isComponent) {
            headerContainer = Ext.factory(headerContainer, Ext.grid.HeaderContainer);
        }
        return headerContainer;
    },

    updateHeaderContainer: function(headerContainer, oldHeaderContainer) {
        var me = this;

        if (oldHeaderContainer) {
            oldHeaderContainer.un({
                columnsort: 'onColumnSort',
                columnresize: 'onColumnResize',
                columnshow: 'onColumnShow',
                columnhide: 'onColumnHide',
                columnadd: 'onColumnAdd',
                columnremove: 'onColumnRemove',
                scope: me
            });
        }

        if (headerContainer) {
            headerContainer.on({
                columnsort: 'onColumnSort',
                columnresize: 'onColumnResize',
                columnshow: 'onColumnShow',
                columnhide: 'onColumnHide',
                columnadd: 'onColumnAdd',
                columnremove: 'onColumnRemove',
                scope: me
            });
        }
    },

    addColumn: function(column) {
        this.getHeaderContainer().add(column);
    },

    removeColumn: function(column) {
        this.getHeaderContainer().remove(column);
    },

    insertColumn: function(index, column) {
        this.getHeaderContainer().insert(index, column);
    },

    onColumnAdd: function(container, column) {
        if (this.isPainted()) {
            var items = this.listItems,
                ln = items.length,
                i, row;

            for (i = 0; i < ln; i++) {
                row = items[i];
                row.insertColumn(container.indexOf(column), column);
            }

            this.updateTotalColumnWidth();
        }
    },

    onColumnRemove: function(container, column) {
        if (this.isPainted()) {
            var items = this.listItems,
                ln = items.length,
                i, row;

            for (i = 0; i < ln; i++) {
                row = items[i];
                row.removeColumn(column);
            }

            this.updateTotalColumnWidth();
        }
    },

    updateColumns: function(columns) {
        if (columns && columns.length) {
            var ln = columns.length,
                i;

            for (i = 0; i < ln; i++) {
                this.addColumn(columns[i]);
            }

            this.updateTotalColumnWidth();
        }
    },

    getColumns: function() {
        return this.getHeaderContainer().getColumns();
    },

    onColumnResize: function(container, column, width) {
        var items = this.listItems,
            ln = items.length,
            i, row;

        for (i = 0; i < ln; i++) {
            row = items[i];
            row.setColumnWidth(column, width);
        }
        this.updateTotalColumnWidth();
    },

    onColumnShow: function(container, column) {
        var items = this.listItems,
            ln = items.length,
            i, row;

        this.updateTotalColumnWidth();
        for (i = 0; i < ln; i++) {
            row = items[i];
            row.showColumn(column);
        }
    },

    onColumnHide: function(container, column) {
        var items = this.listItems,
            ln = items.length,
            i, row;

        for (i = 0; i < ln; i++) {
            row = items[i];
            row.hideColumn(column);
        }
        this.updateTotalColumnWidth();
    },

    onColumnSort: function(container, column, direction) {
        if (this.sortedColumn && this.sortedColumn !== column) {
            this.sortedColumn.setSortDirection(null);
        }
        this.sortedColumn = column;

        this.getStore().sort(column.getDataIndex(), direction);
    },

    updateTotalColumnWidth: function() {
        var me = this,
            columns = me.getColumns(),
            ln = columns.length,
            totalWidth = 0,
            scroller = me.getScrollable().getScroller(),
            i, column;

        for (i = 0; i < ln; i++) {
            column = columns[i];
            if (!column.isHidden()) {
                totalWidth += column.getWidth();
            }
        }

        me.scrollElement.setWidth(totalWidth);

        scroller.setSize({
            x: totalWidth,
            y: scroller.getSize().y
        });
        scroller.refresh();
    },

    setScrollerHeight: function(height) {
        var me = this,
            scroller = me.container.getScrollable().getScroller();

        if (height != scroller.givenSize.y) {
            scroller.setSize({
                x: scroller.givenSize.x,
                y: height
            });
            scroller.refresh();
        }
    },

    createItem: function(config) {
        var me = this,
            container = me.container,
            listItems = me.listItems,
            item;

        config.grid = me;
        item = Ext.factory(config);
        item.dataview = me;
        item.$height = config.minHeight;

        container.doAdd(item);
        listItems.push(item);

        return item;
    }
});