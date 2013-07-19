Ext.define("NotesApp.view.NotesList", {
    extend: "Ext.dataview.List",
    alias: "widget.noteslist",
    config: {
        loadingText: "Loading Notes...",
        emptyText: "<div class=\"notes-list-empty-text\">No notes found.</div>",
        onItemTap: true,
        itemTpl: "<div class=\"list-item-title\">{title}</div><div class=\"list-item-narrative\">{narrative}</div>"        
    }
});