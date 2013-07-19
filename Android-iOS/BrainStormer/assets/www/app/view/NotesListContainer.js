Ext.define("NotesApp.view.NotesListContainer", {
    extend: "Ext.Container",
    alias: "widget.noteslistcontainer",

    initialize: function () {

        this.callParent(arguments);

        var newButton = {
            xtype: "button",
            text: 'New',
            ui: 'action',
            handler: this.onNewButtonTap,
            scope: this
        };

        var topToolbar = {
            xtype: "toolbar",
            title: 'My Meeting Notes',
            docked: "top",
            items: [
                { xtype: 'spacer' },
                newButton
            ]
        };

        var notesList = {
            xtype: "noteslist",
            store: Ext.getStore("Notes"),
            listeners: {
                itemtap: { fn: this.onNotesListDisclose, scope: this }
            }
        };

        this.add([topToolbar, notesList]);
    },
    onNewButtonTap: function () {
        console.log("newNoteCommand");
        this.fireEvent("newNoteCommand", this);
    },
    onNotesListDisclose: function(dv, index, item, record) {
        console.log("editNoteCommand");
        this.fireEvent('editNoteCommand', this, record);
    },
    config: {
        layout: {
            type: 'fit'
        }
    }
});