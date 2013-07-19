/**
 * @class Ext.grid.plugin.PagingToolbar
 * @extends Ext.Component
 * Description
 */
Ext.define('Ext.grid.plugin.PagingToolbar', {
    extend: 'Ext.Component',
    xtype: 'gridpagingtoolbar',

    mixins: ['Ext.mixin.Bindable'],

    requires: [
        'Ext.Toolbar'
    ],

    config: {
        grid: null,

        currentPage: 1,
        totalPages: 0,
        pageSize: 0,
        totalCount: 0,

        toolbar: {
            xtype: 'toolbar',
            docked: 'bottom',
            ui: 'gray',
            cls: Ext.baseCSSPrefix + 'grid-pagingtoolbar',
            items: [{
                xtype: 'button',
                ui: 'plain',
                iconCls: 'arrow_left',
                action: 'previouspage'
            }, {
                xtype: 'component',
                role: 'currentpage',
                width: 20,
                cls: Ext.baseCSSPrefix + 'grid-pagingtoolbar-currentpage'
            }, {
                xtype: 'component',
                role: 'totalpages',
                width: 50,
                tpl: '&nbsp;/ {totalPages}'
            }, {
                xtype: 'sliderfield',
                value: 0,
                flex: 1,
                minValue: 1,
                role: 'pageslider'
            }, {
                xtype: 'button',
                ui: 'plain',
                iconCls: 'arrow_right',
                action: 'nextpage'
            }]
        }
    },

    init: function(grid) {
        this.setGrid(grid);
        grid.container.add(this.getToolbar());
        if (grid.getStore().getCount()) {
            this.updateCurrentPage(this.getCurrentPage());
        }
    },

    updateGrid: function(grid, oldGrid) {
        if (oldGrid) {
            oldGrid.un({
                updatevisiblecount: 'onUpdateVisibleCount',
                scope: this
            });

            oldGrid.getStore().un({
                addrecords: 'onTotalCountChange',
                removerecords: 'onTotalCountChange',
                refresh: 'onTotalCountChange',
                scope: this
            });
        }

        if (grid) {
            grid.on({
                updatevisiblecount: 'onUpdateVisibleCount',
                scope: this
            });

            grid.getStore().on({
                addrecords: 'onTotalCountChange',
                removerecords: 'onTotalCountChange',
                refresh: 'onTotalCountChange',
                scope: this
            });

            this.bind(grid, 'onScrollBinder', 'checkPageChange');
        }
    },

    checkPageChange: function() {
        var grid = this.getGrid(),
            pageSize = this.getPageSize(),
            currentPage = this.getCurrentPage(),
            totalCount = this.getTotalCount(),
            topVisibleIndex = grid.topVisibleIndex,
            newPage = Math.floor(grid.topVisibleIndex / pageSize) + 1;

        if (topVisibleIndex + pageSize >= totalCount) {
            newPage++;
        }

        if (topVisibleIndex && newPage !== currentPage) {
            this.preventGridScroll = true;
            this.setCurrentPage(newPage);
            this.preventGridScroll = false;
        }
    },

    applyToolbar: function(toolbar) {
        if (toolbar && !toolbar.isComponent) {
            toolbar = Ext.factory(toolbar, Ext.Toolbar);
        }

        return toolbar;
    },

    updateToolbar: function(toolbar) {
        if (toolbar) {
            this.currentPage = toolbar.down('component[role=currentpage]');
            this.totalPages = toolbar.down('component[role=totalpages]');
            this.pageSlider = toolbar.down('sliderfield[role=pageslider]');

            this.nextPageButton = toolbar.down('button[action=nextpage]');
            this.previousPageButton = toolbar.down('button[action=previouspage]');

            this.pageSlider.on({
                change: 'onPageChange',
                drag: 'onPageSliderDrag',
                scope: this
            });

            this.nextPageButton.on({
                tap: 'onNextPageTap',
                scope: this
            });

            this.previousPageButton.on({
                tap: 'onPreviousPageTap',
                scope: this
            });

            this.currentPage.element.createChild({
                tag: 'span'
            });
        }
    },

    onPageChange: function(field, slider, thumb, page) {
        if (page !== this.getCurrentPage()) {
            this.setCurrentPage(page);
        }
    },

    onPageSliderDrag: function(field, slider, thumb, page) {
        if (page[0] !== this.getCurrentPage()) {
            this.setCurrentPage(page[0]);
        }
    },

    onNextPageTap: function() {
        var nextPage = this.getCurrentPage() + 1;
        if (nextPage <= this.getTotalPages()) {
            this.setCurrentPage(nextPage);
        }
    },

    onPreviousPageTap: function() {
        var previousPage = this.getCurrentPage() - 1;
        if (previousPage > 0) {
            this.setCurrentPage(previousPage);
        }
    },

    onTotalCountChange: function(store) {
        this.setTotalCount(store.getCount());
    },

    onUpdateVisibleCount: function(grid, visibleCount) {
        visibleCount -= 1;

        var store = grid.getStore(),
            totalCount = store.getCount(),
            totalPages = Math.ceil(totalCount / visibleCount);

        this.setTotalPages(totalPages);
        this.setPageSize(visibleCount);
    },

    updateTotalPages: function(totalPages) {
        // Ensure the references are set
        this.getToolbar();

        this.totalPages.setData({
            totalPages: totalPages
        });

        this.pageSlider.setMaxValue(totalPages);

        this.updateCurrentPage(this.getCurrentPage());
    },

    updateCurrentPage: function(currentPage) {
        var grid = this.getGrid();

        // Ensure the references are set
        this.getToolbar();

        this.currentPage.element.dom.firstChild.innerHTML = currentPage;

        if (this.pageSlider.getValue() !== currentPage) {
            this.pageSlider.setValue(currentPage);
        }

        if (grid && !this.preventGridScroll) {
            grid.scrollToRecord(this.getPageTopRecord(currentPage));
        }

        this.updatePageButtons();
    },

    updateTotalCount: function(totalCount) {
        if (totalCount) {
            var totalPages = Math.ceil(totalCount / this.getPageSize());
            this.setTotalPages(totalPages);
        }
    },

    updatePageButtons: function() {
        var currentPage = this.getCurrentPage();

        this.previousPageButton.enable();
        this.nextPageButton.enable();

        if (currentPage == this.getTotalPages()) {
            this.nextPageButton.disable();
        }
        else if (currentPage == 1) {
            this.previousPageButton.disable();
        }
    },

    getPageTopRecord: function(page) {
        var store = this.getGrid().getStore(),
            pageSize = this.getPageSize(),
            pageTopRecordIndex = (page - 1) * pageSize,
            pageTopRecord = store.getAt(pageTopRecordIndex);

        return pageTopRecord;
    }
});