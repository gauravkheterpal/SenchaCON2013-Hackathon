Ext.define("NotesApp.store.Notes", {
    extend: "Ext.data.Store",
    requires: "Ext.data.proxy.LocalStorage",
    config: {
        model: "NotesApp.model.Note",
        proxy: {
            type: 'localstorage',
            id: 'notes-app-store'
        },
        sorters: [{ property: 'dateCreated', direction: 'DESC'}]
    }
});
