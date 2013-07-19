var imageURL1 = null;
Ext.application({
    name: "NotesApp",

    models: ["Note"],
    stores: ["Notes"],
    controllers: ["NotesController"],
    views: ["NotesList", "NotesListContainer", "NoteEditor"],

    launch: function () {

        var notesListContainer = {
            xtype: "noteslistcontainer"
        };
        var noteEditor = {
            xtype: "noteeditor"
        };
       
            
        Ext.Viewport.add([notesListContainer, noteEditor]);

    }
});