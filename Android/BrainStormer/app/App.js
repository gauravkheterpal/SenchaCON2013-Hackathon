var imageURL1 = null;
Ext.application({
    name: "NotesApp",

    models: ["Note"],//,"Friend"
    stores: ["Notes"],//,"Friend"
    controllers: ["NotesController"],//, "Draw"
    views: ["NotesList", "NotesListContainer", "NoteEditor"],//,"FriendList","Editor","Canvas", "DrawEditor", "MainView", "ViewPanel"

    launch: function () {

        var notesListContainer = {
            xtype: "noteslistcontainer"
        };
        var noteEditor = {
            xtype: "noteeditor"
        };
        /*var canvas={
        	xtype:"canvas"	
        };
        var drawEditor={
            	xtype:"editor"	
            };
        var friendList={
        		xtype:"friendlist"
        };*/
      /* var mainView={
        		xtype:"mainview"
        };*/
            
        Ext.Viewport.add([notesListContainer, noteEditor/*, canvas, drawEditor, viewPanel*/]);//, mainView

    }
});