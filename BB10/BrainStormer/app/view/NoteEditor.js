Ext.define("NotesApp.view.NoteEditor", {
    extend: "Ext.form.Panel",
    requires: ("Ext.form.FieldSet","Ext.device.Camera"),
    alias: "widget.noteeditor",
    config: {
        scrollable: 'vertical'
    },
    initialize: function () {

        this.callParent(arguments);

        var backButton = {
            xtype: "button",
            ui: "back",
            text: "Home",
            handler: this.onBackButtonTap,
            scope: this
        };
        var image1={
        	xtype:'image',
        	 name: 'image1',
        	 id:'image1',
        	height:100,
        	width:200,   	
        };
        
        var saveButton = {
            xtype: "button",
            ui: "action",
            text: "Save",
            handler: this.onSaveButtonTap,
            scope: this
        };

        var topToolbar = {
            xtype: "toolbar",
            docked: "top",
            title: "Edit Note",
            items: [
                backButton,
                { xtype: "spacer" },
                saveButton
            ]
        };

        var deleteButton = {
            xtype: "button",
            iconCls: "trash",
            iconMask: true,
            handler: this.onDeleteButtonTap,
            scope: this
        };
        var shareButton = {
                xtype: "button",
                text: "Share",
                handler: this.onShareButtonTap,
                scope: this
               };
        var photoButton = {
                xtype: "button",
                id: 'photobutton',
                //iconCls: "trash",
                text:'Take a Photo',
                iconMask: true,
                //handler: this.onPhotoButtonTap,
                //scope: this
            };
        var bottomToolbar = {
                xtype: "toolbar",
                docked: "bottom",
                items: [
                    deleteButton,
                    {xtype:'spacer'},
                    shareButton,
                    {xtype:'spacer'},
                    photoButton
                ]
            };
        function onSuccess(imageURI) {
    	    var image = document.getElementById('image1');
    	    image.src = imageURI;
    	};

    	function onFail() {
    	    alert('Failed to load the camera');
    	};

        var noteTitleEditor = {
            xtype: 'textfield',
            name: 'title',
            label: 'Title',
            required: true
        };
        var noteImage = {
                xtype: 'textfield',
                name: 'image',
                label: 'URL',
                required: true
            };
	    
	    var video = {
                xtype: 'panel',
		html:'<canvas id="canvas"></canvas><video id="video" style="display: none;" autoplay></video>'
            };

        var noteNarrativeEditor = {
            xtype: 'textareafield',
            name: 'narrative',
            label: 'Narrative',
            
            
        };
	

        this.add([
            topToolbar,
            { xtype: "fieldset",
                items: [noteTitleEditor, noteNarrativeEditor,image1,video]
            },
            bottomToolbar
        ]);
    },
    onSaveButtonTap: function () {
        console.log("saveNoteCommand");
        this.fireEvent("saveNoteCommand", this);
    },
    onDrawButtonTap: function () {
        console.log("DrawCommand");
        this.fireEvent("drawCommand", this);
    },
    onDeleteButtonTap: function () {
        console.log("deleteNoteCommand");
        this.fireEvent("deleteNoteCommand", this);
    },
    onBackButtonTap: function () {
        console.log("backToHomeCommand");
        this.fireEvent("backToHomeCommand", this);
    },
    
    onShareButtonTap: function(){
        console.log("onShareCommand");
        this.fireEvent("onShareCommand", this);
      }
    });

