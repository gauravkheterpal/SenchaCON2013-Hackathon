var mainControl = undefined;
Ext.define("NotesApp.controller.NotesController", {

    extend: "Ext.app.Controller",
    config: {
        refs: {
            // We're going to lookup our views by xtype.
            notesListContainer: "noteslistcontainer",
            noteEditor: "noteeditor",
            photoButton: 'button[id=photobutton]',
        },
        control: {
            notesListContainer: {
                // The commands fired by the notes list container.
                newNoteCommand: "onNewNoteCommand",
                editNoteCommand: "onEditNoteCommand"
            },
            noteEditor: {
                // The commands fired by the note editor.
                saveNoteCommand: "onSaveNoteCommand",
                deleteNoteCommand: "onDeleteNoteCommand",
                backToHomeCommand: "onBackToHomeCommand",
                onShareCommand:"onShareCommand",
                takePhotoCommand:"onTakePhotoCommand"
            },
            photoButton: {
            	tap: "onPhotoButtonTap",
            }

        }
    },
    // Transitions
    slideLeftTransition: { type: 'slide', direction: 'left' },
    slideRightTransition: { type: 'slide', direction: 'right' },
    
    // Helper functions
    getRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    activateNoteEditor: function (record) {

        var noteEditor = this.getNoteEditor();
        noteEditor.setRecord(record); // load() is deprecated.
        Ext.Viewport.animateActiveItem(noteEditor, this.slideLeftTransition);
    },
    activateNotesList: function () {
        Ext.Viewport.animateActiveItem(this.getNotesListContainer(), this.slideRightTransition);
    },
   /* activateMainView: function () {
        Ext.Viewport.animateActiveItem(this.getMainView(), this.slideRightTransition);
    },*/

    // Commands.
    onNewNoteCommand: function () {

        console.log("onNewNoteCommand");

        var now = new Date();
        var noteId = (now.getTime()).toString() + (this.getRandomInt(0, 100)).toString();

        var newNote = Ext.create("NotesApp.model.Note", {
            id: noteId,
            dateCreated: now,
            title: "",
            narrative: "",
            image:""
        });

        this.activateNoteEditor(newNote); 
     
    },
    onEditNoteCommand: function (list, record) {

        console.log("onEditNoteCommand");

        this.activateNoteEditor(record);
    },
    onDrawCommand: function () {

        console.log("onDrawCommand");

        //this.activateMainView();
    },
    onSaveNoteCommand: function () {

        console.log("onSaveNoteCommand");

        var noteEditor = this.getNoteEditor();

        var currentNote = noteEditor.getRecord();
        var newValues = noteEditor.getValues();

        // Update the current note's fields with form values.
        currentNote.set("title", newValues.title);
        currentNote.set("narrative", newValues.narrative);
        currentNote.set("image", newValues.imageURL1);
        var errors = currentNote.validate();

        if (!errors.isValid()) {
            Ext.Msg.alert('Wait!', errors.getByField("title")[0].getMessage(), Ext.emptyFn);
            currentNote.reject();
            return;
        }

        var notesStore = Ext.getStore("Notes");

        if (null == notesStore.findRecord('id', currentNote.data.id)) {
            notesStore.add(currentNote);
        }

        notesStore.sync();

        notesStore.sort([{ property: 'dateCreated', direction: 'DESC'}]);

        this.activateNotesList();
    }, 
    onDeleteNoteCommand: function () {

        console.log("onDeleteNoteCommand");

        var noteEditor = this.getNoteEditor();
        var currentNote = noteEditor.getRecord();
        var notesStore = Ext.getStore("Notes");

        notesStore.remove(currentNote);
        notesStore.sync();

        this.activateNotesList();
    }, 
    onBackToHomeCommand: function () {

        console.log("onBackToHomeCommand");
        this.activateNotesList();
    },
    onShareCommand: function(){
        //debugger;
        var noteEditor = this.getNoteEditor();

           var currentNote = noteEditor.getRecord();
           var newValues = noteEditor.getValues();
           var image = new Array();
           console.log('Image URI==' + newValues.image);
           image.push(newValues.image);
        window.plugins.emailComposer.showEmailComposer("Meeting Notes - " + newValues.title, newValues.narrative, '','','',false,image);
        
       },
       onPhotoButtonTap: function(button, e, options) {
    	navigator.camera.getPicture(onSuccess, onFail, { quality: 50, 
    	    destinationType: Camera.DestinationType.FILE_URI }); 
    
    	
    	function onSuccess(imageURI) {
    		 console.log("takePhotoCommand");
    	        //this.fireEvent("takePhotoCommand", this, imageURI);
    	   //this.fireEvent("takePhotoCommand", this);
    	   /* var noteEditor = this.getNoteEditor();
    	    var currentNote = noteEditor.getRecord();
    	    currentNote.set("image",newValues.imageURI);
    	    var notesStore = Ext.getStore("Notes");
            if (null == notesStore.findRecord('id', currentNote.data.id)) {
                notesStore.add(currentNote);*/
                console.log('Image URI==' + imageURI);
    	   var image = document.getElementById('image1');
    	   image.setAttribute('src', imageURI);
    	   
    	   var noteEditor = mainControl.getNoteEditor();

        var currentNote = noteEditor.getRecord();
        var newValues = noteEditor.getValues();
        currentNote.set("image", imageURI);
        var notesStore = Ext.getStore("Notes");
            notesStore.sync();
    	};

    	function onFail() {
    	    alert('Failed to load the camera');
    	};
    },
       onTakePhotoCommand:function(imageURI){
    	   //debugger;
    	   
    	   console.log('Image URI==' + imageURI);
    	   var image = document.getElementById('image1');
    	   image.setAttribute('src', imageURI);
    	   
    	   var noteEditor = this.getNoteEditor();

        var currentNote = noteEditor.getRecord();
        var newValues = noteEditor.getValues();
        currentNote.set("image", imageURI);
   	    //image.setsrc(imageURI);
   	    //alert(image.getSrc());
   	    //imageURL1=imageURI;
   	    //alert(imageURL1);
       },

    // Base Class functions.
    launch: function () {
        this.callParent(arguments);
        Ext.getStore("Notes").load();
        console.log("launch");
		mainControl = this;
    },
    init: function () {
        this.callParent(arguments);
        console.log("init");
    }
});