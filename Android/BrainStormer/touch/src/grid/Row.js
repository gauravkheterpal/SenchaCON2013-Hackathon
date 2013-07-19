/**
 * Description
 */
Ext.define('Ext.grid.Row', {
    extend: 'Ext.Component',
    xtype: 'gridrow',

    config: {
        baseCls: Ext.baseCSSPrefix + 'grid-row',
        grid: null
    },

    constructor: function() {
        this.cells = [];
        this.columnMap = {};
        this.callParent(arguments);
    },

    updateGrid: function(grid) {
        var me = this,
            i, columns, ln;

        me.element.innerHTML = '';
        me.cells = [];

        if (grid) {
            columns = grid.getColumns();
            for (i = 0, ln = columns.length; i < ln; i++) {
                me.addColumn(columns[i]);
            }
        }
    },

    addColumn: function(column) {
        this.insertColumn(this.cells.length, column);
    },

    insertColumn: function(index, column) {
        var me = this,
            element = me.element,
            cells = me.cells,
            columnMap = me.columnMap,
            cell = me.createCell(index),
            beforeCell = me.cells[index],
            cellCls = column.getCellCls();

        cell.$column = column;
        cell.style.width = column.getWidth() + 'px';

        if (column.isHidden()) {
            cell.style.display = 'none';
        }

        if (cellCls) {
            Ext.get(cell).addCls(cellCls);
        }

        if (beforeCell) {
            cell.insertBefore(beforeCell);
            Ext.Array.insert(cells, index, cell);
        } else {
            element.appendChild(cell);
            cells.push(cell);
        }

        columnMap[column.getId()] = cell;
    },

    removeColumn: function(column) {
        var me = this,
            columnMap = me.columnMap,
            element = me.element,
            cell = columnMap[column.getId()];

        delete cell.$column;
        if (cell) {
            element.removeChild(cell);
        }

        Ext.Array.remove(me.cells, cell);
    },

    updateRecord: function(record) {
        var me = this,
            cells = me.cells,
            i, ln, cell, column;

        for (i = 0, ln = cells.length; i < ln; i++) {
            cell = cells[i];
            column = me.getColumnByCell(cell);
            column.updateCell(cell, record);
        }
    },

    setColumnWidth: function(column, width) {
        var cell = this.getCellByColumn(column);
        if (cell) {
            cell.style.width = width + 'px';
        }
    },

    showColumn: function(column) {
        var cell = this.getCellByColumn(column);
        if (cell) {
            cell.style.display = '';
        }
    },

    hideColumn: function(column) {
        var cell = this.getCellByColumn(column);
        if (cell) {
            cell.style.display = 'none';
        }
    },

    getCellByColumn: function(column) {
        return this.columnMap[column.getId()];
    },

    getColumnByCell: function(cell) {
        return cell.$column;
    },

    createCell: function() {
        var prototype = this.self.prototype,
            renderTemplate, elements, element, i, ln;

        if (!prototype.hasOwnProperty('cellRenderTemplate')) {
            prototype.cellRenderTemplate = renderTemplate = document.createDocumentFragment();
            renderTemplate.appendChild(Ext.Element.create(this.getCellElementConfig(), true));

            elements = renderTemplate.querySelectorAll('[id]');

            for (i = 0, ln = elements.length; i < ln; i++) {
                element = elements[i];
                element.removeAttribute('id');
            }
        }

        return prototype.cellRenderTemplate.cloneNode(true).firstChild;
    },

    getCellElementConfig: function() {
        var config = {
                tag: 'div',
                cls: Ext.baseCSSPrefix + 'grid-cell',
                html: '&nbsp;'
            };

        return config;
    }
});