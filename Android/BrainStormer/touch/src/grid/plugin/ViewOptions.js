/**
 * @class Ext.grid.plugin.ViewOptions
 * @extends Ext.Component
 * Description
 */
Ext.define('Ext.grid.plugin.ViewOptions', {
    extend: 'Ext.Component',
    alias: 'widget.gridviewoptions' ,

    requires: [
        'Ext.field.Toggle',
        'Ext.plugin.SortableList'
    ],

    config: {
        /**
         * @private
         */
        grid: null,

        sheetWidth: 320,

        sheet: {
            baseCls: Ext.baseCSSPrefix + 'grid-viewoptions',
            xtype: 'sheet',
            items: [{
                docked: 'top',
                xtype: 'titlebar',
                title: 'Customize',
                items: {
                    xtype: 'button',
                    text: 'Done',
                    ui: 'action',
                    align: 'right',
                    role: 'donebutton'
                }
            }],
            hideOnMaskTap: false,
            enter: 'right',
            exit: 'right',
            modal: false,
            translatable: true,
            right: 0,
            layout: 'fit',
            stretchY: true
        },

        columnList: {
            xtype: 'list',
            plugins: [{
                type: 'sortablelist',
                handleSelector: '.x-column-sortablehandle'
            }],
            mode: 'MULTI',
            infinite: true,
            itemTpl: '<div class="x-column-sortablehandle"></div>{text}<div class="x-column-visibleindicator"></div>',
            bufferSize: 1,
            minimumBufferSize: 1,
            store: {
                fields: ['text']
            }
        }
    },

    sheetVisible: false,

    init: function(grid) {
        this.setGrid(grid);
        grid.add(this.getSheet());

        this.getSheet().down('button[role=donebutton]').on({
            tap: 'onDoneButtonTap',
            scope: this
        });
    },

    updateGrid: function(grid, oldGrid) {
        if (oldGrid) {
            oldGrid.getHeaderContainer().renderElement.un({
                dragstart: 'onDragStart',
                drag: 'onDrag',
                dragend: 'onDragEnd',
                scope: this
            });
            oldGrid.getHeaderContainer().un({
                columnadd: 'onColumnAdd',
                columnremove: 'onColumnRemove',
                scope: this
            });
        }

        if (grid) {
            grid.getHeaderContainer().renderElement.on({
                dragstart: 'onDragStart',
                drag: 'onDrag',
                dragend: 'onDragEnd',
                scope: this
            });
            grid.getHeaderContainer().on({
                columnadd: 'onColumnAdd',
                columnremove: 'onColumnRemove',
                scope: this
            });
        }
    },

    applySheet: function(sheet) {
        if (sheet && !sheet.isComponent) {
            sheet = Ext.factory(sheet, Ext.Sheet);
        }

        return sheet;
    },

    applyColumnList: function(list) {
        if (list && !list.isComponent) {
            list = Ext.factory(list, Ext.Container);
        }
        return list;
    },

    updateSheet: function(sheet) {
        var sheetWidth = this.getSheetWidth();
        sheet.setWidth(sheetWidth);
        sheet.translate(sheetWidth);

        sheet.add(this.getColumnList());
    },

    updateColumnList: function(list) {
        if (list) {
            list.on({
                selectionchange: 'onColumnToggle',
                scope: this
            });
        }
    },

    onDoneButtonTap: function() {
        this.hideViewOptions();
    },

    onColumnToggle: function(list, change) {
        var toggleRecord = change[0],
            column = Ext.getCmp(toggleRecord.get('id'));

        if (list.isSelected(toggleRecord)) {
            column.show();
        } else {
            column.hide();
        }
    },

    onColumnAdd: function(headerContainer, column) {
        var list = this.getColumnList(),
            store = list.getStore(),
            record;

        if (column.getIgnore()) {
            return;
        }

        record = store.add({
            id: column.getId(),
            text: column.getText()
        });

        if (!column.isHidden()) {
            list.select(record, true, true);
        }
    },

    onColumnRemove: function(headerContainer, column) {
        if (column.getIgnore()) {
            return;
        }

        var columns = this.getColumnList().items,
            ln = columns.length,
            i, item;

        for (i = 0; i < ln; i++) {
            item = columns[i];
            if (item.column === column) {
                Ext.Array.remove(columns, item);
                break;
            }
        }
    },

    onDragStart: function() {
        var sheetWidth = this.getSheetWidth(),
            sheet = this.getSheet();

        if (!this.sheetVisible) {
            sheet.translate(sheetWidth);
            this.startTranslate = sheetWidth;
        } else {
            sheet.translate(0);
            this.startTranslate = 0;
        }
    },

    onDrag: function(e) {
        this.getSheet().translate(Math.max(this.startTranslate + e.deltaX, 0));
    },

    onDragEnd: function(e) {
        var me = this;
        if (e.flick.velocity.x > 0.1) {
            me.hideViewOptions();
        } else {
            me.showViewOptions();
        }
    },

    hideViewOptions: function() {
        var sheet = this.getSheet();

        sheet.translate(this.getSheetWidth(), 0, {duration: 100});
        sheet.getTranslatable().on('animationend', function() {
            if (sheet.getModal()) {
                sheet.getModal().destroy();
                sheet.setModal(null);
            }
        }, this, {single: true});

        this.sheetVisible = false;
    },

    showViewOptions: function() {
        if (!this.sheetVisible) {
            var sheet = this.getSheet(),
                modal = null;

            sheet.translate(0, 0, {duration: 100});
            sheet.getTranslatable().on('animationend', function() {
                sheet.setModal(true);

                modal = sheet.getModal();
                modal.element.onBefore({
                    tap: 'hideViewOptions',
                    dragstart: 'onDragStart',
                    drag: 'onDrag',
                    dragend: 'onDragEnd',
                    scope: this
                });
            }, this, {single: true});

            this.sheetVisible = true;
        }
    }
});